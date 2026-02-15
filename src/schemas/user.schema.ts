import { z, email } from 'zod/v4';
import { RolesEnum } from '../models/user.model.js';

// Primitives (reused across endpoints)
const UserEmailParamSearch = z.strictObject({
    email: z.email().trim().toLowerCase()
});
const UserIdParamSearch = z.strictObject({
    id: z.coerce.number().int().min(1)
});

// Params
export const DeleteUserByEmailParamsSchema = UserEmailParamSearch;
export const DeleteUserByIdParamSchema = UserIdParamSearch;

export type DeleteUserByEmailParam = z.infer<typeof DeleteUserByEmailParamsSchema>;
export type DeleteUserByIdParam = z.infer<typeof DeleteUserByIdParamSchema>


// Query
export const UserQuerySchema = z.strictObject({
    role: z.enum(RolesEnum).optional(),
    search: z.string().min(1).optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(20).default(20)
});
export type UserQuery = z.infer<typeof UserQuerySchema>;
