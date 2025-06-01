"use client"

import { Filter, Building2, Gauge, Clock, Tag, Search, X, Layers, GitBranch, Check, ChevronsUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface FiltersPanelProps {
  selectedCompanies: string[]
  selectedDifficulties: string[]
  selectedTimeframes: string[]
  selectedTopics: string[]
  showMultiCompany: boolean
  availableCompanies: string[]
  availableDifficulties: string[]
  availableTimeframes: string[]
  availableTopics: string[]
  onCompaniesChange: (values: string[]) => void
  onDifficultiesChange: (values: string[]) => void
  onTimeframesChange: (values: string[]) => void
  onTopicsChange: (values: string[]) => void
  onMultiCompanyToggle: () => void
  filteredCount: number
  totalCount: number
  companyFilterMode: "and" | "or"
  onCompanyFilterModeChange: (mode: "and" | "or") => void
  topicFilterMode: "and" | "or"
  onTopicFilterModeChange: (mode: "and" | "or") => void
}

export function FiltersPanel({
  selectedCompanies,
  selectedDifficulties,
  selectedTimeframes,
  selectedTopics,
  showMultiCompany,
  availableCompanies,
  availableDifficulties,
  availableTimeframes,
  availableTopics,
  onCompaniesChange,
  onDifficultiesChange,
  onTimeframesChange,
  onTopicsChange,
  onMultiCompanyToggle,
  filteredCount,
  totalCount,
  companyFilterMode,
  onCompanyFilterModeChange,
  topicFilterMode,
  onTopicFilterModeChange,
}: FiltersPanelProps) {
  const [openCompany, setOpenCompany] = useState(false)
  const [openTopic, setOpenTopic] = useState(false)
  const [companySearch, setCompanySearch] = useState("")
  const [topicSearch, setTopicSearch] = useState("")

  const activeFiltersCount = [
    selectedCompanies.length > 0,
    selectedDifficulties.length > 0,
    selectedTimeframes.length > 0,
    selectedTopics.length > 0,
    showMultiCompany,
  ].filter(Boolean).length

  const filteredCompanies = availableCompanies
    .filter(company => company.toLowerCase().includes(companySearch.toLowerCase()))
    .sort((a, b) => a.localeCompare(b))

  const filteredTopics = availableTopics
    .filter(topic => topic.toLowerCase().includes(topicSearch.toLowerCase()))
    .sort((a, b) => a.localeCompare(b))

  const removeCompany = (company: string) => {
    onCompaniesChange(selectedCompanies.filter(c => c !== company))
  }

  const removeDifficulty = (difficulty: string) => {
    onDifficultiesChange(selectedDifficulties.filter(d => d !== difficulty))
  }

  const removeTimeframe = (timeframe: string) => {
    onTimeframesChange(selectedTimeframes.filter(t => t !== timeframe))
  }

  const removeTopic = (topic: string) => {
    onTopicsChange(selectedTopics.filter(t => t !== topic))
  }

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
          {/* Companies Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Popover open={openCompany} onOpenChange={setOpenCompany}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCompany}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {selectedCompanies.length > 0
                        ? `${selectedCompanies.length} selected`
                        : "Select companies"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search companies..."
                      value={companySearch}
                      onValueChange={setCompanySearch}
                    />
                    <CommandEmpty>No companies found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCompanies.map((company) => (
                        <CommandItem
                          key={company}
                          onSelect={() => {
                            const newSelection = selectedCompanies.includes(company)
                              ? selectedCompanies.filter(c => c !== company)
                              : [...selectedCompanies, company]
                            onCompaniesChange(newSelection)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCompanies.includes(company) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {company}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCompanies.length > 1 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onCompanyFilterModeChange(companyFilterMode === "and" ? "or" : "and")}
                        className={cn(
                          "h-10 w-10",
                          companyFilterMode === "and" ? "bg-primary text-primary-foreground" : ""
                        )}
                      >
                        {companyFilterMode === "and" ? (
                          <Layers className="h-4 w-4" />
                        ) : (
                          <GitBranch className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {companyFilterMode === "and"
                          ? "Show problems that appear in ALL selected companies"
                          : "Show problems that appear in ANY selected company"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {selectedCompanies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCompanies.map((company) => (
                  <Badge
                    key={company}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {company}
                    <button
                      onClick={() => removeCompany(company)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Difficulties Filter */}
          <div className="space-y-2">
            <Select
              value={selectedDifficulties.length > 0 ? selectedDifficulties[0] : "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  onDifficultiesChange([])
                } else {
                  onDifficultiesChange([value])
                }
              }}
            >
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
            {selectedDifficulties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDifficulties.map((difficulty) => (
                  <Badge
                    key={difficulty}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {difficulty}
                    <button
                      onClick={() => removeDifficulty(difficulty)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Timeframes Filter */}
          <div className="space-y-2">
            <Select
              value={selectedTimeframes.length > 0 ? selectedTimeframes[0] : "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  onTimeframesChange([])
                } else {
                  onTimeframesChange([value])
                }
              }}
            >
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
            {selectedTimeframes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTimeframes.map((timeframe) => (
                  <Badge
                    key={timeframe}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {timeframe}
                    <button
                      onClick={() => removeTimeframe(timeframe)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Topics Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Popover open={openTopic} onOpenChange={setOpenTopic}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openTopic}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {selectedTopics.length > 0
                        ? `${selectedTopics.length} selected`
                        : "Select topics"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search topics..."
                      value={topicSearch}
                      onValueChange={setTopicSearch}
                    />
                    <CommandEmpty>No topics found.</CommandEmpty>
                    <CommandGroup>
                      {filteredTopics.map((topic) => (
                        <CommandItem
                          key={topic}
                          onSelect={() => {
                            const newSelection = selectedTopics.includes(topic)
                              ? selectedTopics.filter(t => t !== topic)
                              : [...selectedTopics, topic]
                            onTopicsChange(newSelection)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTopics.includes(topic) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {topic}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedTopics.length > 1 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onTopicFilterModeChange(topicFilterMode === "and" ? "or" : "and")}
                        className={cn(
                          "h-10 w-10",
                          topicFilterMode === "and" ? "bg-primary text-primary-foreground" : ""
                        )}
                      >
                        {topicFilterMode === "and" ? (
                          <Layers className="h-4 w-4" />
                        ) : (
                          <GitBranch className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {topicFilterMode === "and"
                          ? "Show problems that have ALL selected topics"
                          : "Show problems that have ANY selected topic"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {selectedTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTopics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {topic}
                    <button
                      onClick={() => removeTopic(topic)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
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
