"use client"

import { Filter, Building2, Gauge, Clock, Tag } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FiltersPanelProps {
  selectedCompany: string
  selectedDifficulty: string
  selectedTimeframe: string
  selectedTopic: string
  showMultiCompany: boolean
  availableCompanies: string[]
  availableDifficulties: string[]
  availableTimeframes: string[]
  availableTopics: string[]
  onCompanyChange: (value: string) => void
  onDifficultyChange: (value: string) => void
  onTimeframeChange: (value: string) => void
  onTopicChange: (value: string) => void
  onMultiCompanyToggle: () => void
  filteredCount: number
  totalCount: number
}

export function FiltersPanel({
  selectedCompany,
  selectedDifficulty,
  selectedTimeframe,
  selectedTopic,
  showMultiCompany,
  availableCompanies,
  availableDifficulties,
  availableTimeframes,
  availableTopics,
  onCompanyChange,
  onDifficultyChange,
  onTimeframeChange,
  onTopicChange,
  onMultiCompanyToggle,
  filteredCount,
  totalCount,
}: FiltersPanelProps) {
  const activeFiltersCount = [
    selectedCompany !== "all",
    selectedDifficulty !== "all",
    selectedTimeframe !== "all",
    selectedTopic !== "all",
    showMultiCompany,
  ].filter(Boolean).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} problems
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={selectedCompany} onValueChange={onCompanyChange}>
            <SelectTrigger className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {availableCompanies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {availableDifficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTimeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timeframes</SelectItem>
              {availableTimeframes.map((timeframe) => (
                <SelectItem key={timeframe} value={timeframe}>
                  {timeframe}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTopic} onValueChange={onTopicChange}>
            <SelectTrigger className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {availableTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={showMultiCompany ? "default" : "outline"} size="sm" onClick={onMultiCompanyToggle}>
                  <Filter className="h-4 w-4 mr-2" />
                  Cross-Company Only
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show only problems that appear in multiple companies</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}
