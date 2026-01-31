import "dotenv/config";

import express from "express";
import { LoginSchema, UserSchema } from "./validation/UserSchema";
import { compare, hash } from "bcryptjs";
import { prisma } from "./prisma/prisma";
import jwt from "jsonwebtoken";
import { veryifyUser } from "./middlewares/verifyUser";
import { requireRole } from "./middlewares/requireRole";
import { ContestId, ContestSchema } from "./validation/Contests";

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

    if (!success)
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

app.listen(PORT, () => {
    console.log(`Your app is listening in http://localhost:${PORT}`);
});
