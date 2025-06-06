export type SortDirection = 'asc' | 'desc'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type Timeframe = 'Last 6 Months' | 'Last Year' | 'Last 2 Years' | 'All Time'

export interface PaginationState {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface FilterState {
  companies: string[]
  difficulty: string[]
  timeframes: string[]
  topics: string[]
  searchTerm: string
}

export interface SortState {
  field: string
  direction: SortDirection
}

export interface QuestionMetadata {
  companies: string[]
  difficulties: string[]
  timeframes: string[]
  topics: string[]
}

export interface Question {
  title: string
  difficulty: Difficulty
  frequency: number
  acceptance_rate: number
  timeframe: string
  occurrences: number
  companies: string[]
  topics: string[]
  link: string
}

export interface ApiResponse<T> {
  data: T
  error: Error | null
  isLoading: boolean
}

export interface UseQuestionsResult {
  questions: Question[]
  metadata: QuestionMetadata
  loading: LoadingState
  filters: FilterState
  sort: SortState
  pagination: PaginationState
  setFilters: (filters: FilterState) => void
  setSort: (sort: SortState) => void
  setPage: (page: number) => void
  resetFilters: () => void
  error: string | null
  totalPages: number
  currentPage: number
  totalItems: number
  fetchQuestions: () => Promise<void>
} 