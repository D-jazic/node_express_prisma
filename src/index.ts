import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import authRoutes from './routes/auth.routes.js';
import rootRoutes from './routes/root.routes.js';
import userRoutes from './routes/user.routes.js';
import meRoutes from './routes/me.routes.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();

app.use(express.json());
app.use('/', rootRoutes);
app.use('/api', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/users', userRoutes);

// Always last
app.use(errorHandler);

export default app;
