import { Router } from "express";
import { loginUser, refreshTokenHandler, registerUser } from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.post("/refresh", refreshTokenHandler);

export default authRoutes;