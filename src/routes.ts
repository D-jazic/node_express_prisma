import { Request, Response, Router } from "express";
import { loginUser, registerUser } from "./controller.js";

const router = Router();

// Just pass the function reference
router.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Welcome to the API" });
});
router.post("/register", registerUser);
router.post("/login", loginUser);


export default router;