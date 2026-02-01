import z from "zod";

export const ContestSchema = z.object({
    title: z.string(),
    description: z.string(),
    startTime: z.iso.datetime({ offset: true }),
    endTime: z.iso.datetime({ offset: true }),
});

export const ContestId = z.coerce.number();

export const McqSchema = z.object({
    questionText: z.string(),
    options: z.string().array(),
    correctOptionIndex: z.number(),
    points: z.number().optional(),
});

export const SubmitMcqSchema = z.object({
    contestId: z.coerce.number(),
    questionId: z.coerce.number(),
    selectedOptionIndex: z.number(),
});

export const DsaSchema = z.object({
    contestId: z.coerce.number(),
    title: z.string(),
    description: z.string(),
    tags: z.string().array().optional(),
    points: z.number(),
    timeLimit: z.number(),
    memoryLimit: z.number(),
    testCases: z
        .object({
            input: z.string(),
            expectedOutput: z.string(),
            isHidden: z.boolean(),
        })
        .array(),
});

export const problemId = z.coerce.number();
