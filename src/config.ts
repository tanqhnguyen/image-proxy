import { config as setupConfig } from 'dotenv';

setupConfig();

const env = process.env.NODE_ENV || 'development';

export const Config = {
  isDevelopment(): boolean {
    return env === 'development';
  },
  isProduction(): boolean {
    return env === 'production';
  },
  isTest(): boolean {
    return env === 'test';
  },
  api: {
    port: parseInt(process.env.API_PORT, 10) || 3000,
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
  postgres: {
    host: process.env.TYPEORM_HOST,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    port: parseInt(process.env.TYPEORM_PORT, 10),
  },
};
