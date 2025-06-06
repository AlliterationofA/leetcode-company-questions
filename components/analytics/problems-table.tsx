"use client"

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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Question } from "@/lib/csv-processor"

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onSort("title")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Title {getSortIcon("title")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onSort("difficulty")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    <Gauge className="h-4 w-4 mr-1" />
                    Difficulty {getSortIcon("difficulty")}
                  </Button>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    Companies
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
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
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onSort("frequency")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    <BarChart className="h-4 w-4 mr-1" />
                    Frequency {getSortIcon("frequency")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onSort("acceptance_rate")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Acceptance {getSortIcon("acceptance_rate")}
                  </Button>
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
                    <a
                      href={question.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      <span className="truncate">{question.title}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {question.companies.slice(0, 3).map((company, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {company}
                        </Badge>
                      ))}
                      {question.companies.length > 3 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs cursor-help">
                                +{question.companies.length - 3}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{question.companies.slice(3).join(", ")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {question.timeframes.slice(0, 2).map((timeframe, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {timeframe}
                        </Badge>
                      ))}
                      {question.timeframes.length > 2 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="text-xs cursor-help">
                                +{question.timeframes.length - 2}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{question.timeframes.slice(2).join(", ")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
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
                    <div className="flex flex-wrap gap-1">
                      {question.topics
                        .split(/[,;|]/)
                        .slice(0, 3)
                        .map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {topic.trim()}
                          </Badge>
                        ))}
                      {question.topics.split(/[,;|]/).length > 3 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs cursor-help">
                                +{question.topics.split(/[,;|]/).length - 3}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {question.topics
                                  .split(/[,;|]/)
                                  .slice(3)
                                  .map((t) => t.trim())
                                  .join(", ")}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
