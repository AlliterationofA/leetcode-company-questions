import { logger } from "./logger"
import { NetworkError, DataProcessingError, handleError } from "./error-handler"

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl
  }

  private async safeJsonParse<T>(response: Response): Promise<T> {
    const text = await response.text()
    try {
      return JSON.parse(text)
    } catch (error) {
      logger.error("Failed to parse JSON response", error instanceof Error ? error : new Error(String(error)), {
        text: text.substring(0, 200),
      })
      throw new DataProcessingError(`Invalid JSON response: ${text.substring(0, 100)}...`)
    }
  }

  async processCSV(formData: FormData): Promise<ApiResponse<any>> {
    try {
      logger.info("Starting CSV processing request")

      const response = await fetch(`${this.baseUrl}/api/process-csv`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await this.safeJsonParse<ApiResponse<any>>(response)

      if (result.success) {
        logger.info("CSV processing completed successfully", { dataSize: result.data?.questions?.length })
      } else {
        logger.warn("CSV processing failed", { error: result.error })
      }

      return result
    } catch (error) {
      const appError = handleError(error, "CSV Processing")
      logger.error("CSV processing request failed", appError)
      throw appError
    }
  }

  async fetchGitHubCSV(): Promise<string> {
    try {
      logger.info("Fetching CSV data from GitHub")

      const response = await fetch(
        "https://raw.githubusercontent.com/AlliterationofA/PublicFiles/main/codedata.csv",
      )

      if (!response.ok) {
        throw new NetworkError(`Failed to fetch GitHub CSV: HTTP ${response.status}`)
      }

      const csvContent = await response.text()
      logger.info("GitHub CSV data fetched successfully", { size: csvContent.length })

      return csvContent
    } catch (error) {
      const appError = handleError(error, "GitHub CSV Fetch")
      logger.error("Failed to fetch GitHub CSV", appError)
      throw appError
    }
  }
}

export const apiClient = new ApiClient()
