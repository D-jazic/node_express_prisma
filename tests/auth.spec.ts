import request from 'supertest';
import app from '../src/index.js';
import { RolesEnum } from '../src/models/user.model.js';
import { prisma } from '../src/db/prisma.js';
import { faker } from '@faker-js/faker';

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Auth API', () => {
    it('registers a user', async () => {
        const email = faker.internet.email({ provider: "gmail.com" }).toLowerCase();
        const password = "Test1234!"

        const registerRes = await request(app)
            .post('/api/register')
            .send({ email, password });
        const loginRes = await request(app)
            .post('/api/login')
            .send({ email, password, role: RolesEnum.USER });
        const token = loginRes.body?.token;

        expect(registerRes.statusCode).toBe(201);
        expect(registerRes.body).toEqual(
            expect.objectContaining({
                message: 'User registered successfully',
                user: expect.objectContaining({
                    email: email
                })
            })
        );

        const deletedUser = await request(app)
            .delete(`/api/users/${encodeURIComponent(registerRes.body.user.id)}`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        console.log(`Deleted user response: ${JSON.stringify(deletedUser.body)}`);
    });

    it('does not register duplicate email', async () => {
        const email = faker.internet.email({ provider: "gmail.com" }).toLowerCase();
        const password = "Test1234!"

        const registerSuccessRes = await request(app)
            .post('/api/register')
            .send({ email, password });

        const res = await request(app)
            .post('/api/register')
            .send({ email, password });
        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe('User with this email already exists');


        const loginRes = await request(app)
            .post('/api/login')
            .send({ email, password, role: RolesEnum.USER });

        const token = loginRes.body?.token;

        const deletedUser = await request(app)
            .delete(`/api/users/${encodeURIComponent(registerSuccessRes.body.user.id)}`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        console.log(`Deleted user response: ${JSON.stringify(deletedUser.body)}`);
    });
});
