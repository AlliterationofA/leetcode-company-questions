import { useState, useCallback, useEffect, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { 
  Question, 
  FilterState, 
  SortState, 
  PaginationState,
  QuestionMetadata,
  UseQuestionsResult
} from '../../shared/types'
import { 
  DEFAULT_PAGE_SIZE, 
  LOCAL_STORAGE_KEYS,
  DEBOUNCE_DELAY 
} from '../../shared/constants'
import { 
  debounce, 
  filterBySearchTerm, 
  sortByProperty,
  chunkArray,
  AppError
} from '../../shared/utils'
import { GetQuestionsUseCase } from '../../application/use-cases/GetQuestionsUseCase'
import { GetMetadataUseCase } from '../../application/use-cases/GetMetadataUseCase'
import { CsvQuestionRepository } from '../../infrastructure/repositories/CsvQuestionRepository'

const initialFilters: FilterState = {
  companies: [],
  difficulty: [],
  timeframes: [],
  topics: [],
  searchTerm: ''
}

const initialSort: SortState = {
  field: 'occurrences',
  direction: 'desc'
}

const initialPagination: PaginationState = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalPages: 1,
  totalItems: 0
}

export function useQuestions(): UseQuestionsResult {
  const [questions, setQuestions] = useState<Question[]>([])
  const [metadata, setMetadata] = useState<QuestionMetadata>({
    companies: [],
    difficulties: [],
    timeframes: [],
    topics: []
  })
  const [loading, setLoading] = useState<{ isLoading: boolean; error: string | null }>({ 
    isLoading: false, 
    error: null 
  })
  const [filters, setFilters] = useLocalStorage<FilterState>(
    LOCAL_STORAGE_KEYS.FILTERS,
    initialFilters
  )
  const [sort, setSort] = useLocalStorage<SortState>(
    LOCAL_STORAGE_KEYS.SORT,
    initialSort
  )
  const [pagination, setPagination] = useLocalStorage<PaginationState>(
    LOCAL_STORAGE_KEYS.PAGINATION,
    initialPagination
  )

  const repository = useMemo(() => new CsvQuestionRepository(), [])
  const getQuestionsUseCase = useMemo(() => new GetQuestionsUseCase(repository), [repository])
  const getMetadataUseCase = useMemo(() => new GetMetadataUseCase(repository), [repository])

  const fetchQuestions = useCallback(async () => {
    setLoading({ isLoading: true, error: null })
    try {
      const result = await getQuestionsUseCase.execute(filters, sort, pagination)
      setQuestions(result.questions)
      setPagination(result.pagination)
    } catch (err) {
      setLoading({ isLoading: false, error: err instanceof Error ? err.message : 'An error occurred' })
    } finally {
      setLoading({ isLoading: false, error: null })
    }
  }, [filters, sort, pagination, getQuestionsUseCase, setPagination])

  const fetchMetadata = useCallback(async () => {
    try {
      const result = await getMetadataUseCase.execute()
      setMetadata(result)
    } catch (err) {
      console.error('Error fetching metadata:', err)
    }
  }, [getMetadataUseCase])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  useEffect(() => {
    fetchMetadata()
  }, [fetchMetadata])

  const resetFilters = useCallback(() => {
    setFilters({ companies: [], difficulty: [], timeframes: [], topics: [], searchTerm: '' })
  }, [setFilters])

  const filteredQuestions = useMemo(() => {
    let result = [...questions]

    // Apply search filter
    if (filters.searchTerm) {
      result = filterBySearchTerm(
        result,
        filters.searchTerm,
        ['title', 'companies', 'topics']
      )
    }

    // Apply company filter
    if (filters.companies.length > 0) {
      result = result.filter(q => 
        q.companies.some((company: string) => filters.companies.includes(company))
      )
    }

    // Apply difficulty filter
    if (filters.difficulty.length > 0) {
      result = result.filter(q => filters.difficulty.includes(q.difficulty))
    }

    // Apply timeframe filter
    if (filters.timeframes.length > 0) {
      result = result.filter(q => filters.timeframes.includes(q.timeframe))
    }

    // Apply topic filter
    if (filters.topics.length > 0) {
      result = result.filter(q => 
        q.topics.some((topic: string) => filters.topics.includes(topic))
      )
    }

    return result
  }, [questions, filters])

  const sortedQuestions = useMemo(() => {
    return sortByProperty(filteredQuestions, sort.field as keyof Question, sort.direction)
  }, [filteredQuestions, sort])

  const paginatedQuestions = useMemo(() => {
    const chunks = chunkArray(sortedQuestions, pagination.pageSize)
    const totalPages = Math.max(1, chunks.length)
    
    // Update pagination state only if total pages or total items have changed
    if (totalPages !== pagination.totalPages || sortedQuestions.length !== pagination.totalItems) {
      setPagination((prev: PaginationState) => ({
        ...prev,
        totalPages,
        totalItems: sortedQuestions.length
      }))
    }

    return chunks[pagination.page - 1] || []
  }, [sortedQuestions, pagination.page, pagination.pageSize, pagination.totalPages, pagination.totalItems, setPagination])

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev: PaginationState) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages))
    }))
  }, [setPagination])

  const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSort({ field, direction })
  }, [setSort])

  const debouncedFilterChange = useMemo(
    () => debounce((newFilters: Partial<FilterState>) => {
      setFilters((prev: FilterState) => ({ ...prev, ...newFilters }))
      setPagination((prev: PaginationState) => ({ ...prev, page: 1 }))
    }, DEBOUNCE_DELAY),
    [setFilters, setPagination]
  )

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    debouncedFilterChange(newFilters)
  }, [debouncedFilterChange])

  const handleSearch = useCallback((term: string) => {
    handleFilterChange({ searchTerm: term })
  }, [handleFilterChange])

  return {
    questions: paginatedQuestions,
    metadata,
    loading,
    filters,
    sort,
    pagination,
    setFilters,
    setSort,
    setPage: (page: number) => setPagination(prev => ({ ...prev, page })),
    resetFilters,
    error: loading.error,
    totalPages: pagination.totalPages,
    currentPage: pagination.page,
    totalItems: pagination.totalItems,
    fetchQuestions
  }
} 