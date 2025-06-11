'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export interface StatusIndicatorProps {
  loading: boolean
  error: string | null
  success: string | null
  lastUpdated: string | null
  onRefresh: () => void
}

export function StatusIndicator({
  loading,
  error,
  success,
  lastUpdated,
  onRefresh
}: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Status message */}
      {(error || success) && (
        <div className={`text-sm ${error ? 'text-destructive' : 'text-success'}`}>
          {error || success}
        </div>
      )}

      {/* Last updated */}
      {lastUpdated && !loading && !error && (
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}

      {/* Refresh button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
