import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ApiError } from "../middlewares/errorHandler.middleware";
import { RolesEnum } from "../models/user.model";
import { userRepository } from '../repositories/user.repository';



/**
 * // Only admin hits this (protected in route)
 * @param req AuthenticatedRequest
 * @param res 
 * @returns 
 */
export async function getUsers(req: AuthenticatedRequest, res: Response) {
    const users = await userRepository.getAllUsers();

    res.json({
        users
    });
    return;
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
    const email = req.user?.email;

    if (!email) {
        throw new ApiError('Email not found in request', 400);
    }

    const user = await userRepository.getUserByEmail(email);

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

    const foundUser = userRepository.getUserByEmail(email);

    if (!foundUser) {
        throw new ApiError('User not found', 404);
    }

    res.json({ user: foundUser });
    return;
}