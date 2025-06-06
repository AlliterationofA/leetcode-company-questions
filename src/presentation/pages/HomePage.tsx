"use client";

import { useState, useEffect } from 'react'
import { ProblemsTable } from '@/components/analytics/ProblemsTable'
import { FiltersPanel } from '@/components/analytics/FiltersPanel'
import { useQuestions } from '../hooks/useQuestions'
import { QuestionFilters, QuestionSort } from '../../domain/entities/Question'
import { GetMetadataUseCase } from '../../application/use-cases/GetQuestionsUseCase'
import { CsvQuestionRepository } from '../../infrastructure/repositories/CsvQuestionRepository'
import { cn } from '@/lib/utils'

export function HomePage() {
  const [filters, setFilters] = useState<QuestionFilters>({})
  const [sort, setSort] = useState<QuestionSort>({
    field: 'frequency',
    direction: 'desc'
  })
  const [metadata, setMetadata] = useState<{
    companies: string[];
    topics: string[];
    timeframes: string[];
  }>({
    companies: [],
    topics: [],
    timeframes: []
  })

  const {
    questions,
    loading,
    error,
    totalPages,
    currentPage,
    totalItems,
    fetchQuestions
  } = useQuestions()

  useEffect(() => {
    fetchQuestions(filters, sort, currentPage)
  }, [filters, sort])

  useEffect(() => {
    const fetchMetadata = async () => {
      const repository = new CsvQuestionRepository()
      const useCase = new GetMetadataUseCase(repository)
      const result = await useCase.execute()
      setMetadata(result)
    }
    fetchMetadata()
  }, [])

  const handleSort = (field: QuestionSort['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handlePageChange = (page: number) => {
    fetchQuestions(filters, sort, page)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">LeetCode Company Questions</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FiltersPanel
            availableCompanies={metadata.companies}
            availableDifficulties={['Easy', 'Medium', 'Hard']}
            availableTimeframes={metadata.timeframes}
            availableTopics={metadata.topics}
            onFiltersChange={setFilters}
            currentFilters={filters}
          />
        </div>
        
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ProblemsTable
              questions={questions}
              sortField={sort.field}
              sortDirection={sort.direction}
              onSort={handleSort}
              onPageChange={handlePageChange}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={25}
            />
          )}
        </div>
      </div>
    </div>
  )
} 