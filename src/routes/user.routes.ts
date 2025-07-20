import { Router } from "express";
import { getUsers } from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { RolesEnum } from "../models/user.model";

const router = Router();

router.get('/',
    authenticateJWT,
    authorizeRole(RolesEnum.ADMIN),
    getUsers
);

export default router;