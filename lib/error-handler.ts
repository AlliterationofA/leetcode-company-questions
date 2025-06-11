import { logger } from "./logger"

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, code: string, statusCode = 500, isOperational = true, options?: { cause?: unknown }) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational

    if (options?.cause) {
      const causeMessage = options.cause instanceof Error 
        ? options.cause.message 
        : String(options.cause)
      this.message = `${message}: ${causeMessage}`
    }

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

export function handleError(error: unknown, context: string): AppError {
  if (error instanceof AppError) {
    return error
  }

  const message = error instanceof Error ? error.message : String(error)
  return new AppError(`${context} error: ${message}`, "UNKNOWN_ERROR", 500, false)
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
