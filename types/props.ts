import { ReactNode } from 'react'
import { 
  AnalyticsData,
  FilterState,
  SortState,
  Stats,
  SortField,
  FilterMode,
  RangeFilter,
  ProcessedQuestion,
  CompanyTimeframeData
} from './analytics'

// Props for the main LeetCodeAnalytics component
export interface LeetCodeAnalyticsProps {
  initialData?: AnalyticsData
}

// Props for the FiltersPanel component
export interface FiltersPanelProps {
  filters: FilterState
  stats: {
    occurrences: Stats
    frequency: Stats
    acceptance: Stats
  }
  onFilterChange: (newFilters: Partial<FilterState>) => void
  companies: string[]
  difficulties: string[]
  timeframes: string[]
  topics: string[]
}

// Props for the ProblemsTable component
export interface ProblemsTableProps {
  questions: ProcessedQuestion[]
  sort: SortState
  onSort: (field: SortField) => void
  loading?: boolean
}

// Props for the DataInfoCard component
export interface DataInfoCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  loading?: boolean
}

// Props for the ResourcesSection component
export interface ResourcesSectionProps {
  resources: {
    title: string
    description: string
    url: string
    category: string
  }[]
}

// Props for the CompanyAnalytics component
export interface CompanyAnalyticsProps {
  data: CompanyTimeframeData[]
  loading?: boolean
}

// Props for the StatusIndicator component
export interface StatusIndicatorProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

// Props for the LoadingSpinner component
export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
} 