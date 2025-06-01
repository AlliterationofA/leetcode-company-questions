"use client"
import { useState, useEffect, useMemo } from "react"
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
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

// Custom components
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { FiltersPanel } from "@/components/analytics/filters-panel"
import { ProblemsTable } from "@/components/analytics/problems-table"
import { DataInfoCard } from "@/components/analytics/data-info-card"

// Utilities and services
import { logger } from "@/lib/logger"
import { apiClient } from "@/lib/api-client"
import { csvProcessor, type AnalyticsData } from "@/lib/csv-processor"
import { AppError } from "@/lib/error-handler"

type SortField = "title" | "difficulty" | "frequency" | "acceptance_rate" | "timeframe" | "occurrences"
type SortDirection = "asc" | "desc"

export default function LeetCodeAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState("all")
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [sortField, setSortField] = useState<SortField>("title")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showMultiCompany, setShowMultiCompany] = useState(false)

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
        selectedCompany,
        selectedDifficulty,
        selectedTimeframe,
        selectedTopic,
        showMultiCompany,
      },
    })

    // Filter questions based on their original CSV rows
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
        if (selectedCompany !== "all" && row.company !== selectedCompany) {
          return false
        }

        // Difficulty filter
        if (selectedDifficulty !== "all" && row.difficulty !== selectedDifficulty) {
          return false
        }

        // Timeframe filter
        if (selectedTimeframe !== "all" && row.timeframe !== selectedTimeframe) {
          return false
        }

        // Topic filter
        if (selectedTopic !== "all") {
          const topics = row.topics?.split(/[,;|]/).map((t) => t.trim()) || []
          if (!topics.includes(selectedTopic)) {
            return false
          }
        }

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
    selectedCompany,
    selectedDifficulty,
    selectedTimeframe,
    selectedTopic,
    sortField,
    sortDirection,
    showMultiCompany,
  ])

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
        {/* Header */}
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Code className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl font-bold">LeetCode Analytics</h1>
                </div>
                <Badge variant="default">GitHub Data</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search problems or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => handleCSVProcessing(true)} disabled={processing}>
                  {processing ? <LoadingSpinner size="sm" className="mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Status Messages */}
          {success && (
            <div className="mb-6">
              <StatusIndicator status="success" message={success} />
            </div>
          )}

          {error && (
            <div className="mb-6">
              <StatusIndicator status="error" message={error} />
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalProblems.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Unique problems tracked</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalCompanies}</div>
                <p className="text-xs text-muted-foreground">Tech companies tracked</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Frequency</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.questions.length > 0
                    ? (data.questions.reduce((sum, q) => sum + q.frequency, 0) / data.questions.length).toFixed(1)
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground">Average problem frequency</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Acceptance</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.questions.length > 0
                    ? (data.questions.reduce((sum, q) => sum + q.acceptance_rate, 0) / data.questions.length).toFixed(2)
                    : "0"}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Average acceptance rate</p>
              </CardContent>
            </Card>

            {/* Data Info Card */}
            <DataInfoCard metadata={data.metadata} />
          </div>

          {/* Main Content */}
          <Tabs defaultValue="problems" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="problems" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Problems
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Companies
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="problems" className="space-y-6">
              {/* Filters */}
              <FiltersPanel
                selectedCompany={selectedCompany}
                selectedDifficulty={selectedDifficulty}
                selectedTimeframe={selectedTimeframe}
                selectedTopic={selectedTopic}
                showMultiCompany={showMultiCompany}
                availableCompanies={availableCompanies}
                availableDifficulties={availableDifficulties}
                availableTimeframes={availableTimeframes}
                availableTopics={availableTopics}
                onCompanyChange={setSelectedCompany}
                onDifficultyChange={setSelectedDifficulty}
                onTimeframeChange={setSelectedTimeframe}
                onTopicChange={setSelectedTopic}
                onMultiCompanyToggle={() => setShowMultiCompany(!showMultiCompany)}
                filteredCount={filteredAndSortedQuestions.length}
                totalCount={data.questions.length}
              />

              {/* Problems Table */}
              <ProblemsTable
                questions={filteredAndSortedQuestions}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                maxDisplayCount={100}
              />
            </TabsContent>

            <TabsContent value="companies" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.companies.map((company) => (
                  <Card key={company.name} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Total Problems:
                          </span>
                          <span className="font-semibold">{company.totalProblems}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            30 Days:
                          </span>
                          <span>{company.thirtyDays}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />3 Months:
                          </span>
                          <span>{company.threeMonths}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />6 Months:
                          </span>
                          <span>{company.sixMonths}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm flex items-center gap-1">
                            <History className="h-3 w-3" />
                            More Than 6 Months:
                          </span>
                          <span>{company.moreThanSixMonths}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      className="h-[300px]"
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
                      className="h-[300px]"
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
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeframe Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Timeframe Distribution</CardTitle>
                    <CardDescription>Problems by timeframe across all companies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.stats.timeframeDistribution.map((timeframe) => {
                        const percentage =
                          data.stats.totalProblems > 0 ? (timeframe.value / data.stats.totalProblems) * 100 : 0

                        return (
                          <div key={timeframe.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="font-medium">{timeframe.name}</div>
                              <Badge variant="outline">{timeframe.value} problems</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-12">{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Topics</CardTitle>
                    <CardDescription>Most frequently used problem topics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        count: { label: "Count", color: "hsl(var(--chart-2))" },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.stats.topTopics.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  )
}
