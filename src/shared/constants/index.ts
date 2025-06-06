import { Difficulty, Timeframe } from '../types'

export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100
export const MIN_PAGE_SIZE = 10

export const DIFFICULTY_COLORS = {
  Easy: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Hard: 'bg-red-100 text-red-800 border-red-200',
} as const

export const SORT_FIELDS = {
  title: 'Title',
  difficulty: 'Difficulty',
  frequency: 'Frequency',
  acceptance_rate: 'Acceptance Rate',
  timeframe: 'Timeframe',
  occurrences: 'Occurrences',
} as const

export const EXPANDABLE_LIMITS = {
  companies: 3,
  topics: 3,
  timeframes: 3,
} as const

export const TIMEFRAMES: Timeframe[] = [
  'Last 6 Months',
  'Last Year',
  'Last 2 Years',
  'All Time'
]

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard']

export const DEBOUNCE_DELAY = 300

export const ERROR_MESSAGES = {
  INVALID_PERCENTAGE: 'Invalid percentage value',
  INVALID_FREQUENCY: 'Invalid frequency value',
  INVALID_TIMEFRAME: 'Invalid timeframe value',
  INVALID_DIFFICULTY: 'Invalid difficulty value',
  FETCH_ERROR: 'Error fetching data',
  SAVE_ERROR: 'Error saving data'
} as const

export const API_ENDPOINTS = {
  QUESTIONS: '/api/questions',
  METADATA: '/api/metadata'
} as const

export const LOCAL_STORAGE_KEYS = {
  FILTERS: 'question-filters',
  SORT: 'question-sort',
  PAGINATION: 'question-pagination'
} as const

export const DEFAULT_SORT = {
  field: 'occurrences',
  direction: 'desc' as const,
}

export const DEFAULT_FILTERS = {
  companies: [],
  difficulty: [],
  timeframes: [],
  topics: [],
  searchTerm: '',
} as const

export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalPages: 1,
  totalItems: 0,
} as const

export const DEFAULT_LOADING = {
  isLoading: false,
  error: null,
} as const

export const DEFAULT_METADATA = {
  companies: [],
  difficulties: [],
  timeframes: [],
  topics: [],
} as const 