import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

interface CSVRow {
  difficulty: string
  title: string
  frequency: string
  acceptance_rate: number
  link: string
  company: string
  timeframe: string
  topics: string
}

interface Question {
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
  // Keep original CSV rows for accurate filtering
  originalRows: CSVRow[]
}

interface CompanyData {
  name: string
  totalProblems: number
  thirtyDays: number
  threeMonths: number
  sixMonths: number
  moreThanSixMonths: number
  all: number
}

interface AnalyticsData {
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
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== CSV PROCESSING START ===")

    const formData = await request.formData()
    const file = formData.get("csvFile") as File | null
    const useLocalFile = formData.get("useLocalFile") === "true"

    let csvContent: string

    if (useLocalFile) {
      // Use the GitHub raw URL for the CSV file
      console.log("Fetching CSV data from GitHub repository...")
      try {
        // const response = await fetch(
        //   "https://raw.githubusercontent.com/AlliterationofA/LeetcodeAnalyticsBackend/main/leetcode_company_questions.csv",
        // )
        const response = "codedata.csv"
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV data: ${response.status}`)
        }
        csvContent = await response.text()
        console.log("CSV data fetched successfully from GitHub")
      } catch (error) {
        console.error("Failed to fetch CSV data from GitHub:", error)
        // Fallback to local file if GitHub fetch fails
        const localFilePath = path.join(process.cwd(), "public", "data", "codedata.csv")
        try {
          csvContent = await fs.readFile(localFilePath, "utf-8")
          console.log("Fallback: Local CSV file loaded successfully")
        } catch (localError) {
          console.error("Failed to read local CSV file:", localError)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to fetch CSV data from GitHub and local file not found",
            },
            { status: 500 },
          )
        }
      }
    } else if (file) {
      // Use uploaded CSV file
      console.log("Processing uploaded CSV file...")
      csvContent = await file.text()
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No CSV file provided",
        },
        { status: 400 },
      )
    }

    console.log(`CSV content length: ${csvContent.length} characters`)

    // Parse CSV content
    const lines = csvContent.trim().split("\n")
    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header and one data row")
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("CSV headers:", headers)

    // Parse all CSV rows first
    const csvRows: CSVRow[] = []
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVRow(lines[i])
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
          }
        }
      } catch (error) {
        console.warn(`Error parsing row ${i}:`, error)
      }
    }

    console.log(`Parsed ${csvRows.length} CSV rows`)

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
        // Parse frequency (convert string to number)
        let frequency = 50.0
        if (row.frequency) {
          const freqStr = row.frequency.toString().replace(/[^\d.]/g, "")
          const freqNum = Number.parseFloat(freqStr)
          if (!isNaN(freqNum)) {
            frequency = freqNum
          }
        }

        // Parse acceptance rate
        let acceptanceRate = 50.0
        if (row.acceptance_rate !== undefined && row.acceptance_rate !== null) {
          const rate = Number.parseFloat(row.acceptance_rate.toString())
          if (!isNaN(rate)) {
            // If it's already a percentage (0-100), keep as is
            // If it's a decimal (0-1), convert to percentage
            acceptanceRate = rate <= 1 ? rate * 100 : rate
            acceptanceRate = Math.round(acceptanceRate * 100) / 100 // Round to 2 decimals
          }
        }

        questionsMap.set(title, {
          companies: new Set(),
          timeframes: new Set(),
          originalRows: [],
          data: {
            title,
            difficulty: row.difficulty.trim() || "Medium",
            frequency,
            acceptance_rate: acceptanceRate,
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

    console.log(`Deduplicated to ${questions.length} unique questions`)

    // Calculate company statistics
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

    const companies = Array.from(companiesMap.values()).sort((a, b) => b.totalProblems - a.totalProblems)

    // Calculate statistics
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

    const analyticsData: AnalyticsData = {
      questions,
      companies,
      stats: {
        totalProblems: questions.length,
        totalCompanies: companies.length,
        difficultyDistribution,
        timeframeDistribution,
        topTopics,
      },
      metadata: {
        lastCommitHash: "github-csv-data",
        lastUpdated: new Date().toISOString(),
        cloneDate: new Date().toISOString(),
      },
    }

    console.log("=== CSV PROCESSING SUCCESS ===")
    console.log(`📊 Total questions: ${questions.length}`)
    console.log(`🏢 Total companies: ${companies.length}`)

    return NextResponse.json({
      success: true,
      data: analyticsData,
    })
  } catch (error) {
    console.error("=== CSV PROCESSING FAILED ===", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process CSV",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    console.log("=== CSV DATA FILTERING START ===")

    // Parse URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const company = searchParams.get("company")
    const difficulty = searchParams.get("difficulty")
    const timeframe = searchParams.get("timeframe")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "10000")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("Filter parameters:", { company, difficulty, timeframe, search, limit, offset })

    // Load the CSV data from GitHub for filtering
    let csvContent: string
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/AlliterationofA/LeetcodeAnalyticsBackend/main/leetcode_company_questions.csv",
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV data: ${response.status}`)
      }
      csvContent = await response.text()
    } catch (error) {
      // Fallback to local file
      const localFilePath = path.join(process.cwd(), "public", "data", "codedata.csv")
      try {
        csvContent = await fs.readFile(localFilePath, "utf-8")
      } catch (localError) {
        return NextResponse.json(
          {
            success: false,
            error: "No data available. Please upload a CSV file first.",
          },
          { status: 404 },
        )
      }
    }

    // Parse CSV content
    const lines = csvContent.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    // Parse and filter CSV rows based on the original data
    const filteredRows: any[] = []
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVRow(lines[i])
        if (values.length === headers.length) {
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim().replace(/"/g, "") || ""
          })

          // Apply filters to original CSV rows
          let includeRow = true

          if (company && company !== "all" && row.company !== company) {
            includeRow = false
          }

          if (difficulty && difficulty !== "all" && row.difficulty !== difficulty) {
            includeRow = false
          }

          if (timeframe && timeframe !== "all" && row.timeframe !== timeframe) {
            includeRow = false
          }

          if (search) {
            const searchLower = search.toLowerCase()
            const matchesSearch =
              row.title?.toLowerCase().includes(searchLower) || row.topics?.toLowerCase().includes(searchLower)
            if (!matchesSearch) {
              includeRow = false
            }
          }

          if (includeRow) {
            filteredRows.push(row)
          }
        }
      } catch (error) {
        console.warn(`Error parsing row ${i}:`, error)
      }
    }

    // Now process the filtered rows to create questions
    const questionsMap = new Map<
      string,
      {
        data: Partial<Question>
        companies: Set<string>
        timeframes: Set<string>
        originalRows: any[]
      }
    >()

    for (const row of filteredRows) {
      const title = row.title?.trim()
      if (!title) continue

      if (!questionsMap.has(title)) {
        // Parse frequency
        let frequency = 50.0
        if (row.frequency) {
          const freqStr = row.frequency.toString().replace(/[^\d.]/g, "")
          const freqNum = Number.parseFloat(freqStr)
          if (!isNaN(freqNum)) {
            frequency = freqNum
          }
        }

        // Parse acceptance rate
        let acceptanceRate = 50.0
        if (row.acceptance_rate !== undefined && row.acceptance_rate !== null) {
          const rate = Number.parseFloat(row.acceptance_rate.toString())
          if (!isNaN(rate)) {
            acceptanceRate = rate <= 1 ? rate * 100 : rate
            acceptanceRate = Math.round(acceptanceRate * 100) / 100
          }
        }

        questionsMap.set(title, {
          companies: new Set(),
          timeframes: new Set(),
          originalRows: [],
          data: {
            title,
            difficulty: row.difficulty?.trim() || "Medium",
            frequency,
            acceptance_rate: acceptanceRate,
            link: row.link?.trim() || "",
            topics: row.topics?.trim() || "",
          },
        })
      }

      const questionData = questionsMap.get(title)!
      if (row.company?.trim()) {
        questionData.companies.add(row.company.trim())
      }
      if (row.timeframe?.trim()) {
        questionData.timeframes.add(row.timeframe.trim())
      }
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

    // Apply pagination
    const start = offset
    const end = limit ? start + limit : questions.length
    const paginatedQuestions = questions.slice(start, end)

    console.log(`Filtered to ${questions.length} questions, showing ${paginatedQuestions.length}`)

    return NextResponse.json({
      success: true,
      data: {
        questions: paginatedQuestions,
        totalQuestions: questions.length,
      },
    })
  } catch (error) {
    console.error("=== CSV DATA FILTERING FAILED ===", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to filter data",
      },
      { status: 500 },
    )
  }
}

function parseCSVRow(row: string): string[] {
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
