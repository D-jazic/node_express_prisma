import { Router } from "express";
import { getMe } from "../controllers/user.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/', authenticateJWT, getMe);

export default router;