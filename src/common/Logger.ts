import { Logger } from '~types';
import winston from 'winston';
import chalk from 'chalk';
import randomcolor from 'randomcolor';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export class ConsoleLogger implements Logger {
  private logger: winston.Logger;

  constructor(params: { level?: LogLevel; label?: string }) {
    const { combine, colorize, timestamp, printf, label } = winston.format;
    const labelColor = randomcolor();

    this.logger = winston.createLogger({
      level: params.level || LogLevel.INFO,
      format: combine(
        label({ label: params.label ? `[${params.label}]` : '' }),
        colorize(),
        timestamp(),
        printf(({ level, message, label, timestamp }) => {
          return `${chalk.cyan(timestamp)}${
            label ? ` ${chalk.hex(labelColor).bold(label)} ` : ''
          }${level}: ${message}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  debug(message?: any, ...optionalParams: any[]): void {
    this.logger.debug(message, ...optionalParams);
  }
  info(message?: any, ...optionalParams: any[]): void {
    this.logger.info(message, ...optionalParams);
  }
  warn(message?: any, ...optionalParams: any[]): void {
    this.logger.warn(message, ...optionalParams);
  }
  error(message?: any, ...optionalParams: any[]): void {
    this.logger.error(message, ...optionalParams);
  }
}
