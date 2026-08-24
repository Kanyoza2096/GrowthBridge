// src/lib/observability/logger.ts

export interface LogContext {
  request_id?: string;
  correlation_id?: string;
  user_id?: string;
  operation?: string;
  duration?: number;
  status?: string | number;
  workflow_id?: string;
  job_id?: string;
  agent_id?: string;
  [key: string]: any;
}

class Logger {
  private format(level: string, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...context,
      });
    }
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${context ? JSON.stringify(context) : ''}`;
  }

  info(message: string, context?: LogContext) {
    console.info(this.format('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, error?: any, context?: LogContext) {
    console.error(
      this.format('error', message, {
        ...context,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    );
  }

  autonomous(message: string, context: LogContext) {
    console.info(this.format('autonomous', message, context));
  }
}

export const logger = new Logger();
