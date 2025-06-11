'use client'

import { useState, useCallback } from 'react'
import { AnalyticsData } from '@/types/analytics'
import { csvProcessor } from '@/lib/csv-processor'
import { githubApi } from '@/lib/github-api'
import { logger } from '@/lib/logger'

interface UseAnalyticsDataReturn {
  data: AnalyticsData | null
  loading: boolean
  processing: boolean
  error: string | null
  success: string | null
  leetcodeRepoLastUpdated: string | null
  handleCSVProcessing: (useGitHubData?: boolean) => Promise<void>
}

export function useAnalyticsData(): UseAnalyticsDataReturn {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [leetcodeRepoLastUpdated, setLeetcodeRepoLastUpdated] = useState<string | null>(null)

  const handleCSVProcessing = useCallback(async (useGitHubData = true) => {
    try {
      setProcessing(true)
      setError(null)
      setSuccess(null)

      if (useGitHubData) {
        // Get latest data from GitHub
        const lastUpdated = await githubApi.getLastUpdated()
        setLeetcodeRepoLastUpdated(lastUpdated)
        
        // Process the data
        logger.info('Processing CSV data from GitHub...')
        const processedData = await csvProcessor.processGitHubData()
        setData(processedData)
        setSuccess('Successfully loaded and processed data from GitHub')
      } else {
        // Process local data
        logger.info('Processing local CSV data...')
        const processedData = await csvProcessor.processLocalData()
        setData(processedData)
        setSuccess('Successfully loaded and processed local data')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      logger.error('Error processing CSV data:', errorMessage)
      setError(`Failed to process data: ${errorMessage}`)
    } finally {
      setProcessing(false)
      setLoading(false)
    }
  }, [])

  return {
    data,
    loading,
    processing,
    error,
    success,
    leetcodeRepoLastUpdated,
    handleCSVProcessing
  }
} 