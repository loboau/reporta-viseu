import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  DATABASE_URL: string;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
  PORT: number;
  NODE_ENV: string;
  UPLOAD_DIR: string;
  BASE_URL: string;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = ['DATABASE_URL', 'ANTHROPIC_API_KEY', 'JWT_SECRET'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
    JWT_SECRET: process.env.JWT_SECRET!,
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    UPLOAD_DIR: path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads'),
    BASE_URL: process.env.BASE_URL || `http://localhost:${process.env.PORT || '3001'}`,
  };
}

export const env = validateEnv();
