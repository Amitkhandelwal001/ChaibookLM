import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import chatRoutes from './routes/chat.routes';
import podcastRoutes from './routes/podcast.routes';
import { globalErrorHandler } from './middleware/error.middleware';

const app = express();

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // allow images to load
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/podcast', podcastRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'API is healthy' });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
