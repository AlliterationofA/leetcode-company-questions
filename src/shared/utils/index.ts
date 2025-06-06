import { Difficulty, Timeframe } from '../types'
import { DIFFICULTY_COLORS } from '../constants'

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const formatPercentage = (value: number): string => {
  if (isNaN(value) || value < 0 || value > 1) {
    throw new AppError('Invalid percentage value', 'INVALID_PERCENTAGE', { value })
  }
  return `${(value * 100).toFixed(1)}%`
}

export const formatFrequency = (value: number): string => {
  if (isNaN(value) || value < 0) {
    throw new AppError('Invalid frequency value', 'INVALID_FREQUENCY', { value })
  }
  return value.toFixed(2)
}

export const getDifficultyColor = (difficulty: Difficulty): string => {
  return DIFFICULTY_COLORS[difficulty]
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const callNow = immediate && !timeout

    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

export const sortByProperty = <T>(
  array: T[],
  property: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[property]
    const bValue = b[property]

    if (aValue === bValue) return 0
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    const comparison = aValue < bValue ? -1 : 1
    return direction === 'asc' ? comparison : -comparison
  })
}

export const filterBySearchTerm = <T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return items

  const normalizedSearch = searchTerm.toLowerCase().trim()
  
  return items.filter(item => 
    searchFields.some(field => {
      const value = item[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(normalizedSearch)
      }
      if (Array.isArray(value)) {
        return value.some((v: string) => 
          typeof v === 'string' && v.toLowerCase().includes(normalizedSearch)
        )
      }
      return false
    })
  )
}

export const validateTimeframe = (timeframe: string): timeframe is Timeframe => {
  return ['Last 6 Months', 'Last Year', 'Last 2 Years', 'All Time'].includes(timeframe)
}

export const validateDifficulty = (difficulty: string): difficulty is Difficulty => {
  return ['Easy', 'Medium', 'Hard'].includes(difficulty)
}

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
} 