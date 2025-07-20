import { Router } from "express";
import { getMe } from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.get('/', authenticateJWT, getMe);

export default router;