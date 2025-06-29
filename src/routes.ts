import { Request, Response, Router } from "express";
import { loginUser, refreshTokenHandler, registerUser } from "./controller.js";
import { authenticateJWT, AuthRequest } from "./middleware/authmiddleware.js";

const router = Router();

// Just pass the function reference
router.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Welcome to the API" });
});
router.get("/me", authenticateJWT, (req: AuthRequest, res: Response) => {
    res.json({
        user: req.user
    })
});



router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshTokenHandler)


export default router;