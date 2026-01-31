import { email, z } from 'zod/v4'
import { RolesEnum } from '../models/user.model';

// Schemas
export const PasswordSchema = z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(20, "Password must be at most 20 characters long")
    .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter",
    })
    .refine((val) => /[0-9]/.test(val), {
        message: "Password must contain at least one number",
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
        message: "Password must contain at least one special character",
    })

export const RegisterSchema = z.strictObject({
    email: z.email(),
    password: PasswordSchema
})

export const LoginSchema = z.strictObject({
    email: z.email(),
    password: z.string().min(1, "Password is required"),
    role: z.enum(RolesEnum, {
        message: "Role must be either 'user' or 'admin'"
    })
});

export const RefreshTokenSchema = z.strictObject({
    refreshToken: z.string().min(1, "Refresh token is required")
});




// Types 
export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;
export type RefreshTokenSchemaType = z.infer<typeof RefreshTokenSchema>;