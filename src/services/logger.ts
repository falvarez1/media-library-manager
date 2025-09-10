/**
 * Logger Service
 * Centralized logging with different levels and optional console output
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.WARN; // Default to WARN in production
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private constructor() {
    // Set log level based on environment
    if (this.isDevelopment) {
      this.logLevel = LogLevel.DEBUG;
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(category: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level: LogLevel.DEBUG,
      category,
      message,
      data
    };

    this.addLog(entry);
    if (this.isDevelopment) {
      // Only output to console in development
      // console.log(`[${category}]`, message, data || '');
    }
  }

  info(category: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level: LogLevel.INFO,
      category,
      message,
      data
    };

    this.addLog(entry);
    if (this.isDevelopment) {
      // console.info(`[${category}]`, message, data || '');
    }
  }

  warn(category: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level: LogLevel.WARN,
      category,
      message,
      data
    };

    this.addLog(entry);
    if (this.isDevelopment) {
      // console.warn(`[${category}]`, message, data || '');
    }
  }

  error(category: string, message: string, error?: Error | any, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level: LogLevel.ERROR,
      category,
      message,
      error: error instanceof Error ? error : new Error(String(error)),
      data
    };

    this.addLog(entry);
    
    // Always log errors to console in development
    if (this.isDevelopment) {
      // console.error(`[${category}]`, message, error || '', data || '');
    }

    // In production, you might want to send errors to a monitoring service
    if (!this.isDevelopment && error) {
      // TODO: Send to error monitoring service (e.g., Sentry)
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level === undefined) {
      return [...this.logs];
    }
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const logDebug = (category: string, message: string, data?: any) => 
  logger.debug(category, message, data);

export const logInfo = (category: string, message: string, data?: any) => 
  logger.info(category, message, data);

export const logWarn = (category: string, message: string, data?: any) => 
  logger.warn(category, message, data);

export const logError = (category: string, message: string, error?: Error | any, data?: any) => 
  logger.error(category, message, error, data);