import { Router } from "express";
import { deleteUserByEmail, getUsers } from "../controllers/user.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.middleware.js";
import { RolesEnum } from "../models/user.model.js";

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