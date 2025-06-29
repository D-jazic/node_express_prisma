import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { LoginSchema, RefreshTokenSchema, RegisterSchema } from "./schemas";
import { z, email } from 'zod/v4';
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

const accessTokenExpirationTime = "10s";

const users = new Map<string, string>();

export interface RefreshTokenData {
    email: string;
    expiresAt: number;
}

const refreshTokens = new Map<string, RefreshTokenData>();

export async function registerUser(req: Request, res: Response) {
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

        if (users.has(email)) {
            res.status(409).json({ error: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        users.set(email, hashedPassword);

        console.log("Received registration request:", { email, password });

        res.status(201).json({
            message: "User registered successfully",
            user: { email }
        });
        return;
    } catch (error) {
        console.error(`[Controller] Error during user registration`, error)
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
}

export async function loginUser(req: Request, res: Response) {
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

        const { email, password } = result.data;
        const hashed = users.get(email);

        if (!hashed) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const isValid = await bcrypt.compare(password, hashed);

        if (!isValid) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const accessToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: accessTokenExpirationTime });

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
        console.error(`[Controller] Login error`, error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
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
        res.status(401).json({ error: "Invalid or missing refresh token" });
        return;
    }

    const tokenData = refreshTokens.get(refreshToken)!;

    if (Date.now() > tokenData.expiresAt) {
        refreshTokens.delete(refreshToken);
        res.status(401).json({ error: "Refresh token expired" });
        return;
    }

    refreshTokens.delete(refreshToken);

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