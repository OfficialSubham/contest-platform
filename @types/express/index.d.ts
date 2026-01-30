import type { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            userId: number;
            userName: string;
            userRole: string;
            userEmail: string;
        }
    }
}
