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
