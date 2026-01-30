import { Errback, NextFunction, Request, Response } from "express";

export const globalErrorHandler = (
    err: Errback,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.log("GLOBAL ERROR \n\n\n", err);

    return res.status(500).json({
        success: false,
        data: null,
        error: "ERROR_CODE",
    });
};
