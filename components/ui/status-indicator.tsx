import { CheckCircle, AlertCircle, Loader2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: "loading" | "success" | "error" | "warning"
  message?: string
  className?: string
}

export function StatusIndicator({ status, message, className }: StatusIndicatorProps) {
  const statusConfig = {
    loading: {
      icon: Loader2,
      className: "text-blue-500 animate-spin",
      bgClassName: "bg-blue-50 border-blue-200",
    },
    success: {
      icon: CheckCircle,
      className: "text-green-600",
      bgClassName: "bg-green-50 border-green-200",
    },
    error: {
      icon: XCircle,
      className: "text-red-600",
      bgClassName: "bg-red-50 border-red-200",
    },
    warning: {
      icon: AlertCircle,
      className: "text-yellow-600",
      bgClassName: "bg-yellow-50 border-yellow-200",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn("flex items-center gap-2 p-3 rounded-lg border", config.bgClassName, className)}>
      <Icon className={cn("h-4 w-4", config.className)} />
      {message && (
        <span
          className={cn(
            "text-sm font-medium",
            status === "success" && "text-green-800",
            status === "error" && "text-red-800",
            status === "warning" && "text-yellow-800",
            status === "loading" && "text-blue-800",
          )}
        >
          {message}
        </span>
      )}
    </div>
  )
}
