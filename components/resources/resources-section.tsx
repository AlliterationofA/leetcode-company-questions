"use client"

import { useState, useMemo } from "react"
import { Search, Book, Video, Wrench, FileText, ExternalLink, ChevronDown, ChevronUp, Filter, X, ChevronsUpDown, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [openTags, setOpenTags] = useState(false)
  const [tagSearch, setTagSearch] = useState("")

  // Combine categories and types into tags
  const tags = useMemo(() => {
    const uniqueTags = new Set<string>()
    resources.forEach(resource => {
      // Add type as a tag
      uniqueTags.add(resource.type.charAt(0).toUpperCase() + resource.type.slice(1))
      // Add categories as tags
      resource.categories.forEach(category => uniqueTags.add(category))
    })
    return Array.from(uniqueTags).sort()
  }, [resources])

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = searchTerm === "" || 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => 
          resource.categories.includes(tag) || 
          tag.toLowerCase() === resource.type
        )
      
      return matchesSearch && matchesTags
    })
  }, [resources, searchTerm, selectedTags])

  const activeFiltersCount = selectedTags.length > 0 ? 1 : 0

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  return (
    <div className="space-y-6">
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
              {filteredResources.length} of {resources.length} resources
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Tags Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Popover open={openTags} onOpenChange={setOpenTags}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openTags}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {selectedTags.length > 0
                          ? `${selectedTags.length} selected`
                          : "Select tags"}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search tags..."
                        value={tagSearch}
                        onValueChange={setTagSearch}
                      />
                      <CommandEmpty>No tags found.</CommandEmpty>
                      <CommandGroup>
                        <div className="flex flex-wrap gap-2 p-2">
                          {tags.map((tag) => (
                            <CommandItem
                              key={tag}
                              value={tag}
                              onSelect={() => {
                                const newSelection = selectedTags.includes(tag)
                                  ? selectedTags.filter(t => t !== tag)
                                  : [...selectedTags, tag]
                                setSelectedTags(newSelection)
                              }}
                              className="p-0"
                            >
                              <Button
                                variant={selectedTags.includes(tag) ? "default" : "outline"}
                                size="sm"
                                className="h-7"
                              >
                                {tag}
                                {selectedTags.includes(tag) && (
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
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTags.map((tag) => (
                    <Button
                      key={tag}
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Cards */}
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
              <img
                src={resource.favicon ? resource.favicon : `https://www.google.com/s2/favicons?domain=${new URL(resource.url).hostname}`}
                alt={resource.title + ' favicon'}
                className="w-10 h-10 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white object-contain"
                onError={e => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(resource.title)}&background=random`;
                }}
              />
            </div>
            {/* Title */}
            <div className="font-semibold text-center text-base mb-1 truncate w-full group-hover:text-primary transition-colors duration-200">{resource.title}</div>
            {/* Description */}
            <div className="text-zinc-500 dark:text-zinc-400 text-xs text-center mb-2 line-clamp-2 w-full">
              {resource.description}
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-1 justify-center mb-3 w-full">
              {/* Type Tag */}
              <span
                className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={e => {
                  e.preventDefault();
                  const typeTag = resource.type.charAt(0).toUpperCase() + resource.type.slice(1);
                  if (!selectedTags.includes(typeTag)) {
                    setSelectedTags(prev => [...prev, typeTag])
                  }
                }}
              >
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </span>
              {/* Category Tags */}
              {resource.categories.map(category => (
                <span
                  key={category}
                  className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  onClick={e => {
                    e.preventDefault();
                    if (!selectedTags.includes(category)) {
                      setSelectedTags(prev => [...prev, category])
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