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

  debug(message: string, data?: any) {
    const entry = this.formatMessage("debug", message, data)
    this.addLog(entry)
    console.debug(`[DEBUG] ${message}`, data)
  }

  info(message: string, data?: any) {
    const entry = this.formatMessage("info", message, data)
    this.addLog(entry)
    console.info(`[INFO] ${message}`, data)
  }

  warn(message: string, data?: any) {
    const entry = this.formatMessage("warn", message, data)
    this.addLog(entry)
    console.warn(`[WARN] ${message}`, data)
  }

  error(message: string, error?: Error, data?: any) {
    const entry = this.formatMessage("error", message, data, error)
    this.addLog(entry)
    console.error(`[ERROR] ${message}`, error, data)
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
