"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import {
  Search,
  TrendingUp,
  Building2,
  Code,
  Target,
  RefreshCw,
  Github,
  ListChecks,
  LayoutDashboard,
  BarChart2,
  Clock,
  Calendar,
  CalendarClock,
  History,
  ChevronDown,
  ChevronUp,
  Wrench,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import Image from "next/image"

// Custom components
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { FiltersPanel } from "@/components/analytics/filters-panel"
import { ProblemsTable } from "@/components/analytics/problems-table"
import { DataInfoCard } from "@/components/analytics/data-info-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { ResourcesSection } from "@/components/resources/resources-section"
import { resources } from "@/data/resources"

// Utilities and services
import { logger } from "@/lib/logger"
import { apiClient } from "@/lib/api-client"
import { csvProcessor, type AnalyticsData } from "@/lib/csv-processor"
import { AppError } from "@/lib/error-handler"
import { githubApi } from "@/lib/github-api"

type SortField = "title" | "difficulty" | "frequency" | "acceptance_rate" | "timeframe" | "occurrences"
type SortDirection = "asc" | "desc"

export default function LeetCodeAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [leetcodeRepoLastUpdated, setLeetcodeRepoLastUpdated] = useState<string | null>(null)

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>("title")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showMultiCompany, setShowMultiCompany] = useState(false)
  const [companyFilterMode, setCompanyFilterMode] = useState<"and" | "or">("or")
  const [topicFilterMode, setTopicFilterMode] = useState<"and" | "or">("or")

  // Calculate min/max for range filters
  const occurrencesStats = useMemo(() => {
    if (!data) return { min: 1, max: 278 }
    const values = data.questions.map(q => q.originalRows?.length || 0)
    return { min: Math.min(...values), max: Math.max(...values) }
  }, [data])
  const frequencyStats = useMemo(() => {
    if (!data) return { min: 5, max: 100 }
    const values = data.questions.map(q => q.frequency || 0)
    return { min: Math.min(...values), max: Math.max(...values) }
  }, [data])
  const acceptanceStats = useMemo(() => {
    if (!data) return { min: 0, max: 100 }
    const values = data.questions.map(q => q.acceptance_rate || 0)
    return { min: Math.min(...values), max: Math.max(...values) }
  }, [data])

  // Filters and sorting
  const [occurrencesRange, setOccurrencesRange] = useState<{ min: number | ""; max: number | "" }>({ min: 1, max: 278 })
  const [frequencyRange, setFrequencyRange] = useState<{ min: number | ""; max: number | "" }>({ min: 5, max: 100 })
  const [acceptanceRange, setAcceptanceRange] = useState<{ min: number | ""; max: number | "" }>({ min: 0, max: 100 })

  // Add state for expanded company and timeframe
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null)
  const [expandedTimeframe, setExpandedTimeframe] = useState<string | null>(null)

  // Add a ref for the Tabs component
  const tabsRef = useRef<any>(null)
  const [activeTab, setActiveTab] = useState('problems')

  // Helper to get problems for a company and timeframe
  function getCompanyProblems(companyName: string, timeframe: string | null) {
    if (!data) return []
    let filtered = data.questions.filter(q => q.companies.includes(companyName))
    if (timeframe && timeframe !== "total") {
      filtered = filtered.filter(q => q.timeframes.includes(timeframe))
    }
    return filtered
  }

  // Helper to get filtered problems for a company and timeframe, matching Problems tab logic
  function getFilteredProblemsForCompany(companyName: string, timeframe: string | null) {
    if (!data) return []
    // Use the same logic as filteredAndSortedQuestions, but only for the given company and timeframe
    return data.questions.filter((question) => {
      // Company filter: must include the company
      if (!question.companies.includes(companyName)) return false
      // Timeframe filter
      if (timeframe && timeframe !== 'total' && !question.timeframes.includes(timeframe)) return false
      // No other filters applied here (since Companies tab is for raw counts)
      return true
    })
  }

  // Extracted filtering logic for Problems tab and Companies tab stat counts
  function getFilteredQuestions({
    company = null,
    timeframe = null,
    search = "",
    difficulties = [],
    topics = [],
    showMultiCompany = false,
    companyFilterMode = "or",
    topicFilterMode = "or",
    occurrencesRange = occurrencesStats,
    frequencyRange = frequencyStats,
    acceptanceRange = acceptanceStats,
  }: {
    company?: string | null;
    timeframe?: string | null;
    search?: string;
    difficulties?: string[];
    topics?: string[];
    showMultiCompany?: boolean;
    companyFilterMode?: 'and' | 'or';
    topicFilterMode?: 'and' | 'or';
    occurrencesRange?: { min: number; max: number };
    frequencyRange?: { min: number; max: number };
    acceptanceRange?: { min: number; max: number };
  }) {
    if (!data) return []
    const occMin = typeof occurrencesRange.min === "number" ? occurrencesRange.min : occurrencesStats.min
    const occMax = typeof occurrencesRange.max === "number" ? occurrencesRange.max : occurrencesStats.max
    const freqMin = typeof frequencyRange.min === "number" ? frequencyRange.min : frequencyStats.min
    const freqMax = typeof frequencyRange.max === "number" ? frequencyRange.max : frequencyStats.max
    const accMin = typeof acceptanceRange.min === "number" ? acceptanceRange.min : acceptanceStats.min
    const accMax = typeof acceptanceRange.max === "number" ? acceptanceRange.max : acceptanceStats.max
    return data.questions.filter((question) => {
      // Check if any of the original rows match the filters
      const hasMatchingRow = question.originalRows?.some((row) => {
        // Search filter
        if (search) {
          const searchLower = search.toLowerCase()
          const matchesSearch =
            row.title?.toLowerCase().includes(searchLower) || row.topics?.toLowerCase().includes(searchLower)
          if (!matchesSearch) return false
        }
        // Company filter
        if (company && typeof company === 'string') {
          if (companyFilterMode === "and") {
            const questionCompanies = new Set(question.companies)
            if (!company.split(",").every((c: string) => questionCompanies.has(c))) {
              return false
            }
          } else {
            if (row.company !== company) {
              return false
            }
          }
        }
        // Difficulty filter
        if (difficulties.length > 0 && !difficulties.includes(row.difficulty)) {
          return false
        }
        // Timeframe filter
        if (timeframe && typeof timeframe === 'string' && timeframe !== "total" && row.timeframe !== timeframe) {
          return false
        }
        // Topic filter
        if (topics.length > 0) {
          const rowTopics = row.topics?.split(/[,;|]/).map((t) => t.trim()) || []
          if (topicFilterMode === "and") {
            if (!topics.every(topic => rowTopics.includes(topic))) {
              return false
            }
          } else {
            if (!topics.some(topic => rowTopics.includes(topic))) {
              return false
            }
          }
        }
        // Occurrences filter
        const occurrences = question.originalRows?.length || 0
        if (occurrences < occMin || occurrences > occMax) return false
        // Frequency filter
        if (question.frequency < freqMin || question.frequency > freqMax) return false
        // Acceptance filter
        if (question.acceptance_rate < accMin || question.acceptance_rate > accMax) return false
        return true
      })
      if (!hasMatchingRow) return false
      if (showMultiCompany && question.companies.length <= 1) {
        return false
      }
      return true
    })
  }

  // Memoized map of company/timeframe counts for Companies tab
  const companyTimeframeCounts = useMemo(() => {
    if (!data) return {}
    const timeframes = ["total", "1 Month", "3 Months", "6 Months", "More Than 6 Months"]
    const result: Record<string, Record<string, number>> = {}
    for (const company of data.companies) {
      result[company.name] = {}
      for (const timeframe of timeframes) {
        result[company.name][timeframe] = getFilteredQuestions({
          company: company.name,
          timeframe: timeframe === 'total' ? null : timeframe,
          search: "",
          difficulties: [],
          topics: [],
          showMultiCompany: false,
          companyFilterMode: 'or',
          topicFilterMode: 'or',
          occurrencesRange: occurrencesStats,
          frequencyRange: frequencyStats,
          acceptanceRange: acceptanceStats,
        }).length
      }
    }
    return result
  }, [data, occurrencesStats, frequencyStats, acceptanceStats])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Handle CSV processing
  const handleCSVProcessing = async (useGitHubData = true) => {
    try {
      setProcessing(true)
      setError(null)
      setSuccess(null)

      logger.info("Starting CSV processing", { useGitHubData })

      let csvContent: string

      if (useGitHubData) {
        csvContent = await apiClient.fetchGitHubCSV()
      } else {
        throw new AppError("File upload not supported in this version", "FEATURE_DISABLED")
      }

      const analyticsData = await csvProcessor.processCSVContent(csvContent)

      setData(analyticsData)
      setSuccess(useGitHubData ? "GitHub CSV data loaded successfully" : "CSV file processed successfully")
      setLoading(false)

      logger.info("CSV processing completed successfully", {
        questionsCount: analyticsData.questions.length,
        companiesCount: analyticsData.companies.length,
        lastUpdated: analyticsData.metadata.lastUpdated,
      })

      // Fetch last commit for the leetcode-company-wise-problems repo
      const leetcodeRepoInfo = await githubApi.getLastCommitInfo(
        "liquidslr",
        "leetcode-company-wise-problems"
      )
      setLeetcodeRepoLastUpdated(leetcodeRepoInfo.lastUpdated)
    } catch (error) {
      const errorMessage = error instanceof AppError ? error.message : "Failed to process CSV data"
      logger.error("CSV processing failed", error instanceof Error ? error : new Error(String(error)))
      setError(errorMessage)
      setLoading(false)
    } finally {
      setProcessing(false)
    }
  }

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        logger.info("Initializing LeetCode Analytics application")
        await handleCSVProcessing(true)
      } catch (error) {
        logger.error("Application initialization failed", error instanceof Error ? error : new Error(String(error)))
        setError("Failed to load GitHub data. Please try refreshing the page.")
        setLoading(false)
      }
    }

    initializeData()
  }, [])

  // Sorting and filtering logic
  const handleSort = (field: SortField) => {
    logger.debug("Sorting table", { field, currentSort: sortField, currentDirection: sortDirection })

    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Get unique values for filters from original data
  const availableCompanies = useMemo(() => {
    if (!data) return []
    const companies = new Set<string>()
    data.questions.forEach((q) => {
      q.companies.forEach((company) => companies.add(company))
    })
    return Array.from(companies).sort()
  }, [data])

  const availableDifficulties = useMemo(() => {
    if (!data) return []
    return Array.from(new Set(data.questions.map((q) => q.difficulty))).sort()
  }, [data])

  const availableTimeframes = useMemo(() => {
    if (!data) return []
    const timeframes = new Set<string>()
    data.questions.forEach((q) => {
      q.timeframes.forEach((timeframe) => timeframes.add(timeframe))
    })
    return Array.from(timeframes).sort()
  }, [data])

  const availableTopics = useMemo(() => {
    if (!data) return []
    const topicsSet = new Set<string>()
    data.questions.forEach((q) => {
      if (q.topics) {
        q.topics
          .split(/[,;|]/)
          .map((t) => t.trim())
          .filter((t) => t)
          .forEach((topic) => topicsSet.add(topic))
      }
    })
    return Array.from(topicsSet).sort()
  }, [data])

  // Filter questions based on original CSV rows to maintain data integrity
  const filteredAndSortedQuestions = useMemo(() => {
    if (!data) return []

    logger.debug("Filtering questions", {
      totalQuestions: data.questions.length,
      filters: {
        searchTerm,
        selectedCompanies,
        selectedDifficulties,
        selectedTimeframes,
        selectedTopics,
        showMultiCompany,
        companyFilterMode,
        topicFilterMode,
        occurrencesRange,
        frequencyRange,
        acceptanceRange,
      },
    })

    // Get effective min/max for each range
    const occMin = typeof occurrencesRange.min === "number" ? occurrencesRange.min : 1
    const occMax = typeof occurrencesRange.max === "number" ? occurrencesRange.max : 278
    const freqMin = typeof frequencyRange.min === "number" ? frequencyRange.min : 5
    const freqMax = typeof frequencyRange.max === "number" ? frequencyRange.max : 100
    const accMin = typeof acceptanceRange.min === "number" ? acceptanceRange.min : 0
    const accMax = typeof acceptanceRange.max === "number" ? acceptanceRange.max : 100

    // Filter questions based on their original CSV rows to maintain data integrity
    const filtered = data.questions.filter((question) => {
      // Check if any of the original rows match the filters
      const hasMatchingRow = question.originalRows?.some((row) => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          const matchesSearch =
            row.title?.toLowerCase().includes(searchLower) || row.topics?.toLowerCase().includes(searchLower)
          if (!matchesSearch) return false
        }

        // Company filter
        if (selectedCompanies.length > 0) {
          if (companyFilterMode === "and") {
            // AND operation: question must appear in ALL selected companies
            const questionCompanies = new Set(question.companies)
            if (!selectedCompanies.every(company => questionCompanies.has(company))) {
              return false
            }
          } else {
            // OR operation: question must appear in ANY selected company
            if (!selectedCompanies.includes(row.company)) {
              return false
            }
          }
        }

        // Difficulty filter
        if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(row.difficulty)) {
          return false
        }

        // Timeframe filter
        if (selectedTimeframes.length > 0 && !selectedTimeframes.includes(row.timeframe)) {
          return false
        }

        // Topic filter
        if (selectedTopics.length > 0) {
          const topics = row.topics?.split(/[,;|]/).map((t) => t.trim()) || []
          if (topicFilterMode === "and") {
            // AND operation: question must have ALL selected topics
            if (!selectedTopics.every(topic => topics.includes(topic))) {
              return false
            }
          } else {
            // OR operation: question must have ANY selected topic
            if (!selectedTopics.some(topic => topics.includes(topic))) {
              return false
            }
          }
        }

        // Occurrences filter
        const occurrences = question.originalRows?.length || 0
        if (occurrences < occMin || occurrences > occMax) return false
        // Frequency filter
        if (question.frequency < freqMin || question.frequency > freqMax) return false
        // Acceptance filter
        if (question.acceptance_rate < accMin || question.acceptance_rate > accMax) return false
        return true
      })

      if (!hasMatchingRow) return false

      // Multi-company filter
      if (showMultiCompany && question.companies.length <= 1) {
        return false
      }

      return true
    })

    // Sort the filtered results
    const sorted = filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "difficulty":
          const difficultyOrder = { EASY: 1, MEDIUM: 2, HARD: 3 }
          aValue = difficultyOrder[a.difficulty.toUpperCase() as keyof typeof difficultyOrder] || 2
          bValue = difficultyOrder[b.difficulty.toUpperCase() as keyof typeof difficultyOrder] || 2
          break
        case "frequency":
          aValue = a.frequency || 0
          bValue = b.frequency || 0
          break
        case "acceptance_rate":
          aValue = a.acceptance_rate || 0
          bValue = b.acceptance_rate || 0
          break
        case "timeframe":
          aValue = a.timeframe.toLowerCase()
          bValue = b.timeframe.toLowerCase()
          break
        case "occurrences":
          aValue = a.originalRows?.length || 0
          bValue = b.originalRows?.length || 0
          break
        default:
          return 0
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    logger.debug("Filtering completed", { filteredCount: sorted.length })
    return sorted
  }, [
    data,
    searchTerm,
    selectedCompanies,
    selectedDifficulties,
    selectedTimeframes,
    selectedTopics,
    sortField,
    sortDirection,
    showMultiCompany,
    companyFilterMode,
    topicFilterMode,
    occurrencesRange,
    frequencyRange,
    acceptanceRange,
    occurrencesStats,
    frequencyStats,
    acceptanceStats,
  ])

  // Add date formatting helper
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md space-y-4">
          <LoadingSpinner size="lg" text="Loading LeetCode Analytics" />
          <p className="text-muted-foreground">Loading data from GitHub repository...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">No Data Available</h2>
            <p className="text-muted-foreground">Load data from the GitHub repository to get started.</p>
          </div>

          <Button size="lg" onClick={() => handleCSVProcessing(true)} disabled={processing} className="w-full">
            {processing ? <LoadingSpinner size="sm" className="mr-2" /> : <Github className="h-4 w-4 mr-2" />}
            {processing ? "Loading..." : "Load GitHub Data"}
          </Button>

          {error && <StatusIndicator status="error" message={error} />}

          {success && <StatusIndicator status="success" message={success} />}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="flex flex-col gap-4 p-4 md:p-6">
          {/* Header Section */}
          <header
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full px-2 sm:px-0"
            role="banner"
            aria-label="LeetCode Analytics main header"
          >
            {/* Left: Logo, Title, Subtitle */}
            <div className="flex flex-row items-center gap-3 sm:gap-4 w-full md:w-auto min-w-0">
              <Image src="/leetcode-analytics-logo.svg" alt="Site Logo" width={48} height={48} className="rounded" aria-label="LeetCode Analytics Logo" />
              <div className="flex flex-col gap-1 min-w-0">
                <h1 className="text-2xl font-bold md:text-3xl tracking-tight drop-shadow-sm truncate" aria-label="LeetCode Analytics Title">
                  LeetCode <span className="text-primary">Analytics</span>
                </h1>
                <p className="text-sm text-muted-foreground truncate" aria-label="App subtitle">
                  Track and analyze company-wise LeetCode problems
                </p>
              </div>
            </div>
            {/* Right: Search, Refresh, Theme */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full sm:w-auto md:justify-end mt-2 md:mt-0 min-w-0">
              <Input
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value) {
                    const problemsSection = document.getElementById('problems-section');
                    if (problemsSection) {
                      problemsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="w-full sm:w-[300px] md:w-[400px] rounded-lg shadow-sm px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-150 hover:shadow-md min-w-0"
                aria-label="Search problems"
              />
              <Button
                variant="default"
                onClick={() => handleCSVProcessing(true)}
                disabled={processing}
                className="w-full sm:w-auto font-semibold rounded-lg px-5 py-2 shadow-sm transition-colors duration-150 focus:ring-2 focus:ring-primary focus:outline-none hover:bg-primary/90 min-w-[120px]"
                aria-label="Refresh Data"
              >
                {processing ? (
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full inline-block align-middle" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Data
              </Button>
              <span className="focus-visible:ring-2 focus-visible:ring-primary rounded transition-all duration-150 mt-1 sm:mt-0">
                <ThemeToggle />
              </span>
            </div>
          </header>

          {/* Stats Cards Row - Match Screenshot Exactly, with Date Formatting and No Overflow */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 mb-6">
            {/* Last Updated Card (Inverted) */}
            <Card className="flex flex-col justify-between bg-card-foreground text-card rounded-xl shadow-sm col-span-1 min-w-[180px] p-0 h-[120px] overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium whitespace-nowrap">Last Updated</CardTitle>
                <Calendar className="h-4 w-4 text-card/80 flex-shrink-0" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end px-4 pb-3 pt-0 min-h-0">
                <div className="text-2xl font-bold leading-tight mb-1 truncate">{formatDate(data.metadata.lastUpdated)}</div>
                <div className="flex items-center gap-2 text-xs opacity-80 flex-wrap mt-1">
                  <span className="whitespace-nowrap">Maintained by</span>
                  <img src="https://github.com/AlliterationofA.png" alt="AlliterationofA GitHub" className="h-5 w-5 rounded-full border border-card bg-card flex-shrink-0" />
                  <a href="https://github.com/AlliterationofA" target="_blank" rel="noopener noreferrer" className="ml-1 underline truncate">@AlliterationofA</a>
                </div>
              </CardContent>
            </Card>

            {/* Total Problems */}
            <Card className="flex flex-col justify-between bg-card text-card-foreground rounded-xl shadow-sm col-span-1 min-w-[140px] p-0 h-[120px] overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium whitespace-nowrap">Total Problems</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end px-4 pb-3 pt-0 min-h-0">
                <div className="text-2xl font-bold leading-tight mb-1 truncate">{data.stats.totalProblems.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground truncate">Unique problems tracked</div>
              </CardContent>
            </Card>

            {/* Companies */}
            <Card className="flex flex-col justify-between bg-card text-card-foreground rounded-xl shadow-sm col-span-1 min-w-[140px] p-0 h-[120px] overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium whitespace-nowrap">Companies</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end px-4 pb-3 pt-0 min-h-0">
                <div className="text-2xl font-bold leading-tight mb-1 truncate">{data.stats.totalCompanies.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground truncate">Tech companies tracked</div>
              </CardContent>
            </Card>

            {/* Avg Frequency */}
            <Card className="flex flex-col justify-between bg-card text-card-foreground rounded-xl shadow-sm col-span-1 min-w-[140px] p-0 h-[120px] overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium whitespace-nowrap">Avg Frequency</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end px-4 pb-3 pt-0 min-h-0">
                <div className="text-2xl font-bold leading-tight mb-1 truncate">
                  {data.questions.length > 0
                    ? (data.questions.reduce((sum, q) => sum + q.frequency, 0) / data.questions.length).toFixed(1)
                    : "0"}
                </div>
                <div className="text-xs text-muted-foreground truncate">Average problem frequency</div>
              </CardContent>
            </Card>

            {/* Avg Acceptance */}
            <Card className="flex flex-col justify-between bg-card text-card-foreground rounded-xl shadow-sm col-span-1 min-w-[140px] p-0 h-[120px] overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium whitespace-nowrap">Avg Acceptance</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end px-4 pb-3 pt-0 min-h-0">
                <div className="text-2xl font-bold leading-tight mb-1 truncate">
                  {data.questions.length > 0
                    ? (data.questions.reduce((sum, q) => sum + q.acceptance_rate, 0) / data.questions.length).toFixed(2) + "%"
                    : "0%"}
                </div>
                <div className="text-xs text-muted-foreground truncate">Average acceptance rate</div>
              </CardContent>
            </Card>

            {/* Data Source Last Updated */}
            <Card className="flex flex-col justify-between bg-card text-card-foreground rounded-xl shadow-sm col-span-1 min-w-[180px] p-0 h-[120px] overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium whitespace-nowrap">Data Source Last Updated</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end px-4 pb-3 pt-0 min-h-0">
                <div className="text-2xl font-bold leading-tight mb-1 truncate">{formatDate(data.metadata.lastUpdated)}</div>
                <div className="text-xs text-muted-foreground truncate">From liquidslr/leetcode-company-wise-problems</div>
              </CardContent>
            </Card>
          </div>


          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6" ref={tabsRef}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="problems" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">Problems</span>
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Companies</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Resources</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="problems" className="space-y-4 md:space-y-6" id="problems-section">
              {/* Filters Panel */}
              <FiltersPanel
                selectedCompanies={selectedCompanies}
                selectedDifficulties={selectedDifficulties}
                selectedTimeframes={selectedTimeframes}
                selectedTopics={selectedTopics}
                showMultiCompany={showMultiCompany}
                availableCompanies={availableCompanies}
                availableDifficulties={availableDifficulties}
                availableTimeframes={availableTimeframes}
                availableTopics={availableTopics}
                onCompaniesChange={setSelectedCompanies}
                onDifficultiesChange={setSelectedDifficulties}
                onTimeframesChange={setSelectedTimeframes}
                onTopicsChange={setSelectedTopics}
                onMultiCompanyToggle={() => setShowMultiCompany(!showMultiCompany)}
                filteredCount={filteredAndSortedQuestions.length}
                totalCount={data.questions.length}
                companyFilterMode={companyFilterMode}
                onCompanyFilterModeChange={setCompanyFilterMode}
                topicFilterMode={topicFilterMode}
                onTopicFilterModeChange={setTopicFilterMode}
                occurrencesRange={occurrencesRange}
                onOccurrencesRangeChange={setOccurrencesRange}
                frequencyRange={frequencyRange}
                onFrequencyRangeChange={setFrequencyRange}
                acceptanceRange={acceptanceRange}
                onAcceptanceRangeChange={setAcceptanceRange}
                occurrencesStats={occurrencesStats}
                frequencyStats={frequencyStats}
                acceptanceStats={acceptanceStats}
              />

              {/* Problems Table Title Row with Reset Filters Button */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  Problems ({filteredAndSortedQuestions.length.toLocaleString()})
                </h2>
                {(
                  selectedCompanies.length > 0 ||
                  selectedDifficulties.length > 0 ||
                  selectedTimeframes.length > 0 ||
                  selectedTopics.length > 0 ||
                  showMultiCompany ||
                  companyFilterMode !== 'or' ||
                  topicFilterMode !== 'or' ||
                  occurrencesRange.min !== occurrencesStats.min ||
                  occurrencesRange.max !== occurrencesStats.max ||
                  frequencyRange.min !== frequencyStats.min ||
                  frequencyRange.max !== frequencyStats.max ||
                  acceptanceRange.min !== acceptanceStats.min ||
                  acceptanceRange.max !== acceptanceStats.max
                ) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCompanies([])
                      setSelectedDifficulties([])
                      setSelectedTimeframes([])
                      setSelectedTopics([])
                      setShowMultiCompany(false)
                      setCompanyFilterMode('or')
                      setTopicFilterMode('or')
                      setOccurrencesRange({ min: occurrencesStats.min, max: occurrencesStats.max })
                      setFrequencyRange({ min: frequencyStats.min, max: frequencyStats.max })
                      setAcceptanceRange({ min: acceptanceStats.min, max: acceptanceStats.max })
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>

              {/* Problems Table */}
              <ProblemsTable
                questions={filteredAndSortedQuestions}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </TabsContent>

            <TabsContent value="companies" className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.companies.map((company) => (
                  <Card 
                    key={company.name} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://logo.clearbit.com/${company.name.toLowerCase().replace(/\s+/g, '')}.com`}
                          alt={`${company.name} logo`}
                          className="w-8 h-8 rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(company.name) + '&background=random';
                          }}
                        />
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <CardDescription>Problem statistics</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          { label: "Total Problems", timeframe: "total" },
                          { label: "30 Days", timeframe: "1 Month" },
                          { label: "3 Months", timeframe: "3 Months" },
                          { label: "6 Months", timeframe: "6 Months" },
                          { label: "More Than 6 Months", timeframe: "More Than 6 Months" },
                        ].map((section) => (
                          <div key={section.label}>
                            <button
                              className="flex items-center justify-between w-full text-left py-1 px-2 rounded hover:bg-muted focus:outline-none"
                              onClick={() => {
                                setSelectedCompanies([company.name])
                                setSelectedDifficulties([] as string[])
                                setSelectedTimeframes(section.timeframe === "total" ? [] : [section.timeframe as string])
                                setSelectedTopics([] as string[])
                                setShowMultiCompany(false)
                                setCompanyFilterMode('or')
                                setTopicFilterMode('or')
                                setOccurrencesRange({ min: occurrencesStats.min, max: occurrencesStats.max })
                                setFrequencyRange({ min: frequencyStats.min, max: frequencyStats.max })
                                setAcceptanceRange({ min: acceptanceStats.min, max: acceptanceStats.max })
                                setActiveTab('problems');
                                // Scroll to problems section
                                const problemsSection = document.getElementById('problems-section');
                                if (problemsSection) {
                                  setTimeout(() => problemsSection.scrollIntoView({ behavior: 'smooth' }), 100);
                                }
                              }}
                            >
                              <span className="font-medium text-sm">{section.label}:</span>
                              <span className="font-mono text-base">{companyTimeframeCounts[company.name]?.[section.timeframe] ?? 0}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Difficulty Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Difficulty Distribution</CardTitle>
                    <CardDescription>Problems by difficulty level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        easy: { label: "Easy", color: "#22c55e" },
                        medium: { label: "Medium", color: "#f59e0b" },
                        hard: { label: "Hard", color: "#ef4444" },
                      }}
                      className="h-[250px] md:h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.stats.difficultyDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                            labelLine={false}
                          >
                            {data.stats.difficultyDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Top Companies */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Companies</CardTitle>
                    <CardDescription>Companies with most problems</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        problems: { label: "Problems", color: "hsl(var(--chart-1))" },
                      }}
                      className="h-[250px] md:h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.companies.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Bar dataKey="totalProblems" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Timeframe Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Timeframe Distribution</CardTitle>
                    <CardDescription>Problems by timeframe</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        problems: { label: "Problems", color: "hsl(var(--chart-2))" },
                      }}
                      className="h-[250px] md:h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.stats.timeframeDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Top Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Topics</CardTitle>
                    <CardDescription>Most common problem topics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        problems: { label: "Problems", color: "hsl(var(--chart-3))" },
                      }}
                      className="h-[250px] md:h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.stats.topTopics.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4 md:space-y-6">
              <ResourcesSection resources={resources} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  )
}
