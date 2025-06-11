"use client"

import { useState, useMemo } from "react"
import { Search, Book, Video, Wrench, FileText, ExternalLink, ChevronDown, ChevronUp, Filter, Star, Clock, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface Resource {
  id: string
  title: string
  description: string
  url: string
  type: "book" | "video" | "tool" | "article"
  categories: string[]
  subcategories: string[]
  favicon?: string
}

interface ResourcesSectionProps {
  resources: Resource[]
}

export function ResourcesSection({ resources }: ResourcesSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>()
    resources.forEach(resource => {
      resource.categories.forEach(category => uniqueCategories.add(category))
    })
    return Array.from(uniqueCategories).sort()
  }, [resources])

  const types = ["book", "video", "tool", "article"]

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = searchTerm === "" || 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategories = selectedCategories.length === 0 ||
        selectedCategories.some(category => resource.categories.includes(category))
      const matchesTypes = selectedTypes.length === 0 ||
        selectedTypes.includes(resource.type)
      return matchesSearch && matchesCategories && matchesTypes
    })
  }, [resources, searchTerm, selectedCategories, selectedTypes])

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Filters
              {(selectedCategories.length > 0 || selectedTypes.length > 0) && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCategories.length + selectedTypes.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            <DropdownMenuGroup>
              {categories.map(category => (
                <DropdownMenuItem
                  key={category}
                  onSelect={(e) => {
                    e.preventDefault()
                    setSelectedCategories(prev =>
                      prev.includes(category)
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    )
                  }}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      selectedCategories.includes(category) ? "bg-primary" : "bg-muted"
                    )} />
                    {category}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Types</DropdownMenuLabel>
            <DropdownMenuGroup>
              {types.map(type => (
                <DropdownMenuItem
                  key={type}
                  onSelect={(e) => {
                    e.preventDefault()
                    setSelectedTypes(prev =>
                      prev.includes(type)
                        ? prev.filter(t => t !== type)
                        : [...prev, type]
                    )
                  }}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      selectedTypes.includes(type) ? "bg-primary" : "bg-muted"
                    )} />
                    <span className="capitalize">{type}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Resource Cards - stat card style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredResources.map(resource => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all duration-200 p-4 min-h-[220px] max-w-xs mx-auto cursor-pointer outline-none focus:ring-2 focus:ring-primary/60 hover:border-primary/40 group"
            style={{ minWidth: 240 }}
          >
            {/* Favicon */}
            <div className="flex-shrink-0 mb-2">
              {resource.favicon ? (
                <img
                  src={resource.favicon}
                  alt={resource.title + ' favicon'}
                  className="w-10 h-10 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Wrench className="h-5 w-5" />
                </div>
              )}
            </div>
            {/* Title */}
            <div className="font-semibold text-center text-base mb-1 truncate w-full group-hover:text-primary transition-colors duration-200">{resource.title}</div>
            {/* Description */}
            <div className="text-zinc-500 dark:text-zinc-400 text-xs text-center mb-2 line-clamp-2 w-full">
              {resource.description}
            </div>
            {/* Categories */}
            <div className="flex flex-wrap gap-1 justify-center mb-3 w-full">
              {resource.categories.map(category => (
                <span
                  key={category}
                  className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  onClick={e => {
                    e.preventDefault();
                    if (!selectedCategories.includes(category)) {
                      setSelectedCategories(prev => [...prev, category])
                    }
                  }}
                >
                  {category}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No resources found matching your criteria.</p>
        </div>
      )}
    </div>
  )
} 