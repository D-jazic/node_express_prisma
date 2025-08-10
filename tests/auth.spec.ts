import request from 'supertest'
import app from '../src/index';

describe('Auth API', () => {
    it('registers a user', async () => {
        const testEmail = 'test1@example.com';
        const res = await request(app)
            .post('/api/register')
            .send({ email: testEmail, password: 'Password123!' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(
            expect.objectContaining({
                message: 'User registered successfully',
                user: expect.objectContaining({
                    email: testEmail
                })
            })
        );
    });

    it('does not register duplicate email', async () => {
        await request(app)
            .post('/api/register')
            .send({ email: 'test2@example.com', password: 'Password123!' });

        const res = await request(app)
            .post('/api/register')
            .send({ email: 'test2@example.com', password: 'Password123!' });
        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe('User with this email already exists');
    });
});