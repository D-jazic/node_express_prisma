import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from 'zod/v4';
import { ApiError } from "../middlewares/errorHandler.middleware";
import { RolesEnum, User } from "../models/user.model";
import { LoginSchema, RefreshTokenSchema, RegisterSchema } from "../schemas/auth.schema";
import { userRepository } from "../repositories/user.repository";

const accessTokenExpirationTime = "15m";


(async () => {

    if (!await userRepository.getUserByEmail(process.env.ADMIN_EMAIL!)) {
        userRepository.createUser({
            email: process.env.ADMIN_EMAIL!,
            password: await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10),
            role: RolesEnum.ADMIN,
        });
    }
})();

export interface RefreshTokenData {
    email: string;
    expiresAt: number;
}

const refreshTokens = new Map<string, RefreshTokenData>();

export async function registerUser(req: Request, res: Response, next: NextFunction) {
    try {
        const result = RegisterSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400)
                .json({
                    error: "Invalid request.",
                    details: z.treeifyError(result.error)
                });
            return;
        }

        const { email, password } = result.data;

        const createdUser = await userRepository.createUser({
            email,
            password: await bcrypt.hash(password, 10),
            role: RolesEnum.USER
        });

        console.log("Received registration request:", { email, password });

        res.status(201).json({
            message: "User registered successfully",
            user: { email: createdUser.email }
        });
        return;
    } catch (error) {
        next(error);
    }
}

export async function loginUser(req: Request, res: Response, next: NextFunction) {
    try {
        const result = LoginSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400)
                .json({
                    error: "Invalid request.",
                    details: z.treeifyError(result.error)
                });
            return;
        }

        const { email, password, role } = result.data;
        const hashed = await userRepository.getUserByEmail(email);

        if (!hashed) {
            throw new ApiError('Invalid email or password', 401);
        }

        const isValid = await bcrypt.compare(password, hashed.password);

        if (!isValid) {
            throw new ApiError('Invalid email or password', 401);
        }

        const accessToken = jwt.sign({ email, role }, process.env.JWT_SECRET!, { expiresIn: accessTokenExpirationTime });

        const refreshToken = randomBytes(32).toString('hex');
        const expiresAt = Date.now() + 3 * 24 * 60 * 60 * 1000;
        refreshTokens.set(refreshToken, { email, expiresAt });

        res.status(200).json({
            message: "Login successful",
            token: accessToken,
            refreshToken
        })
        return;


    } catch (error) {
        next(error);
    }
}

export async function refreshTokenHandler(req: Request, res: Response) {
    const result = RefreshTokenSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400)
            .json({
                error: "Invalid request.",
                details: z.treeifyError(result.error)
            });
        return;
    }

    const { refreshToken } = req.body;

    if (!refreshToken || !refreshTokens.has(refreshToken)) {
        throw new ApiError('Invalid or missing refresh token', 401);
    }

    const tokenData = refreshTokens.get(refreshToken)!;

    if (Date.now() > tokenData.expiresAt) {
        refreshTokens.delete(refreshToken);
        throw new ApiError('Refresh token expired', 401);
    }

    refreshTokens.delete(refreshToken);

    //TODO: duplicated here and in loginUser, create a utility function
    const newRefreshToken = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 3 * 24 * 60 * 60 * 1000;

    refreshTokens.set(newRefreshToken, {
        email: tokenData.email,
        expiresAt
    });

    const newAccessToken = jwt.sign({ email: tokenData.email }, process.env.JWT_SECRET!, { expiresIn: accessTokenExpirationTime });

    res.status(200).json({
        token: newAccessToken,
        refreshToken: newRefreshToken
    });
    return;
}