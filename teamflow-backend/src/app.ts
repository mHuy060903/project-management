import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '@/module/auth/auth.routes.ts';
import { errorMiddleware } from '@/middleware/error.middleware.ts';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);


app.use(errorMiddleware);

export default app;