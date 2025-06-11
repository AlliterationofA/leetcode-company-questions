'use client'

import { Filter, Building2, Gauge, Clock, Tag, Search, X, Layers, GitBranch, Ampersand, Slash, Check, ChevronsUpDown, Hash, BarChart, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"
import { FiltersPanelProps } from "@/types/props"

export function FiltersPanel({
  filters,
  stats,
  onFilterChange,
  companies,
  difficulties,
  timeframes,
  topics
}: FiltersPanelProps) {
  const [openCompany, setOpenCompany] = useState(false)
  const [openTopic, setOpenTopic] = useState(false)
  const [companySearch, setCompanySearch] = useState("")
  const [topicSearch, setTopicSearch] = useState("")

  const activeFiltersCount = [
    filters.selectedCompanies.length > 0,
    filters.selectedDifficulties.length > 0,
    filters.selectedTimeframes.length > 0,
    filters.selectedTopics.length > 0,
    filters.showMultiCompany,
  ].filter(Boolean).length

  const removeCompany = (company: string) => {
    onFilterChange({
      selectedCompanies: filters.selectedCompanies.filter(c => c !== company)
    })
  }

  const removeDifficulty = (difficulty: string) => {
    onFilterChange({
      selectedDifficulties: filters.selectedDifficulties.filter(d => d !== difficulty)
    })
  }

  const removeTimeframe = (timeframe: string) => {
    onFilterChange({
      selectedTimeframes: filters.selectedTimeframes.filter(t => t !== timeframe)
    })
  }

  const removeTopic = (topic: string) => {
    onFilterChange({
      selectedTopics: filters.selectedTopics.filter(t => t !== topic)
    })
  }

  const companyFilterRef = useRef<HTMLDivElement>(null)
  const difficultiesFilterRef = useRef<HTMLDivElement>(null)
  const timeframesFilterRef = useRef<HTMLDivElement>(null)
  const topicsFilterRef = useRef<HTMLDivElement>(null)

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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={filters.searchTerm}
              onChange={e => onFilterChange({ searchTerm: e.target.value })}
              className="pl-8"
            />
          </div>
        </div>

        {/* Main Filters Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Companies Filter */}
          <div className="space-y-2" ref={companyFilterRef}>
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
                      {filters.selectedCompanies.length > 0
                        ? `${filters.selectedCompanies.length} selected`
                        : "Select companies"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" side="bottom" sideOffset={4} sticky="always" collisionBoundary={companyFilterRef.current} avoidCollisions={false}>
                  <Command>
                    <CommandInput
                      placeholder="Search companies..."
                      value={companySearch}
                      onValueChange={setCompanySearch}
                    />
                    <CommandEmpty>No companies found.</CommandEmpty>
                    <CommandGroup>
                      <div className="flex flex-wrap gap-2 p-2">
                        {companies
                          .sort((a, b) => a.localeCompare(b))
                          .map((company) => (
                            <CommandItem
                              key={company}
                              value={company}
                              onSelect={() => {
                                const newSelection = filters.selectedCompanies.includes(company)
                                  ? filters.selectedCompanies.filter(c => c !== company)
                                  : [...filters.selectedCompanies, company]
                                onFilterChange({ selectedCompanies: newSelection })
                              }}
                              className="p-0"
                            >
                              <Button
                                variant={filters.selectedCompanies.includes(company) ? "default" : "outline"}
                                size="sm"
                                className="h-7"
                              >
                                {company}
                                {filters.selectedCompanies.includes(company) && (
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
              {filters.selectedCompanies.length > 1 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onFilterChange({
                          companyFilterMode: filters.companyFilterMode === "and" ? "or" : "and"
                        })}
                        className={cn(
                          "h-10 w-10",
                          filters.companyFilterMode === "and" ? "bg-primary text-primary-foreground" : ""
                        )}
                      >
                        {filters.companyFilterMode === "and" ? (
                          <Ampersand className="h-4 w-4" />
                        ) : (
                          <Slash className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {filters.companyFilterMode === "and"
                          ? "Show problems that appear in ALL selected companies"
                          : "Show problems that appear in ANY selected company"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {filters.selectedCompanies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.selectedCompanies.map((company) => (
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
          <div className="space-y-2" ref={difficultiesFilterRef}>
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
                      {filters.selectedDifficulties.length > 0
                        ? filters.selectedDifficulties.length === 1
                          ? filters.selectedDifficulties[0]
                          : `${filters.selectedDifficulties.length} selected`
                        : "Select difficulty"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" side="bottom" sideOffset={4} sticky="always" collisionBoundary={difficultiesFilterRef.current} avoidCollisions={false}>
                  <Command>
                    <CommandGroup>
                      <div className="flex flex-wrap gap-2 p-2">
                        {difficulties
                          .sort((a, b) => {
                            const order = { easy: 1, medium: 2, hard: 3 };
                            return order[a.toLowerCase() as keyof typeof order] - order[b.toLowerCase() as keyof typeof order];
                          })
                          .map((difficulty) => {
                            const isSelected = filters.selectedDifficulties.includes(difficulty)
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
                                    onFilterChange({
                                      selectedDifficulties: filters.selectedDifficulties.filter(d => d !== difficulty)
                                    })
                                  } else {
                                    onFilterChange({
                                      selectedDifficulties: [...filters.selectedDifficulties, difficulty]
                                    })
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
          <div className="space-y-2" ref={timeframesFilterRef}>
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
                      {filters.selectedTimeframes.length > 0
                        ? `${filters.selectedTimeframes.length} selected`
                        : "Select timeframe"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" side="bottom" sideOffset={4} sticky="always" collisionBoundary={timeframesFilterRef.current} avoidCollisions={false}>
                  <Command>
                    <CommandGroup className="max-h-[300px] overflow-auto p-2">
                      <div className="flex flex-wrap gap-2">
                        {timeframes.map((timeframe) => (
                          <Button
                            key={timeframe}
                            variant={filters.selectedTimeframes.includes(timeframe) ? "default" : "outline"}
                            size="sm"
                            className="h-7"
                            onClick={() => {
                              const newSelection = filters.selectedTimeframes.includes(timeframe)
                                ? filters.selectedTimeframes.filter(t => t !== timeframe)
                                : [...filters.selectedTimeframes, timeframe]
                              onFilterChange({ selectedTimeframes: newSelection })
                            }}
                          >
                            {timeframe}
                            {filters.selectedTimeframes.includes(timeframe) && (
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
            {filters.selectedTimeframes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.selectedTimeframes.map((timeframe) => (
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
          <div className="space-y-2" ref={topicsFilterRef}>
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
                      {filters.selectedTopics.length > 0
                        ? `${filters.selectedTopics.length} selected`
                        : "Select topics"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" side="bottom" sideOffset={4} sticky="always" collisionBoundary={topicsFilterRef.current} avoidCollisions={false}>
                  <Command>
                    <CommandInput
                      placeholder="Search topics..."
                      value={topicSearch}
                      onValueChange={setTopicSearch}
                    />
                    <CommandEmpty>No topics found.</CommandEmpty>
                    <CommandGroup>
                      <div className="flex flex-wrap gap-2 p-2">
                        {topics
                          .sort((a, b) => a.localeCompare(b))
                          .map((topic) => (
                            <CommandItem
                              key={topic}
                              value={topic}
                              onSelect={() => {
                                const newSelection = filters.selectedTopics.includes(topic)
                                  ? filters.selectedTopics.filter(t => t !== topic)
                                  : [...filters.selectedTopics, topic]
                                onFilterChange({ selectedTopics: newSelection })
                              }}
                              className="p-0"
                            >
                              <Button
                                variant={filters.selectedTopics.includes(topic) ? "default" : "outline"}
                                size="sm"
                                className="h-7"
                              >
                                {topic}
                                {filters.selectedTopics.includes(topic) && (
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
              {filters.selectedTopics.length > 1 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onFilterChange({
                          topicFilterMode: filters.topicFilterMode === "and" ? "or" : "and"
                        })}
                        className={cn(
                          "h-10 w-10",
                          filters.topicFilterMode === "and" ? "bg-primary text-primary-foreground" : ""
                        )}
                      >
                        {filters.topicFilterMode === "and" ? (
                          <Ampersand className="h-4 w-4" />
                        ) : (
                          <Slash className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {filters.topicFilterMode === "and"
                          ? "Show problems that have ALL selected topics"
                          : "Show problems that have ANY selected topic"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {filters.selectedTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.selectedTopics.map((topic) => (
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

        {/* Range Filters */}
        <div className="flex flex-col gap-4 lg:flex-row items-start lg:items-center mt-2">
          <div className="flex flex-col gap-3 w-full lg:flex-row lg:items-center lg:gap-4 lg:p-2 p-3 rounded-md border bg-muted/30 lg:bg-transparent lg:border-0">
            {/* Occurrences Range */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <Hash className="h-4 w-4" /> Occurrences
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={stats.occurrences.min.toString()}
                  value={filters.occurrencesRange.min === "" ? stats.occurrences.min : filters.occurrencesRange.min}
                  min={0}
                  className="w-14 h-10 sm:w-20"
                  onChange={e => onFilterChange({
                    occurrencesRange: {
                      ...filters.occurrencesRange,
                      min: e.target.value === "" ? "" : Number(e.target.value)
                    }
                  })}
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="number"
                  placeholder={stats.occurrences.max.toString()}
                  value={filters.occurrencesRange.max === "" ? stats.occurrences.max : filters.occurrencesRange.max}
                  min={0}
                  className="w-14 h-10 sm:w-20"
                  onChange={e => onFilterChange({
                    occurrencesRange: {
                      ...filters.occurrencesRange,
                      max: e.target.value === "" ? "" : Number(e.target.value)
                    }
                  })}
                />
              </div>
            </div>

            {/* Frequency Range */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <BarChart className="h-4 w-4" /> Frequency
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={stats.frequency.min.toString()}
                  value={filters.frequencyRange.min === "" ? stats.frequency.min : filters.frequencyRange.min}
                  min={0}
                  className="w-14 h-10 sm:w-20"
                  onChange={e => onFilterChange({
                    frequencyRange: {
                      ...filters.frequencyRange,
                      min: e.target.value === "" ? "" : Number(e.target.value)
                    }
                  })}
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="number"
                  placeholder={stats.frequency.max.toString()}
                  value={filters.frequencyRange.max === "" ? stats.frequency.max : filters.frequencyRange.max}
                  min={0}
                  className="w-14 h-10 sm:w-20"
                  onChange={e => onFilterChange({
                    frequencyRange: {
                      ...filters.frequencyRange,
                      max: e.target.value === "" ? "" : Number(e.target.value)
                    }
                  })}
                />
              </div>
            </div>

            {/* Acceptance Range */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Acceptance %
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={stats.acceptance.min.toString()}
                  value={filters.acceptanceRange.min === "" ? stats.acceptance.min : filters.acceptanceRange.min}
                  min={0}
                  max={100}
                  className="w-14 h-10 sm:w-20"
                  onChange={e => onFilterChange({
                    acceptanceRange: {
                      ...filters.acceptanceRange,
                      min: e.target.value === "" ? "" : Number(e.target.value)
                    }
                  })}
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="number"
                  placeholder={stats.acceptance.max.toString()}
                  value={filters.acceptanceRange.max === "" ? stats.acceptance.max : filters.acceptanceRange.max}
                  min={0}
                  max={100}
                  className="w-14 h-10 sm:w-20"
                  onChange={e => onFilterChange({
                    acceptanceRange: {
                      ...filters.acceptanceRange,
                      max: e.target.value === "" ? "" : Number(e.target.value)
                    }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Multi-company Toggle */}
          <div className="flex-shrink-0 mt-2 lg:mt-0 lg:ml-4 lg:self-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={filters.showMultiCompany ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFilterChange({ showMultiCompany: !filters.showMultiCompany })}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Exclude Single Occurrences
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show only problems that appear in multiple companies</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 