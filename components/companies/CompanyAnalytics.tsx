'use client'

import { useMemo } from 'react'
import { Building2 } from 'lucide-react'
import { CompanyData } from '@/types/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export interface CompanyAnalyticsProps {
  data: CompanyData[]
  loading: boolean
}

export function CompanyAnalytics({ data, loading }: CompanyAnalyticsProps) {
  // Transform data for chart
  const chartData = useMemo(() => {
    return data.map(company => ({
      name: company.name,
      value: company.totalProblems
    }))
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Company Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map(company => (
          <Card key={company.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {company.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Total Problems</dt>
                  <dd className="text-sm font-medium">{company.totalProblems}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Recent Problems</dt>
                  <dd className="text-sm font-medium">{company.recentProblems}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Average Frequency</dt>
                  <dd className="text-sm font-medium">{company.avgFrequency.toFixed(1)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Average Acceptance</dt>
                  <dd className="text-sm font-medium">{company.avgAcceptance.toFixed(1)}%</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 