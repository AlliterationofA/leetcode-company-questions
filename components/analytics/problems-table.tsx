"use client"

import { useState } from "react"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  FileText,
  Gauge,
  Building2,
  Clock,
  Hash,
  BarChart,
  CheckCircle,
  Tag,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Question } from "@/lib/csv-processor"
import { cn } from "@/lib/utils"

type SortField = "title" | "difficulty" | "frequency" | "acceptance_rate" | "timeframe" | "occurrences"
type SortDirection = "asc" | "desc"

interface ProblemsTableProps {
  questions: Question[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

export function ProblemsTable({
  questions,
  sortField,
  sortDirection,
  onSort,
}: ProblemsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [expandedTimeframes, setExpandedTimeframes] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const rowsPerPage = 25
  const totalPages = Math.ceil(questions.length / rowsPerPage)
  const paginatedQuestions = questions.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const toggleCompanies = (id: string) => {
    const newExpanded = new Set(expandedCompanies)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCompanies(newExpanded)
  }

  const toggleTopics = (id: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedTopics(newExpanded)
  }

  const toggleTimeframes = (id: string) => {
    const newExpanded = new Set(expandedTimeframes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedTimeframes(newExpanded)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case "EASY":
        return "text-green-600 bg-green-50 border-green-200"
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "HARD":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const displayedQuestions = paginatedQuestions

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("title")}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 mr-1" />
                  Title {getSortIcon("title")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("difficulty")}
              >
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 mr-1" />
                  Difficulty {getSortIcon("difficulty")}
                </div>
              </TableHead>
              <TableHead>Companies</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("timeframe")}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 mr-1" />
                  Timeframes
                </div>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort("occurrences")}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  <Hash className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Occurrences</span>
                  <span className="sm:hidden">Occ</span>
                  {getSortIcon("occurrences")}
                </Button>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("frequency")}
              >
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Frequency</span>
                  <span className="sm:hidden">Freq</span>
                  {getSortIcon("frequency")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("acceptance_rate")}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Acceptance</span>
                  <span className="sm:hidden">Acc%</span>
                  {getSortIcon("acceptance_rate")}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Topics
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedQuestions.map((question, index) => (
              <TableRow key={`${question.title}-${index}`} className="hover:bg-muted/50">
                <TableCell className="max-w-xs">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{question.title}</span>
                    <a
                      href={question.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      title="Open in LeetCode"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href={`${question.link}/editorial/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      title="Editorial"
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                    <a
                      href={`${question.link}/solutions/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      title="Solutions"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </a>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 items-center">
                    {(() => {
                      const isExpanded = expandedCompanies.has(`${question.title}-${index}`)
                      const companies = question.companies
                      if (isExpanded) {
                        return <>
                          {companies.map((company, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{company}</Badge>
                          ))}
                          <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => toggleCompanies(`${question.title}-${index}`)}>-</Badge>
                        </>
                      } else {
                        return <>
                          {companies.slice(0, 3).map((company, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{company}</Badge>
                          ))}
                          {companies.length > 3 && (
                            <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => toggleCompanies(`${question.title}-${index}`)}>
                              +{companies.length - 3}
                            </Badge>
                          )}
                        </>
                      }
                    })()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 items-center">
                    {(() => {
                      const isExpanded = expandedTimeframes.has(`${question.title}-${index}`)
                      const timeframes = question.timeframes
                      if (isExpanded) {
                        return <>
                          {timeframes.map((timeframe, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{timeframe}</Badge>
                          ))}
                          <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => toggleTimeframes(`${question.title}-${index}`)}>-</Badge>
                        </>
                      } else {
                        return <>
                          {timeframes.slice(0, 2).map((timeframe, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{timeframe}</Badge>
                          ))}
                          {timeframes.length > 2 && (
                            <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => toggleTimeframes(`${question.title}-${index}`)}>
                              +{timeframes.length - 2}
                            </Badge>
                          )}
                        </>
                      }
                    })()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">
                      {question.originalRows?.length || 0}
                    </Badge>
                    <span className="text-xs text-muted-foreground">times</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(question.frequency, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{question.frequency}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(question.acceptance_rate, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{question.acceptance_rate.toFixed(2)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 items-center">
                    {(() => {
                      const isExpanded = expandedTopics.has(`${question.title}-${index}`)
                      const topicsArr = question.topics.split(/[,;|]/).map(t => t.trim()).filter(Boolean)
                      if (isExpanded) {
                        return <>
                          {topicsArr.map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{topic}</Badge>
                          ))}
                          <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => toggleTopics(`${question.title}-${index}`)}>-</Badge>
                        </>
                      } else {
                        return <>
                          {topicsArr.slice(0, 3).map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{topic}</Badge>
                          ))}
                          {topicsArr.length > 3 && (
                            <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => toggleTopics(`${question.title}-${index}`)}>
                              +{topicsArr.length - 3}
                            </Badge>
                          )}
                        </>
                      }
                    })()}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {questions.length > 0 && (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 py-4 px-2 border-t bg-muted/30 rounded-b-md">
          <div className="text-sm text-muted-foreground font-medium">
            Showing <span className="font-semibold text-primary">{((page - 1) * rowsPerPage + 1).toLocaleString()}</span>
            –<span className="font-semibold text-primary">{Math.min(page * rowsPerPage, questions.length).toLocaleString()}</span>
            &nbsp;of <span className="font-semibold text-primary">{questions.length.toLocaleString()}</span> results
          </div>
          <div className="flex gap-1 items-center flex-wrap">
            <Button size="icon" variant="ghost" onClick={() => setPage(1)} disabled={page === 1} className="rounded-full"><ChevronsLeft className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setPage(page - 1)} disabled={page === 1} className="rounded-full"><ChevronLeft className="w-4 h-4" /></Button>
            {Array.from({ length: totalPages }).map((_, i) =>
              (i + 1 === page || (i + 1 <= 2 || i + 1 > totalPages - 2 || Math.abs(i + 1 - page) <= 1)) ? (
                <Button
                  key={i}
                  size="sm"
                  variant={i + 1 === page ? "default" : "outline"}
                  className={`rounded-full px-3 ${i + 1 === page ? "font-bold" : ""}`}
                  onClick={() => setPage(i + 1)}
                  disabled={i + 1 === page}
                >
                  {i + 1}
                </Button>
              ) : (i === 1 && page > 4) || (i === totalPages - 2 && page < totalPages - 3) ? (
                <span key={i} className="px-2 text-muted-foreground">…</span>
              ) : null
            )}
            <Button size="icon" variant="ghost" onClick={() => setPage(page + 1)} disabled={page === totalPages} className="rounded-full"><ChevronRight className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setPage(totalPages)} disabled={page === totalPages} className="rounded-full"><ChevronsRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
