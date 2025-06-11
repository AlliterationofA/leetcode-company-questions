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

export async function POST() {
  return NextResponse.json({ status: 'ok' }, { status: 200 })
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
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("Filter parameters:", { company, difficulty, timeframe, search, offset })

    // Load the CSV data from GitHub for filtering
    let csvContent: string
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/AlliterationofA/PublicFiles/main/codedata.csv",
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
    const paginatedQuestions = questions.slice(start)

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
