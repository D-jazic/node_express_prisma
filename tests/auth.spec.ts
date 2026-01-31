import request from 'supertest';
import app from '../src/index';
import { RolesEnum } from '../src/models/user.model';

describe('Auth API', () => {
    it('registers a user', async () => {
        const email = "test123@email.com";
        const password = "Test1234!"

        const registerRes = await request(app)
            .post('/api/register')
            .send({ email: email, password });
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
            .delete(`/api/users/${encodeURIComponent(email)}`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        console.log(`Deleted user response: ${JSON.stringify(deletedUser.body)}`);
    });

    it('does not register duplicate email', async () => {
        const email = "test1234wgr@email.com";
        const password = "Test1234!"

        await request(app)
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
            .delete(`/api/users/${encodeURIComponent(email)}`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        console.log(`Deleted user response: ${JSON.stringify(deletedUser.body)}`);
    });
});
