import type { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message);
    }
}

export function errorHandler(
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Log error for debugging (expand in prod)
    console.error('[ErrorHandler]', err);
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    // Handle other errors
    res.status(500).json({ error: 'Internal Server Error' });
    return;
}
