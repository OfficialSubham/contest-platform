import z from "zod";

export const UserSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string(),
    role: z.enum(["creator", "contestee"]),
});
