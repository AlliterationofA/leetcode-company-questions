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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Question } from "@/lib/csv-processor"
import { cn } from "@/lib/utils"

type SortField = "title" | "difficulty" | "frequency" | "acceptance_rate" | "timeframe" | "occurrences"
type SortDirection = "asc" | "desc"

interface ProblemsTableProps {
  questions: Question[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  maxDisplayCount?: number
}

export function ProblemsTable({
  questions,
  sortField,
  sortDirection,
  onSort,
  maxDisplayCount = 100,
}: ProblemsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [expandedTimeframes, setExpandedTimeframes] = useState<Set<string>>(new Set())

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

  const displayedQuestions = questions.slice(0, maxDisplayCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Problems ({questions.length.toLocaleString()})</CardTitle>
        <CardDescription>
          Filtered results based on original CSV data. Click problem titles to open on LeetCode.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <ScrollArea className="h-[600px]">
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
                      Occurrences {getSortIcon("occurrences")}
                    </Button>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => onSort("frequency")}
                  >
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 mr-1" />
                      Frequency {getSortIcon("frequency")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => onSort("acceptance_rate")}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Acceptance {getSortIcon("acceptance_rate")}
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
          </ScrollArea>
        </div>
        {questions.length > maxDisplayCount && (
          <div className="text-center py-4 text-muted-foreground">
            Showing first {maxDisplayCount.toLocaleString()} results. Use filters to narrow down the list.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
