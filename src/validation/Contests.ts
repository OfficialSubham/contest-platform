import z from "zod";

export const ContestSchema = z.object({
    title: z.string(),
    description: z.string(),
    startTime: z.iso.datetime({ offset: true }),
    endTime: z.iso.datetime({ offset: true }),
});

export const ContestId = z.coerce.number();

export const McqSchema = z
    .object({
        questionText: z.string(),
        options: z.string().array(),
        correctOptionIndex: z.number().int().nonnegative(),
        points: z.number().optional(),
    })
    .refine((data) => data.correctOptionIndex < data.options.length);

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

export const problemID = z.coerce.number();

export const DsaSolutionSchema = z.object({
    problemId: z.coerce.number(),
    code: z.string(),
    language: z.string(),
});
