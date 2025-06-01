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
import { useState, useMemo } from "react"

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
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search companies..."
                      value={companySearch}
                      onValueChange={setCompanySearch}
                    />
                    <CommandEmpty>No companies found.</CommandEmpty>
                    <CommandGroup>
                      <div className="flex flex-wrap gap-2 p-2">
                        {availableCompanies
                          .sort((a, b) => a.localeCompare(b))
                          .map((company) => (
                          <CommandItem
                            key={company}
                            value={company}
                            onSelect={() => {
                              const newSelection = selectedCompanies.includes(company)
                                ? selectedCompanies.filter(c => c !== company)
                                : [...selectedCompanies, company]
                              onCompaniesChange(newSelection)
                            }}
                            className="p-0"
                          >
                            <Button
                              variant={selectedCompanies.includes(company) ? "default" : "outline"}
                              size="sm"
                              className="h-7"
                            >
                              {company}
                              {selectedCompanies.includes(company) && (
                                <X className="h-3 w-3 ml-1" />
                              )}
                            </Button>
                          </CommandItem>
                        ))}
                      </div>
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
                  <Button
                    key={company}
                    variant="secondary"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => removeCompany(company)}
                  >
                    {company}
                    <X className="h-3 w-3 ml-1" />
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulties Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      {selectedDifficulties.length > 0
                        ? selectedDifficulties.length === 1
                          ? selectedDifficulties[0]
                          : `${selectedDifficulties.length} selected`
                        : "Select difficulty"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandGroup>
                      <div className="flex flex-wrap gap-2 p-2">
                        {availableDifficulties.map((difficulty) => {
                          const isSelected = selectedDifficulties.includes(difficulty)
                          const diff = difficulty.toUpperCase()
                          const colorClass =
                            diff === "EASY"
                              ? isSelected
                                ? "bg-green-600 text-white border-green-700"
                                : "border border-green-200 text-green-600 bg-white hover:bg-green-50"
                              : diff === "MEDIUM"
                              ? isSelected
                                ? "bg-yellow-500 text-white border-yellow-600"
                                : "border border-yellow-200 text-yellow-600 bg-white hover:bg-yellow-50"
                              : diff === "HARD"
                              ? isSelected
                                ? "bg-red-600 text-white border-red-700"
                                : "border border-red-200 text-red-600 bg-white hover:bg-red-50"
                              : ""
                          return (
                            <Button
                              key={difficulty}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-8 px-4 font-bold rounded-full transition-colors text-xs border",
                                colorClass
                              )}
                              style={{ boxShadow: "none" }}
                              onClick={() => {
                                if (isSelected) {
                                  onDifficultiesChange(selectedDifficulties.filter(d => d !== difficulty))
                                } else {
                                  onDifficultiesChange([...selectedDifficulties, difficulty])
                                }
                              }}
                            >
                              {difficulty}
                              {isSelected && (
                                <span className="ml-2 flex items-center">
                                  <X className="h-3 w-3" />
                                </span>
                              )}
                            </Button>
                          )
                        })}
                      </div>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Timeframes Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {selectedTimeframes.length > 0
                        ? `${selectedTimeframes.length} selected`
                        : "Select timeframe"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandGroup className="max-h-[300px] overflow-auto p-2">
                      <div className="flex flex-wrap gap-2">
                        {availableTimeframes.map((timeframe) => (
                          <Button
                            key={timeframe}
                            variant={selectedTimeframes.includes(timeframe) ? "default" : "outline"}
                            size="sm"
                            className="h-7"
                            onClick={() => {
                              const newSelection = selectedTimeframes.includes(timeframe)
                                ? selectedTimeframes.filter(t => t !== timeframe)
                                : [...selectedTimeframes, timeframe]
                              onTimeframesChange(newSelection)
                            }}
                          >
                            {timeframe}
                            {selectedTimeframes.includes(timeframe) && (
                              <X className="h-3 w-3 ml-1" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {selectedTimeframes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTimeframes.map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant="secondary"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => removeTimeframe(timeframe)}
                  >
                    {timeframe}
                    <X className="h-3 w-3 ml-1" />
                  </Button>
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
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search topics..."
                      value={topicSearch}
                      onValueChange={setTopicSearch}
                    />
                    <CommandEmpty>No topics found.</CommandEmpty>
                    <CommandGroup>
                      <div className="flex flex-wrap gap-2 p-2">
                        {availableTopics
                          .sort((a, b) => a.localeCompare(b))
                          .map((topic) => (
                          <CommandItem
                            key={topic}
                            value={topic}
                            onSelect={() => {
                              const newSelection = selectedTopics.includes(topic)
                                ? selectedTopics.filter(t => t !== topic)
                                : [...selectedTopics, topic]
                              onTopicsChange(newSelection)
                            }}
                            className="p-0"
                          >
                            <Button
                              variant={selectedTopics.includes(topic) ? "default" : "outline"}
                              size="sm"
                              className="h-7"
                            >
                              {topic}
                              {selectedTopics.includes(topic) && (
                                <X className="h-3 w-3 ml-1" />
                              )}
                            </Button>
                          </CommandItem>
                        ))}
                      </div>
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
                  <Button
                    key={topic}
                    variant="secondary"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => removeTopic(topic)}
                  >
                    {topic}
                    <X className="h-3 w-3 ml-1" />
                  </Button>
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
