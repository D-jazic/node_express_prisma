import { Request, Response, Router } from "express";
import { loginUser, refreshTokenHandler, registerUser } from "../controllers/auth.controller.js";
import { authenticateJWT, AuthRequest } from "../middlewares/auth.middleware.js";

const authRoutes = Router();


authRoutes.get("/me", authenticateJWT, (req: AuthRequest, res: Response) => {
    res.json({
        user: req.user
    })
});
authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.post("/refresh", refreshTokenHandler)


export default authRoutes;