import { Router } from "express";
import { deleteUserByEmail, getUsers } from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { RolesEnum } from "../models/user.model";

const router = Router();

router.use(authenticateJWT);

router.get('/',
    authorizeRole(RolesEnum.ADMIN),
    getUsers
);
router.delete('/:email',
    deleteUserByEmail
);

export default router;