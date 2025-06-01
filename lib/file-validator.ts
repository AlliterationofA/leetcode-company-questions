import { logger } from "./logger"

export interface FileValidationResult {
  isValid: boolean
  error?: string
  file?: File
}

export class FileValidator {
  private readonly maxFileSize = 10 * 1024 * 1024 // 10MB
  private readonly allowedExtensions = [".csv"]
  private readonly allowedMimeTypes = ["text/csv", "application/csv", "text/plain"]

  validateFile(file: File | null): FileValidationResult {
    try {
      if (!file) {
        return { isValid: false, error: "No file selected" }
      }

      logger.debug("Validating file", {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      // Check file extension
      const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
      if (!this.allowedExtensions.includes(fileExt)) {
        const error = `Invalid file type. Please upload a CSV file (.csv extension). Got: ${fileExt}`
        logger.warn("File validation failed - invalid extension", { extension: fileExt })
        return { isValid: false, error }
      }

      // Check file size
      if (file.size > this.maxFileSize) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1)
        const maxSizeMB = (this.maxFileSize / 1024 / 1024).toFixed(0)
        const error = `File too large. Maximum size is ${maxSizeMB}MB, got ${sizeMB}MB`
        logger.warn("File validation failed - file too large", { size: file.size, maxSize: this.maxFileSize })
        return { isValid: false, error }
      }

      // Check MIME type (optional, as browsers can be inconsistent)
      if (file.type && !this.allowedMimeTypes.includes(file.type)) {
        logger.warn("File validation warning - unexpected MIME type", { mimeType: file.type })
        // Don't fail validation for MIME type, just log warning
      }

      logger.info("File validation passed", { name: file.name, size: file.size })
      return { isValid: true, file }
    } catch (error) {
      logger.error("File validation error", error instanceof Error ? error : new Error(String(error)))
      return { isValid: false, error: "File validation failed" }
    }
  }

  async validateCSVContent(file: File): Promise<{ isValid: boolean; error?: string }> {
    try {
      const content = await file.text()

      if (!content || content.trim().length === 0) {
        return { isValid: false, error: "CSV file is empty" }
      }

      const lines = content.trim().split("\n")
      if (lines.length < 2) {
        return { isValid: false, error: "CSV file must have at least a header and one data row" }
      }

      // Basic CSV structure validation
      const headers = lines[0].split(",")
      if (headers.length < 3) {
        return { isValid: false, error: "CSV file must have at least 3 columns" }
      }

      logger.info("CSV content validation passed", {
        lines: lines.length,
        headers: headers.length,
      })

      return { isValid: true }
    } catch (error) {
      logger.error("CSV content validation failed", error instanceof Error ? error : new Error(String(error)))
      return { isValid: false, error: "Failed to read CSV file content" }
    }
  }
}

export const fileValidator = new FileValidator()
