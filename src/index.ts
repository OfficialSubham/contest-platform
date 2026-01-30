import "dotenv/config";

import express from "express";
import { UserSchema } from "./validation/UserSchema";
import { hash } from "bcryptjs";
import { prisma } from "./prisma/prisma";

const app = express();

const PORT = process.env.PORT || 3000;
const SALT = process.env.SALT || 10;
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

app.listen(PORT, () => {
    console.log(`Your app is listening in http://localhost:${PORT}`);
});
