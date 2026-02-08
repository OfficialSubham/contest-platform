import "dotenv/config";

import express from "express";
import { LoginSchema, UserSchema } from "./validation/UserSchema";
import { compare, hash } from "bcryptjs";
import { prisma } from "./prisma/prisma";
import jwt from "jsonwebtoken";
import { veryifyUser } from "./middlewares/verifyUser";
import { requireRole } from "./middlewares/requireRole";
import {
    ContestId,
    ContestSchema,
    DsaSchema,
    DsaSolutionSchema,
    McqSchema,
    problemID,
    SubmitMcqSchema,
} from "./validation/Contests";
import { codeResult } from "./lib/utils";
import { normalize } from "node:path";

const app = express();

const PORT = process.env.PORT || 3000;
const SALT = process.env.SALT || 10;
const JWT_SECRET = process.env.JWT_SECRET || "";

const { sign } = jwt;

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(201).json({
        message: "Working",
    });
});

app.post("/api/auth/signup", async (req, res) => {
    try {
        const { success, data } = UserSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });
        const hashPassword = await hash(data.password, SALT);
        const user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                role: data.role,
                password: hashPassword,
            },
        });

        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            error: null,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "EMAIL_ALREADY_EXISTS",
        });
    }
});

app.post("/api/auth/login", async (req, res) => {
    const { success, data } = LoginSchema.safeParse(req.body);

    if (!success)
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST",
        });

    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (!user)
        return res.status(401).json({
            success: false,
            data: null,
            error: "INVALID_CREDENTIALS",
        });
    const isPasswordValid = await compare(data.password, user.password);

    if (!isPasswordValid)
        return res.status(401).json({
            success: false,
            data: null,
            error: "INVALID_CREDENTIALS",
        });
    const token = sign(
        {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        JWT_SECRET,
    );
    res.json({
        success: true,
        data: {
            token,
        },
        error: null,
    });
});

app.post("/api/contests", veryifyUser, requireRole("creator"), async (req, res) => {
    const { success, data, error } = ContestSchema.safeParse(req.body);

    if (!success || data.endTime <= data.startTime)
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST",
        });

    const contest = await prisma.contests.create({
        data: {
            title: data.title,
            description: data.description,
            start_time: data.startTime,
            end_time: data.endTime,
            creator_id: req.userId,
        },
    });

    res.status(201).json({
        success: true,
        data: {
            id: contest.id,
            title: contest.title,
            description: contest.description,
            creatorId: contest.creator_id,
            startTime: contest.start_time,
            endTime: contest.end_time,
        },
        error: null,
    });
});

app.get("/api/contests/:contestId", veryifyUser, async (req, res) => {
    const { contestId } = req.params;

    if (isNaN(Number(contestId)))
        return res.status(404).json({
            success: false,
            data: null,
            error: "CONTEST_NOT_FOUND",
        });

    const { success, data } = ContestId.safeParse(contestId);

    if (!success)
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST",
        });

    const contest = await prisma.contests.findUnique({
        where: {
            id: data,
        },
        include: {
            mcqQuestions: {
                select: {
                    id: true,
                    question_text: true,
                    options: true,
                    points: true,
                },
            },
            dsaProblems: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    tags: true,
                    points: true,
                    time_limit: true,
                    memory_limit: true,
                },
            },
        },
    });

    if (!contest)
        return res.status(404).json({
            success: false,
            data: null,
            error: "CONTEST_NOT_FOUND",
        });

    const mcqs = contest.mcqQuestions.map((mcq) => {
        return {
            id: mcq.id,
            questionText: mcq.question_text,
            options: mcq.options,
            points: mcq.points,
        };
    });
    const dsaProblems = contest.dsaProblems.map((dsa) => {
        return {
            id: dsa.id,
            title: dsa.title,
            description: dsa.description,
            tags: dsa.tags,
            points: dsa.points,
            timeLimit: dsa.time_limit,
            memoryLimit: dsa.memory_limit,
        };
    });

    return res.json({
        success,
        data: {
            id: contest.id,
            title: contest.title,
            description: contest.description,
            startTime: contest.start_time,
            endTime: contest.end_time,
            creatorId: contest.creator_id,
            mcqs,
            dsaProblems,
        },
        error: null,
    });
});

app.post(
    "/api/contests/:contestId/mcq",
    veryifyUser,
    requireRole("creator"),
    async (req, res) => {
        const { contestId } = req.params;
        if (isNaN(Number(contestId)))
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND",
            });
        const { success, data } = McqSchema.safeParse(req.body);

        if (!success)
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });
        const contest = await prisma.contests.findUnique({
            where: {
                id: Number(contestId),
            },
        });

        if (!contest)
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND",
            });
        else if (contest.creator_id != req.userId)
            return res.status(403).json({
                success: false,
                data: null,
                error: "FORBIDDEN",
            });

        const mcq = await prisma.mcq_questions.create({
            data: {
                contest_id: contest.id,
                question_text: data.questionText,
                options: data.options,
                correct_option_index: data.correctOptionIndex,
                points: data.points,
            },
        });

        res.status(201).json({
            success,
            data: {
                id: mcq.id,
                contestId: mcq.contest_id,
            },
            error: null,
        });
    },
);

app.post(
    "/api/contests/:contestId/mcq/:questionId/submit",
    veryifyUser,
    requireRole("contestee"),
    async (req, res) => {
        const { contestId, questionId } = req.params;
        if (isNaN(Number(contestId)))
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND",
            });
        else if (isNaN(Number(questionId)))
            return res.status(404).json({
                success: false,
                data: null,
                error: "QUESTION_NOT_FOUND",
            });

        const { success, data } = SubmitMcqSchema.safeParse({
            ...req.body,
            ...req.params,
        });

        if (!success)
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });

        const mcqContestWithQuestion = await prisma.mcq_questions.findUnique({
            where: {
                contest_id: data.contestId,
                id: data.questionId,
            },
            include: {
                contest: true,
                mcqSubmissions: true,
            },
        });
        const currentDate = Date.now();
        if (!mcqContestWithQuestion)
            return res.status(404).json({
                success: false,
                data: null,
                error: "QUESTION_NOT_FOUND",
            });
        else if (currentDate < mcqContestWithQuestion.contest.start_time.getTime())
            return res.status(400).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_ACTIVE",
            });

        const alreadySubmitted = mcqContestWithQuestion.mcqSubmissions.find(
            (mcq) => mcq.user_id == req.userId,
        );
        if (alreadySubmitted)
            return res.status(400).json({
                success: false,
                data: null,
                error: "ALREADY_SUBMITTED",
            });

        const isCorrect =
            mcqContestWithQuestion.correct_option_index == data.selectedOptionIndex;

        const submittedAnswer = await prisma.mcq_submission.create({
            data: {
                is_correct: isCorrect,
                selected_option_index: data.selectedOptionIndex,
                question_id: data.questionId,
                user_id: req.userId,
                points_earned: isCorrect ? mcqContestWithQuestion.points : 0,
            },
        });

        await prisma.contest_leaderboard.upsert({
            where: {
                contestId_userId: {
                    contestId: data.contestId,
                    userId: req.userId,
                },
            },
            update: {
                points: { increment: submittedAnswer.points_earned },
            },
            create: {
                contestId: data.contestId,
                userId: req.userId,
                points: submittedAnswer.points_earned,
            },
        });

        res.status(201).json({
            success: true,
            data: {
                isCorrect: submittedAnswer.is_correct,
                pointsEarned: submittedAnswer.points_earned,
            },
            error: null,
        });
    },
);

app.post(
    "/api/contests/:contestId/dsa",
    veryifyUser,
    requireRole("creator"),
    async (req, res) => {
        const { contestId } = req.params;
        if (isNaN(Number(contestId)))
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND",
            });
        const { success, data, error } = DsaSchema.safeParse({
            ...req.body,
            ...req.params,
        });
        if (!success)
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });

        const contest = await prisma.contests.findUnique({
            where: {
                id: data.contestId,
            },
        });

        if (!contest)
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND",
            });
        else if (contest.creator_id != req.userId)
            return res.status(400).json({
                success: false,
                data: null,
                error: "FORBIDDEN",
            });

        const dsaProblem = await prisma.dsa_problems.create({
            data: {
                title: data.title,
                description: data.description,
                contest_id: data.contestId,
                tags: data.tags,
                memory_limit: data.memoryLimit,
                points: data.points,
                time_limit: data.timeLimit,
            },
        });

        await prisma.test_cases.createMany({
            data: data.testCases.map((t) => {
                return {
                    problem_id: dsaProblem.id,
                    input: t.input,
                    expected_output: t.expectedOutput,
                    is_hidden: t.isHidden,
                };
            }),
        });

        res.status(201).json({
            success: true,
            data: {
                id: dsaProblem.id,
                contestId: data.contestId,
            },
            error: null,
        });
    },
);

app.get("/api/problems/:problemId", veryifyUser, async (req, res) => {
    const { problemId } = req.params;

    if (isNaN(Number(problemId)))
        return res.status(404).json({
            success: false,
            data: null,
            error: "PROBLEM_NOT_FOUND",
        });

    const { success, data } = problemID.safeParse(req.params.problemId);

    if (!success)
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST",
        });

    const problem = await prisma.dsa_problems.findUnique({
        where: {
            id: data,
        },
        include: {
            testCases: {
                where: {
                    is_hidden: false,
                },
            },
        },
    });

    if (!problem)
        return res.status(404).json({
            success: false,
            data: null,
            error: "PROBLEM_NOT_FOUND",
        });

    const visibleTestCases = problem.testCases.map((t) => {
        return {
            input: t.input,
            expectedOutput: t.expected_output,
        };
    });

    res.json({
        success: true,
        data: {
            id: problem.id,
            contestId: problem.contest_id,
            title: problem.title,
            description: problem.description,
            tags: problem.tags,
            points: problem.points,
            timeLimit: problem.time_limit,
            memoryLimit: problem.memory_limit,
            visibleTestCases,
        },
        error: null,
    });
});

app.post(
    "/api/problems/:problemId/submit",
    veryifyUser,
    requireRole("contestee"),
    async (req, res) => {
        const { problemId } = req.params;

        if (isNaN(Number(problemId)))
            return res.status(404).json({
                success: false,
                data: null,
                error: "PROBLEM_NOT_FOUND",
            });

        const { success, data } = DsaSolutionSchema.safeParse({
            ...req.body,
            ...req.params,
        });

        if (!success)
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });

        const currentDate = Date.now();

        const problem = await prisma.dsa_problems.findUnique({
            where: {
                id: data.problemId,
            },
            include: {
                testCases: true,
                contest: true,
            },
        });

        if (!problem)
            return res.status(400).json({
                success: false,
                data: null,
                error: "PROBLEM_NOT_FOUND",
            });
        else if (currentDate < problem.contest.start_time.getTime())
            return res.status(400).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_ACTIVE",
            });

        let testCasesPassed = 0;
        let error = "";
        const startTime = Date.now();
        for (const t of problem.testCases) {
            const result = await codeResult(data.code, t.input);
            if (result.exitCode == 124) {
                error = "time_limit_exceeded";
                break;
            } else if (result.exitCode !== 0) {
                error = "runtime_error";
                break;
            }
            if (normalize(result.stdout) == normalize(t.expected_output)) {
                testCasesPassed++;
            }
        }
        const endTime = Date.now();
        if (error != "")
            return res.json({
                success: true,
                data: {
                    status: error,
                    pointsEarned: 0,
                    testCasesPassed,
                    totalTestCases: problem.testCases.length,
                },
            });
        const pointsEarned = Math.floor(
            (testCasesPassed / problem.testCases.length) * problem.points,
        );

        const alreadySubmitted = await prisma.dsa_submission.findFirst({
            where: {
                problem_id: data.problemId,
                user_id: req.userId,
            },
        });
        //If the result is not already submitted i will do the following things
        if (!alreadySubmitted) {
            const submission = await prisma.dsa_submission.create({
                data: {
                    code: data.code,
                    execution_time: endTime - startTime,
                    language: data.language,
                    status:
                        testCasesPassed == problem.testCases.length
                            ? "accepted"
                            : "wrong_answer",
                    user_id: req.userId,
                    problem_id: data.problemId,
                    points_earned: pointsEarned,
                    test_cases_passed: testCasesPassed,
                    total_test_cases: problem.testCases.length,
                },
            });

            await prisma.contest_leaderboard.upsert({
                where: {
                    contestId_userId: {
                        contestId: problem.contest_id,
                        userId: req.userId,
                    },
                },
                update: {
                    points: { increment: pointsEarned },
                },
                create: {
                    contestId: problem.contest_id,
                    userId: req.userId,
                    points: pointsEarned,
                },
            });

            return res.status(201).json({
                success: true,
                data: {
                    status: submission.status,
                    pointsEarned: submission.points_earned,
                    testCasesPassed: submission.test_cases_passed,
                    totalTestCases: submission.total_test_cases,
                },
                error: null,
            });
        }

        if (pointsEarned >= alreadySubmitted.points_earned) {
            const resubmission = await prisma.dsa_submission.update({
                where: {
                    id: alreadySubmitted.id,
                },
                data: {
                    code: data.code,
                    execution_time: endTime - startTime,
                    status:
                        testCasesPassed == problem.testCases.length
                            ? "accepted"
                            : "wrong_answer",
                    points_earned: pointsEarned,
                    test_cases_passed: testCasesPassed,
                    total_test_cases: problem.testCases.length,
                },
            });

            await prisma.contest_leaderboard.update({
                where: {
                    contestId_userId: {
                        contestId: problem.contest_id,
                        userId: req.userId,
                    },
                },
                data: {
                    points: pointsEarned,
                },
            });

            return res.status(201).json({
                success: true,
                data: {
                    status: resubmission.status,
                    pointsEarned: resubmission.points_earned,
                    testCasesPassed: resubmission.test_cases_passed,
                    totalTestCases: resubmission.total_test_cases,
                },
                error: null,
            });
        }

        return res.status(201).json({
            success: true,
            data: {
                status: alreadySubmitted.status,
                pointsEarned: pointsEarned,
                testCasesPassed: testCasesPassed,
                totalTestCases: alreadySubmitted.total_test_cases,
            },
            error: null,
        });
    },
);

app.get("/api/contests/:contestId/leaderboard", veryifyUser, async (req, res) => {
    const { contestId } = req.params;

    if (isNaN(Number(contestId)))
        return res.status(404).json({
            success: false,
            data: null,
            error: "CONTEST_NOT_FOUND",
        });

    const { success, data } = ContestId.safeParse(req.params.contestId);

    if (!success)
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST",
        });

    const contestLeaderboard = await prisma.contest_leaderboard.findMany({
        where: {
            contestId: data,
        },
        include: {
            user: true,
        },
        orderBy: {
            points: "desc",
        },
    });

    if (!contestLeaderboard.length)
        return res.status(400).json({
            success: false,
            data: null,
            error: "CONTEST_NOT_FOUND",
        });

    let rank = 1;
    let lastScore: number | null = null;
    const rankData = contestLeaderboard.map((d) => {
        if (lastScore && d.points < lastScore) rank++;
        lastScore = d.points;
        return {
            userId: d.userId,
            name: d.user.name,
            totalPoints: d.points,
            rank,
        };
    });

    res.json({
        success,
        data: rankData,
        error: null,
    });
});

app.listen(PORT, () => {
    console.log(`Your app is listening in http://localhost:${PORT}`);
});
