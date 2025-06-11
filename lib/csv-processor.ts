import { Parser } from 'csv-parse'
import { AnalyticsData, QuestionRow, ProcessedQuestion } from '@/types/analytics'
import { logger } from './logger'
import { AppError } from './error-handler'

class CSVProcessor {
  private processRows(rows: QuestionRow[]): AnalyticsData {
    try {
      // Group rows by title to combine company data
      const questionMap = new Map<string, ProcessedQuestion>()
      const companies = new Set<string>()
      const difficulties = new Set<string>()
      const timeframes = new Set<string>()
      const topics = new Set<string>()

      for (const row of rows) {
        // Skip invalid rows
        if (!row.title || !row.company || !row.difficulty) {
          logger.warn('Skipping invalid row:', row)
          continue
        }

        // Clean and normalize data
        const cleanRow = {
          ...row,
          frequency: this.parseNumber(row.frequency, 50),
          acceptance_rate: this.parseNumber(row.acceptance_rate, 50),
          topics: row.topics || ''
        }

        // Add to sets
        companies.add(cleanRow.company)
        difficulties.add(cleanRow.difficulty)
        timeframes.add(cleanRow.timeframe)
        cleanRow.topics.split(/[,;|]/).map(t => t.trim()).filter(Boolean).forEach(t => topics.add(t))

        // Get or create question
        const existing = questionMap.get(cleanRow.title)
        if (existing) {
          // Update existing question
          if (!existing.companies.includes(cleanRow.company)) {
            existing.companies.push(cleanRow.company)
          }
          if (!existing.timeframes.includes(cleanRow.timeframe)) {
            existing.timeframes.push(cleanRow.timeframe)
          }
          cleanRow.topics.split(/[,;|]/).map(t => t.trim()).filter(Boolean).forEach(t => {
            if (!existing.topics.includes(t)) {
              existing.topics.push(t)
            }
          })
          existing.originalRows?.push(cleanRow)
        } else {
          // Create new question
          questionMap.set(cleanRow.title, {
            title: cleanRow.title,
            difficulty: cleanRow.difficulty,
            companies: [cleanRow.company],
            timeframes: [cleanRow.timeframe],
            topics: cleanRow.topics.split(/[,;|]/).map(t => t.trim()).filter(Boolean),
            frequency: cleanRow.frequency,
            acceptance_rate: cleanRow.acceptance_rate,
            originalRows: [cleanRow]
          })
        }
      }

      // Sort all arrays for consistency
      const questions = Array.from(questionMap.values()).map(q => ({
        ...q,
        companies: q.companies.sort(),
        timeframes: q.timeframes.sort(),
        topics: q.topics.sort()
      }))

      return {
        questions: questions.sort((a, b) => a.title.localeCompare(b.title)),
        companies: Array.from(companies).sort(),
        difficulties: Array.from(difficulties).sort(),
        timeframes: Array.from(timeframes).sort(),
        topics: Array.from(topics).sort()
      }
    } catch (error) {
      logger.error('Error processing CSV rows:', error)
      throw new AppError('Failed to process CSV data', 'DATA_PROCESSING_ERROR', 422, true, { cause: error as Error })
    }
  }

  private parseNumber(value: any, defaultValue: number): number {
    if (value === undefined || value === null || value === '') return defaultValue
    const num = typeof value === 'string' ? Number(value.replace(/[^\d.]/g, '')) : Number(value)
    return isNaN(num) ? defaultValue : num
  }

  async processLocalData(): Promise<AnalyticsData> {
    try {
      if (typeof window !== 'undefined') {
        throw new AppError('Local file processing is not available in the browser', 'ENVIRONMENT_ERROR', 400, true)
      }
      const { readFileSync } = require('fs')
      const fileContent = readFileSync('codedata.csv', 'utf-8')
      const rows = await this.parseCSV(fileContent)
      logger.info(`Processing ${rows.length} rows from local CSV file`)
      return this.processRows(rows)
    } catch (error) {
      logger.error('Error reading local CSV file:', error)
      throw new AppError('Failed to read local CSV file', 'FILE_ERROR', 400, true, { cause: error as Error })
    }
  }

  async processGitHubData(): Promise<AnalyticsData> {
    try {
      const response = await fetch('https://raw.githubusercontent.com/AlliterationofA/leetcode-company-questions/main/codedata.csv')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const text = await response.text()
      const rows = await this.parseCSV(text)
      logger.info(`Processing ${rows.length} rows from GitHub CSV file`)
      return this.processRows(rows)
    } catch (error) {
      logger.error('Error fetching CSV from GitHub:', error)
      throw new AppError('Failed to fetch CSV from GitHub', 'NETWORK_ERROR', 503, true, { cause: error as Error })
    }
  }

  private parseCSV(content: string): Promise<QuestionRow[]> {
    return new Promise((resolve, reject) => {
      const parser = new Parser({
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
      const rows: QuestionRow[] = []
      
      parser.on('readable', function() {
        let record
        while ((record = parser.read()) !== null) {
          rows.push(record)
        }
      })
      
      parser.on('error', (err: Error) => reject(err))
      parser.on('end', () => resolve(rows))
      
      parser.write(content)
      parser.end()
    })
  }
}

export const csvProcessor = new CSVProcessor()
