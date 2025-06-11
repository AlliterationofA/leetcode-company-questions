'use client'

import { useState, useCallback } from 'react'
import { RangeFilter, Stats } from '@/types/analytics'

interface UseRangeFilterReturn {
  range: RangeFilter
  setRange: (range: RangeFilter) => void
  validateRange: (value: string, isMin: boolean) => boolean
  formatRangeValue: (value: string | number) => string
  isValidRange: boolean
}

export function useRangeFilter(
  initialRange: RangeFilter = { min: "", max: "" },
  stats: Stats = { min: 0, max: 100 }
): UseRangeFilterReturn {
  const [range, setRange] = useState<RangeFilter>(initialRange)
  const [isValid, setIsValid] = useState(true)

  // Validate a single range value
  const validateRange = useCallback((value: string, isMin: boolean) => {
    if (value === "") return true
    const numValue = Number(value)
    if (isNaN(numValue)) return false
    
    // Check if value is within stats bounds
    if (numValue < stats.min || numValue > stats.max) return false
    
    // Check if min/max relationship is valid
    if (isMin) {
      return range.max === "" || numValue <= Number(range.max)
    } else {
      return range.min === "" || numValue >= Number(range.min)
    }
  }, [range, stats])

  // Format range value for display
  const formatRangeValue = useCallback((value: string | number) => {
    if (value === "") return ""
    return String(value)
  }, [])

  // Update isValid whenever range changes
  const checkValidity = useCallback(() => {
    const valid = range.min === "" && range.max === "" ||
                 (validateRange(String(range.min), true) && validateRange(String(range.max), false))
    setIsValid(valid)
  }, [range, validateRange])

  // Call checkValidity whenever range changes
  useCallback(() => {
    checkValidity()
  }, [range, checkValidity])

  return {
    range,
    setRange,
    validateRange,
    formatRangeValue,
    isValidRange: isValid
  }
} 