"use client"

import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DataInfoCardProps {
  metadata: {
    lastCommitHash: string
    lastUpdated: string
    cloneDate: string
    commitUrl: string
    commitMessage: string
    commitAuthor: string
  }
}

export function DataInfoCard({ metadata }: DataInfoCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch (error) {
      return "Unknown"
    }
  }

  const lastUpdated = formatDate(metadata.lastUpdated)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{lastUpdated}</div>
        <p className="text-xs text-muted-foreground">Data from GitHub repository</p>
      </CardContent>
    </Card>
  )
}
