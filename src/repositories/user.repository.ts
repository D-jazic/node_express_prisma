import { prisma } from "../db/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { ApiError } from "../middlewares/errorHandler.middleware.js";
import { User } from "../models/user.model.js";

export class UserRepository {

    async createUser(user: User) {
        const existing = await this.getUserByEmail(user.email);

        if (existing) {
            throw new ApiError("User with this email already exists", 409);
        }

        // This will throw correct error in case of high concurrency load when 2 request try to create the same user
        // at the same time and one of them will fail with P2002 error code.
        try {
            return await prisma.user.create({ data: user });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ApiError("User with this email already exists", 409);
            }
            throw error;
        }
    }

    async getUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    async getAllUsers() {
        return prisma.user.findMany();
    }

    async deleteUserById(id: number) {
        return prisma.user.delete({
            where: { id },
        });
    }

    async deleteUserByEmail(email: string) {
        return prisma.user.delete({
            where: { email },
        })
    }
}

export const userRepository = new UserRepository();
