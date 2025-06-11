"use client"
import { useRef, useState, useEffect } from 'react'
import { useAnalyticsData } from '@/hooks/useAnalyticsData'
import { useFilters } from '@/hooks/useFilters'
import { useSorting } from '@/hooks/useSorting'
import { ProblemsTable } from '@/components/problems/ProblemsTable'
import { CompanyAnalytics } from '@/components/companies/CompanyAnalytics'
import { FiltersPanel } from '@/components/filters/FiltersPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { StatusIndicator } from '@/components/ui/status-indicator'

export default function LeetCodeAnalytics() {
  // State management hooks
  const {
    data,
    loading,
    processing,
    error,
    success,
    leetcodeRepoLastUpdated,
    handleCSVProcessing
  } = useAnalyticsData()

  // Load data when component mounts
  useEffect(() => {
    handleCSVProcessing(true)
  }, [handleCSVProcessing])

  const {
    filters,
    updateFilter,
    getFilteredQuestions,
    stats
  } = useFilters(data?.questions || [])

  const {
    sort,
    handleSort,
    getSortedQuestions
  } = useSorting()

  // UI state
  const tabsRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState('problems')

  // Get filtered and sorted questions
  const filteredQuestions = getFilteredQuestions(data?.questions || [])
  const sortedQuestions = getSortedQuestions(filteredQuestions)

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LeetCode Analytics</h1>
          <p className="text-muted-foreground">
            Track and analyze LeetCode problems by company and timeframe
          </p>
        </div>
        <StatusIndicator
          loading={loading || processing}
          error={error}
          success={success}
          lastUpdated={leetcodeRepoLastUpdated}
          onRefresh={() => handleCSVProcessing(true)}
        />
      </div>

      {/* Main content */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-[300px_1fr]">
        {/* Filters */}
        <aside>
          <FiltersPanel
            filters={filters}
            stats={stats}
            onFilterChange={updateFilter}
            companies={data?.companies || []}
            difficulties={data?.difficulties || []}
            timeframes={data?.timeframes || []}
            topics={data?.topics || []}
          />
        </aside>

        {/* Content */}
        <main>
          <Tabs
            ref={tabsRef}
            defaultValue="problems"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="problems" className="flex-1">Problems</TabsTrigger>
              <TabsTrigger value="companies" className="flex-1">Companies</TabsTrigger>
            </TabsList>

            <TabsContent value="problems" className="mt-6">
              <ProblemsTable
                questions={sortedQuestions}
                sort={sort}
                onSort={handleSort}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="companies" className="mt-6">
              <CompanyAnalytics
                data={data?.companies || []}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
