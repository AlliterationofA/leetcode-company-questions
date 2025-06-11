// Core type definitions for LeetCode Analytics

// Sort options
export type SortField = "title" | "difficulty" | "frequency" | "acceptance_rate" | "timeframe" | "occurrences"
export type SortDirection = "asc" | "desc"

// Filter modes
export type FilterMode = "and" | "or"

// Range type for numeric filters
export interface RangeFilter {
  min: number | ""
  max: number | ""
}

// Stats type for numeric fields
export interface Stats {
  min: number
  max: number
}

// Question row from CSV
export interface QuestionRow {
  title: string
  difficulty: string
  company: string
  timeframe: string
  topics: string
  frequency?: number
  acceptance_rate?: number
}

// Processed question data
export interface ProcessedQuestion {
  title: string
  difficulty: string
  companies: string[]
  timeframes: string[]
  topics: string[]
  frequency?: number
  acceptance_rate?: number
  originalRows?: QuestionRow[]
}

// Main analytics data structure
export interface AnalyticsData {
  questions: ProcessedQuestion[]
  companies: string[]
  difficulties: string[]
  timeframes: string[]
  topics: string[]
}

// Filter state interface
export interface FilterState {
  searchTerm: string
  selectedCompanies: string[]
  selectedDifficulties: string[]
  selectedTimeframes: string[]
  selectedTopics: string[]
  showMultiCompany: boolean
  companyFilterMode: FilterMode
  topicFilterMode: FilterMode
  occurrencesRange: RangeFilter
  frequencyRange: RangeFilter
  acceptanceRange: RangeFilter
}

// Sort state interface
export interface SortState {
  field: SortField
  direction: SortDirection
}

// Chart data types
export interface ChartData {
  name: string
  value: number
}

export interface CompanyTimeframeData {
  company: string
  timeframe: string | null
  count: number
} 