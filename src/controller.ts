import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { LoginSchema, RegisterSchema } from "./schemas";
import { z } from "zod/v4"
import jwt from "jsonwebtoken";

const users = new Map<string, string>();

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

        const token = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

        res.status(200).json({
            message: "Login successful",
            token
        })
        return;


    } catch (error) {
        console.error(`[Controller] Login error`, error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
}