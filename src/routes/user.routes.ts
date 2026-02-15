import { Router } from "express";
import { deleteUserById, getUsers } from "../controllers/user.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.middleware.js";
import { RolesEnum } from "../models/user.model.js";

const router = Router();

router.use(authenticateJWT);

router.get('/',
    authorizeRole(RolesEnum.ADMIN),
    getUsers
);
router.delete('/:id',
    deleteUserById
);

export default router;