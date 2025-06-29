import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export interface AuthRequest extends Request {
    user?: unknown;
}

export function authenticateJWT(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: "Missing or invalid Authorization header" });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('[AuthMiddleware] JWT Error:', error);
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
}