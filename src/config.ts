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
};
