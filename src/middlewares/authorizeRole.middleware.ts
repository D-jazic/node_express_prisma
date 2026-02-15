import { NextFunction, Response } from "express";
import { RolesEnum } from "../models/user.model.js";
import { AuthenticatedRequest } from "./auth.middleware.js";

export function authorizeRole(role: RolesEnum) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if(!req.user || req.user.role !== role) {
            res.status(403).json({ message: "Forbidden: You do not have the required role to access this resource." });
            return;
        }
        next();
    }
}