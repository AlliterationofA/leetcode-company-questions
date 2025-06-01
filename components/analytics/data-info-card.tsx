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
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          Maintained by
          <img src="https://github.com/AlliterationofA.png" alt="AlliterationofA GitHub Profile Picture" className="w-5 h-5 rounded-full" />
          <a href="https://github.com/AlliterationofA" target="_blank" rel="noopener noreferrer" className="hover:underline">
            @AlliterationofA
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
