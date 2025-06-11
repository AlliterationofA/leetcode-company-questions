'use client'

import { useState, useCallback, useMemo } from 'react'
import { FilterState, ProcessedQuestion, Stats, FilterMode } from '@/types/analytics'

interface UseFiltersReturn {
  filters: FilterState
  updateFilter: (newFilters: Partial<FilterState>) => void
  getFilteredQuestions: (questions: ProcessedQuestion[]) => ProcessedQuestion[]
  stats: {
    occurrences: Stats
    frequency: Stats
    acceptance: Stats
  }
}

const defaultStats: Stats = { min: 0, max: 100 }

export function useFilters(initialQuestions: ProcessedQuestion[] = []): UseFiltersReturn {
  // Initialize filter state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    selectedCompanies: [],
    selectedDifficulties: [],
    selectedTimeframes: [],
    selectedTopics: [],
    showMultiCompany: false,
    companyFilterMode: "or",
    topicFilterMode: "or",
    occurrencesRange: { min: "", max: "" },
    frequencyRange: { min: "", max: "" },
    acceptanceRange: { min: "", max: "" }
  })

  // Calculate stats from initial questions
  const stats = useMemo(() => {
    if (!initialQuestions.length) {
      return {
        occurrences: defaultStats,
        frequency: defaultStats,
        acceptance: defaultStats
      }
    }

    return {
      occurrences: {
        min: Math.min(...initialQuestions.map(q => q.originalRows?.length || 0)),
        max: Math.max(...initialQuestions.map(q => q.originalRows?.length || 0))
      },
      frequency: {
        min: Math.min(...initialQuestions.map(q => q.frequency || 0)),
        max: Math.max(...initialQuestions.map(q => q.frequency || 0))
      },
      acceptance: {
        min: Math.min(...initialQuestions.map(q => q.acceptance_rate || 0)),
        max: Math.max(...initialQuestions.map(q => q.acceptance_rate || 0))
      }
    }
  }, [initialQuestions])

  // Update filter handler
  const updateFilter = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Filter questions based on current filters
  const getFilteredQuestions = useCallback((questions: ProcessedQuestion[]) => {
    return questions.filter(question => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesSearch = 
          question.title.toLowerCase().includes(searchLower) ||
          question.topics.some(topic => topic.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Company filter
      if (filters.selectedCompanies.length > 0) {
        if (filters.companyFilterMode === "and") {
          if (!filters.selectedCompanies.every(company => 
            question.companies.includes(company))) {
            return false
          }
        } else {
          if (!filters.selectedCompanies.some(company => 
            question.companies.includes(company))) {
            return false
          }
        }
      }

      // Difficulty filter
      if (filters.selectedDifficulties.length > 0 &&
          !filters.selectedDifficulties.includes(question.difficulty)) {
        return false
      }

      // Timeframe filter
      if (filters.selectedTimeframes.length > 0 &&
          !question.timeframes.some(t => filters.selectedTimeframes.includes(t))) {
        return false
      }

      // Topic filter
      if (filters.selectedTopics.length > 0) {
        if (filters.topicFilterMode === "and") {
          if (!filters.selectedTopics.every(topic => 
            question.topics.includes(topic))) {
            return false
          }
        } else {
          if (!filters.selectedTopics.some(topic => 
            question.topics.includes(topic))) {
            return false
          }
        }
      }

      // Range filters
      const occurrences = question.originalRows?.length || 0
      if (filters.occurrencesRange.min !== "" && 
          occurrences < Number(filters.occurrencesRange.min)) return false
      if (filters.occurrencesRange.max !== "" && 
          occurrences > Number(filters.occurrencesRange.max)) return false

      if (filters.frequencyRange.min !== "" && 
          (question.frequency || 0) < Number(filters.frequencyRange.min)) return false
      if (filters.frequencyRange.max !== "" && 
          (question.frequency || 0) > Number(filters.frequencyRange.max)) return false

      if (filters.acceptanceRange.min !== "" && 
          (question.acceptance_rate || 0) < Number(filters.acceptanceRange.min)) return false
      if (filters.acceptanceRange.max !== "" && 
          (question.acceptance_rate || 0) > Number(filters.acceptanceRange.max)) return false

      return true
    })
  }, [filters])

  return {
    filters,
    updateFilter,
    getFilteredQuestions,
    stats
  }
} 