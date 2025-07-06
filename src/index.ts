import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import authRoutes from './routes/auth.routes.js';
import rootRoutes from './routes/root.routes.js';

const app = express();

app.use(express.json());
app.use('/', rootRoutes);
app.use('/api', authRoutes);

// Moved to server.ts because of jest imports app and arguing that some async function
// were not properly stopped after tests. It because after import of app server is started

//   const PORT = process.env.PORT || 3000;
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });

export default app;
