import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { users } from "./auth.controller";
import { RolesEnum } from "../models/user.model";
import { ApiError } from "../middlewares/errorHandler.middleware";

/**
 * // Only admin hits this (protected in route)
 * @param req AuthenticatedRequest
 * @param res 
 * @returns 
 */
export function getUsers(req: AuthenticatedRequest, res: Response) {
    res.json({
        users: Array.from(users.values())
    });
    return;
}

export function getMe(req: AuthenticatedRequest, res: Response) {
    const email = req.user?.email;
    const user = users.get(email!);
    if (!user) {
        throw new ApiError('User not found', 404);
    }

    res.json({
        email: user.email,
        role: user.role
    });
    return;
}

export function getUserByEmail(req: AuthenticatedRequest, res: Response) {
    const { email } = req.body;

    if (req.user?.role !== RolesEnum.ADMIN && email !== req.user?.email) {
        throw new ApiError('Forbidden', 403);
    }

    const foundUser = users.get(email);

    if (!foundUser) {
        throw new ApiError('User not found', 404);
    }

    res.json({ user: foundUser });
    return;
}