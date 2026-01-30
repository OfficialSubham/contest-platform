import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "";

const { verify } = jwt;

export const veryifyUser = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization)
        return res.status(401).json({
            success: false,
            data: null,
            error: "UNAUTHORIZED",
        });
    const token = authorization.split(" ")[1];
    if (!token)
        return res.status(401).json({
            success: false,
            data: null,
            error: "UNAUTHORIZED",
        });

    const user = verify(token, JWT_SECRET) as {
        userId: number;
        email: string;
        name: string;
        role: Role;
    };
    req.userId = user.userId;
    req.userEmail = user.email;
    req.userName = user.name;
    req.userRole = user.role;
    next();
};
