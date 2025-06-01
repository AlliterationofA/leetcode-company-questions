import { logger } from "./logger"
import { ValidationError, DataProcessingError, handleError } from "./error-handler"
import { githubApi } from "./github-api"

export interface CSVRow {
  difficulty: string
  title: string
  frequency: string
  acceptance_rate: number
  link: string
  company: string
  timeframe: string
  topics: string
}

export interface Question {
  difficulty: string
  title: string
  frequency: number
  acceptance_rate: number
  link: string
  company: string
  timeframe: string
  companies: string[]
  timeframes: string[]
  topics: string
  originalRows: CSVRow[]
}

export interface CompanyData {
  name: string
  totalProblems: number
  thirtyDays: number
  threeMonths: number
  sixMonths: number
  moreThanSixMonths: number
  all: number
}

export interface AnalyticsData {
  questions: Question[]
  companies: CompanyData[]
  stats: {
    totalProblems: number
    totalCompanies: number
    difficultyDistribution: Array<{ name: string; value: number; color: string }>
    timeframeDistribution: Array<{ name: string; value: number }>
    topTopics: Array<{ name: string; count: number }>
  }
  metadata: {
    lastCommitHash: string
    lastUpdated: string
    cloneDate: string
    commitUrl: string
    commitMessage: string
    commitAuthor: string
  }
}

export class CSVProcessor {
  private parseCSVRow(row: string): string[] {
    const values: string[] = []
    let inQuote = false
    let currentValue = ""

    for (let i = 0; i < row.length; i++) {
      const char = row[i]

      if (char === '"' && (i === 0 || row[i - 1] !== "\\")) {
        inQuote = !inQuote
      } else if (char === "," && !inQuote) {
        values.push(currentValue.trim())
        currentValue = ""
      } else {
        currentValue += char
      }
    }

    values.push(currentValue.trim())
    return values
  }

  private validateCSVHeaders(headers: string[]): void {
    const requiredHeaders = [
      "difficulty",
      "title",
      "frequency",
      "acceptance_rate",
      "link",
      "company",
      "timeframe",
      "topics",
    ]
    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))

    if (missingHeaders.length > 0) {
      throw new ValidationError(`Missing required CSV headers: ${missingHeaders.join(", ")}`)
    }
  }

  private parseFrequency(frequencyStr: string): number {
    if (!frequencyStr) return 50.0

    const freqStr = frequencyStr.toString().replace(/[^\d.]/g, "")
    const freqNum = Number.parseFloat(freqStr)

    return isNaN(freqNum) ? 50.0 : freqNum
  }

  private parseAcceptanceRate(acceptanceRate: any): number {
    if (acceptanceRate === undefined || acceptanceRate === null) return 50.0

    const rate = Number.parseFloat(acceptanceRate.toString())
    if (isNaN(rate)) return 50.0

    // If it's already a percentage (0-100), keep as is
    // If it's a decimal (0-1), convert to percentage
    const finalRate = rate <= 1 ? rate * 100 : rate
    return Math.round(finalRate * 100) / 100 // Round to 2 decimals
  }

  private calculateCompanyStats(questions: Question[]): CompanyData[] {
    const companiesMap = new Map<string, CompanyData>()

    for (const question of questions) {
      for (const company of question.companies) {
        if (!companiesMap.has(company)) {
          companiesMap.set(company, {
            name: company,
            totalProblems: 0,
            thirtyDays: 0,
            threeMonths: 0,
            sixMonths: 0,
            moreThanSixMonths: 0,
            all: 0,
          })
        }

        const companyData = companiesMap.get(company)!
        companyData.totalProblems += 1

        for (const timeframe of question.timeframes) {
          const timeframeLower = timeframe.toLowerCase()
          if (timeframeLower.includes("1 month") || timeframeLower.includes("thirty")) {
            companyData.thirtyDays += 1
          } else if (timeframeLower.includes("3 month") || timeframeLower.includes("three")) {
            companyData.threeMonths += 1
          } else if (timeframeLower.includes("6 month") || timeframeLower.includes("six")) {
            companyData.sixMonths += 1
          } else if (timeframeLower.includes("more than") || timeframeLower.includes("over")) {
            companyData.moreThanSixMonths += 1
          } else if (timeframeLower.includes("all")) {
            companyData.all += 1
          }
        }
      }
    }

    return Array.from(companiesMap.values()).sort((a, b) => b.totalProblems - a.totalProblems)
  }

  private calculateStats(questions: Question[]) {
    const difficultyCount = new Map<string, number>()
    const timeframeCount = new Map<string, number>()
    const topicCount = new Map<string, number>()

    for (const question of questions) {
      // Difficulty distribution
      const difficulty = question.difficulty
      difficultyCount.set(difficulty, (difficultyCount.get(difficulty) || 0) + 1)

      // Timeframe distribution
      for (const timeframe of question.timeframes) {
        timeframeCount.set(timeframe, (timeframeCount.get(timeframe) || 0) + 1)
      }

      // Topic counts
      if (question.topics) {
        const topics = question.topics
          .split(/[,;|]/)
          .map((t) => t.trim())
          .filter((t) => t)
        for (const topic of topics) {
          topicCount.set(topic, (topicCount.get(topic) || 0) + 1)
        }
      }
    }

    const difficultyDistribution = Array.from(difficultyCount.entries()).map(([name, value]) => ({
      name,
      value,
      color:
        name.toUpperCase() === "EASY"
          ? "#22c55e"
          : name.toUpperCase() === "MEDIUM"
            ? "#f59e0b"
            : name.toUpperCase() === "HARD"
              ? "#ef4444"
              : "#6b7280",
    }))

    const timeframeDistribution = Array.from(timeframeCount.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    const topTopics = Array.from(topicCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    return {
      totalProblems: questions.length,
      totalCompanies: new Set(questions.flatMap((q) => q.companies)).size,
      difficultyDistribution,
      timeframeDistribution,
      topTopics,
    }
  }

  async processCSVContent(csvContent: string): Promise<AnalyticsData> {
    try {
      logger.info("Starting CSV content processing", { contentLength: csvContent.length })

      if (!csvContent || csvContent.trim().length === 0) {
        throw new ValidationError("CSV content is empty")
      }

      const lines = csvContent.trim().split("\n")
      if (lines.length < 2) {
        throw new ValidationError("CSV file must have at least a header and one data row")
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
      logger.debug("CSV headers found", { headers })

      this.validateCSVHeaders(headers)

      // Parse all CSV rows first
      const csvRows: CSVRow[] = []
      let skippedRows = 0

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVRow(lines[i])
          if (values.length === headers.length) {
            const row: any = {}
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim().replace(/"/g, "") || ""
            })

            // Ensure we have the required fields
            if (row.title && row.company && row.timeframe) {
              csvRows.push({
                difficulty: row.difficulty || "Medium",
                title: row.title,
                frequency: row.frequency || "50",
                acceptance_rate: Number.parseFloat(row.acceptance_rate) || 0.5,
                link: row.link || "",
                company: row.company,
                timeframe: row.timeframe,
                topics: row.topics || "",
              })
            } else {
              skippedRows++
            }
          } else {
            skippedRows++
          }
        } catch (error) {
          logger.warn(`Error parsing row ${i}`, { error, line: lines[i] })
          skippedRows++
        }
      }

      logger.info("CSV rows parsed", { totalRows: csvRows.length, skippedRows })

      if (csvRows.length === 0) {
        throw new DataProcessingError("No valid data rows found in CSV")
      }

      // Group by title to create questions with multiple companies/timeframes
      const questionsMap = new Map<
        string,
        {
          data: Partial<Question>
          companies: Set<string>
          timeframes: Set<string>
          originalRows: CSVRow[]
        }
      >()

      for (const row of csvRows) {
        const title = row.title.trim()
        if (!title) continue

        if (!questionsMap.has(title)) {
          questionsMap.set(title, {
            companies: new Set(),
            timeframes: new Set(),
            originalRows: [],
            data: {
              title,
              difficulty: row.difficulty.trim() || "Medium",
              frequency: this.parseFrequency(row.frequency),
              acceptance_rate: this.parseAcceptanceRate(row.acceptance_rate),
              link: row.link.trim() || "",
              topics: row.topics.trim() || "",
            },
          })
        }

        const questionData = questionsMap.get(title)!
        questionData.companies.add(row.company.trim())
        questionData.timeframes.add(row.timeframe.trim())
        questionData.originalRows.push(row)
      }

      // Convert to final format
      const questions: Question[] = []
      for (const [title, questionData] of questionsMap) {
        if (questionData.companies.size > 0) {
          const companies = Array.from(questionData.companies).sort()
          const timeframes = Array.from(questionData.timeframes).sort()

          questions.push({
            ...questionData.data,
            companies,
            timeframes,
            company: companies[0] || "",
            timeframe: timeframes[0] || "",
            originalRows: questionData.originalRows,
          } as Question)
        }
      }

      logger.info("Questions processed", { uniqueQuestions: questions.length })

      const companies = this.calculateCompanyStats(questions)
      const stats = this.calculateStats(questions)

      // Fetch GitHub commit information
      logger.info("Fetching GitHub commit information")
      const githubInfo = await githubApi.getLastCommitInfo()

      const analyticsData: AnalyticsData = {
        questions,
        companies,
        stats,
        metadata: {
          lastCommitHash: githubInfo.lastCommit.sha,
          lastUpdated: githubInfo.lastUpdated,
          cloneDate: new Date().toISOString(),
          commitUrl: githubInfo.commitUrl,
          commitMessage: githubInfo.lastCommit.commit.message,
          commitAuthor: githubInfo.lastCommit.commit.author.name,
        },
      }

      logger.info("CSV processing completed successfully", {
        totalQuestions: questions.length,
        totalCompanies: companies.length,
        lastCommit: githubInfo.lastCommit.sha.substring(0, 7),
        processingTime: Date.now(),
      })

      return analyticsData
    } catch (error) {
      const appError = handleError(error, "CSV Processing")
      logger.error("CSV processing failed", appError)
      throw appError
    }
  }
}

export const csvProcessor = new CSVProcessor()
