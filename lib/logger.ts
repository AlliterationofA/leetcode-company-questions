type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
  error?: Error
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private formatMessage(level: LogLevel, message: string, data?: any, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error,
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.unshift(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }
  }

  info(message: string, ...args: unknown[]) {
    console.log(`[INFO] ${message}`, ...args)
  }

  error(message: string, error?: Error | unknown) {
    if (error instanceof Error) {
      console.error(`[ERROR] ${message}:`, error.message)
      if (error.stack) {
        console.error(error.stack)
      }
    } else {
      console.error(`[ERROR] ${message}:`, error)
    }
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(`[WARN] ${message}`, ...args)
  }

  debug(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return this.logs
    return this.logs.filter((log) => log.level === level)
  }

  clearLogs() {
    this.logs = []
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

export const logger = new Logger()
