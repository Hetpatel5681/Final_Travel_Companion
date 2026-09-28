import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware';
import v1Routes from './routes/v1';

dotenv.config();

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Standard Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Routes
app.use('/api/v1', v1Routes);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
