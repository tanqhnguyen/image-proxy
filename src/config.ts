import { config as setupConfig } from 'dotenv';

setupConfig();

export const Config = {
  env: process.env.NODE_ENV || 'development',
  api: {
    port: parseInt(process.env.API_PORT, 10) || 3000,
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
