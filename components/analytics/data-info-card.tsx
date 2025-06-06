"use client"

import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DataInfoCardProps {
  metadata: {
    lastCommitHash: string
    lastUpdated: string
    cloneDate: string
    commitUrl: string
    commitMessage: string
    commitAuthor: string
  }
  className?: string;
}

export function DataInfoCard({ metadata, className }: DataInfoCardProps) {
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
    <Card className={cn(
      "bg-black text-white rounded-lg w-96 cursor-pointer",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">Last Updated</CardTitle>
        <Calendar className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{lastUpdated}</div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          Maintained by
          <img src="https://github.com/AlliterationofA.png" alt="AlliterationofA GitHub Profile Picture" className="w-5 h-5 rounded-full" />
          <a href="https://github.com/AlliterationofA" target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-300">
            @AlliterationofA
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
