import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexora',
  useInMemoryDb: process.env.USE_IN_MEMORY_DB || 'auto',
  jwtSecret: process.env.JWT_SECRET || 'nexora_super_secret_jwt_key_development_2026_xyz',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'nexora_token',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  geminiTimeoutMs: parseInt(process.env.GEMINI_TIMEOUT_MS || '20000', 10),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
};

