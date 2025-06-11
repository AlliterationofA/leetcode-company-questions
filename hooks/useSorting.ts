'use client'

import { useState, useCallback } from 'react'
import { SortState, SortField, ProcessedQuestion } from '@/types/analytics'

interface UseSortingReturn {
  sort: SortState
  handleSort: (field: SortField) => void
  getSortedQuestions: (questions: ProcessedQuestion[]) => ProcessedQuestion[]
}

export function useSorting(): UseSortingReturn {
  const [sort, setSort] = useState<SortState>({
    field: "title",
    direction: "asc"
  })

  const handleSort = useCallback((field: SortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }))
  }, [])

  const getSortedQuestions = useCallback((questions: ProcessedQuestion[]) => {
    return [...questions].sort((a, b) => {
      let comparison = 0

      switch (sort.field) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "difficulty": {
          const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3 }
          const aValue = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0
          const bValue = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0
          comparison = aValue - bValue
          break
        }
        case "frequency":
          comparison = (a.frequency || 0) - (b.frequency || 0)
          break
        case "acceptance_rate":
          comparison = (a.acceptance_rate || 0) - (b.acceptance_rate || 0)
          break
        case "timeframe": {
          const timeframeOrder = { "6 months": 1, "1 year": 2, "2 years": 3 }
          const aValue = timeframeOrder[a.timeframes[0] as keyof typeof timeframeOrder] || 0
          const bValue = timeframeOrder[b.timeframes[0] as keyof typeof timeframeOrder] || 0
          comparison = aValue - bValue
          break
        }
        case "occurrences":
          comparison = (a.originalRows?.length || 0) - (b.originalRows?.length || 0)
          break
      }

      return sort.direction === "asc" ? comparison : -comparison
    })
  }, [sort])

  return {
    sort,
    handleSort,
    getSortedQuestions
  }
} 