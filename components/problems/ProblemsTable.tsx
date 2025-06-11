'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { ProblemsTableProps } from '@/types/props'
import { SortField } from '@/types/analytics'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function ProblemsTable({ questions, sort, onSort, loading }: ProblemsTableProps) {
  // Helper to render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sort.field !== field) return null
    return sort.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  // Helper to format cell content
  const formatCell = (value: string | number | undefined) => {
    if (typeof value === 'number') {
      return value.toFixed(1)
    }
    return value || '-'
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <LoadingSpinner size="md" message="Loading problems..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th 
                  className="p-4 text-left cursor-pointer hover:bg-muted/50"
                  onClick={() => onSort('title')}
                >
                  <div className="flex items-center gap-2">
                    Title
                    {renderSortIndicator('title')}
                  </div>
                </th>
                <th 
                  className="p-4 text-left cursor-pointer hover:bg-muted/50"
                  onClick={() => onSort('difficulty')}
                >
                  <div className="flex items-center gap-2">
                    Difficulty
                    {renderSortIndicator('difficulty')}
                  </div>
                </th>
                <th 
                  className="p-4 text-left cursor-pointer hover:bg-muted/50"
                  onClick={() => onSort('frequency')}
                >
                  <div className="flex items-center gap-2">
                    Frequency
                    {renderSortIndicator('frequency')}
                  </div>
                </th>
                <th 
                  className="p-4 text-left cursor-pointer hover:bg-muted/50"
                  onClick={() => onSort('acceptance_rate')}
                >
                  <div className="flex items-center gap-2">
                    Acceptance
                    {renderSortIndicator('acceptance_rate')}
                  </div>
                </th>
                <th className="p-4 text-left">Companies</th>
                <th className="p-4 text-left">Topics</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question, index) => (
                <tr key={question.title} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                  <td className="p-4">{question.title}</td>
                  <td className="p-4">
                    <Badge variant={
                      question.difficulty === 'Easy' ? 'secondary' :
                      question.difficulty === 'Medium' ? 'default' : 'destructive'
                    }>
                      {question.difficulty}
                    </Badge>
                  </td>
                  <td className="p-4">{formatCell(question.frequency)}%</td>
                  <td className="p-4">{formatCell(question.acceptance_rate)}%</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {question.companies.map(company => (
                        <Badge key={company} variant="outline">{company}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {question.topics.map(topic => (
                        <Badge key={topic} variant="secondary">{topic}</Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 