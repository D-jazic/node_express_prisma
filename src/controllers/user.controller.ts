import { Response, Request, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { ApiError } from "../middlewares/errorHandler.middleware.js";
import { RolesEnum } from "../models/user.model.js";
import { userRepository } from '../repositories/user.repository.js';
import z from "zod/v4";
import { DeleteUserByEmailParamsSchema } from "../schemas/user.schema.js";



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

export async function getUserByEmail(req: AuthenticatedRequest, res: Response) {
    const { email } = req.body;

    // TODO: for input use Zod, for business logic custom errors
    if (req.user?.role !== RolesEnum.ADMIN && email !== req.user?.email) {
        throw new ApiError('Forbidden', 403);
    }

    const foundUser = await userRepository.getUserByEmail(email);

    if (!foundUser) {
        throw new ApiError('User not found', 404);
    }

    res.json({ user: foundUser });
    return;
}

// Better to use ID
export async function deleteUserByEmail(req: Request, res: Response, next: NextFunction) {
    try {
        const result = DeleteUserByEmailParamsSchema.safeParse(req.params);

        if (!result.success) {
            res.status(422)
                .json({
                    error: 'Invalid request.',
                    details: z.treeifyError(result.error)
                })
            return;
        }

        const deletedUser = await userRepository.deleteUserByEmail(result.data.email);

        res.json({
            message: `User with email ${deletedUser.email} deleted successfully`
        });
        return;
    } catch (error) {
        next(error);
    }
}
