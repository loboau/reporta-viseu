/**
 * Simple logger utility for structured logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  data?: unknown;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      timestamp: new Date().toISOString(),
      message,
      ...(data && { data }),
    };
  }

  info(message: string, data?: unknown): void {
    const entry = this.formatMessage('info', message, data);
    console.log(JSON.stringify(entry));
  }

  warn(message: string, data?: unknown): void {
    const entry = this.formatMessage('warn', message, data);
    console.warn(JSON.stringify(entry));
  }

  error(message: string, error?: unknown): void {
    const entry = this.formatMessage('error', message, error);
    console.error(JSON.stringify(entry));
  }

  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.formatMessage('debug', message, data);
      console.debug(JSON.stringify(entry));
    }
  }
}

export const logger = new Logger();
