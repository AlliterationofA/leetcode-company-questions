import { logger } from "./logger"

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, code: string, statusCode = 500, isOperational = true) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400)
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, "NETWORK_ERROR", 503)
  }
}

export class DataProcessingError extends AppError {
  constructor(message: string) {
    super(message, "DATA_PROCESSING_ERROR", 422)
  }
}

export class FileError extends AppError {
  constructor(message: string) {
    super(message, "FILE_ERROR", 400)
  }
}

export const handleError = (error: unknown, context = "Unknown"): AppError => {
  logger.error(`Error in ${context}`, error instanceof Error ? error : new Error(String(error)))

  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return new NetworkError(`Network error: ${error.message}`)
    }

    // File errors
    if (error.message.includes("file") || error.message.includes("upload")) {
      return new FileError(`File error: ${error.message}`)
    }

    // JSON parsing errors
    if (error.message.includes("JSON") || error.message.includes("parse")) {
      return new DataProcessingError(`Data parsing error: ${error.message}`)
    }

    return new AppError(error.message, "UNKNOWN_ERROR", 500, false)
  }

  return new AppError("An unexpected error occurred", "UNKNOWN_ERROR", 500, false)
}

export const withErrorHandling = <T extends any[], R>(fn: (...args: T) => Promise<R>, context: string) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw handleError(error, context)
    }
  }
}
