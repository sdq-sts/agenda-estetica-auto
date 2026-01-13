import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusType = "pending" | "confirmed" | "completed" | "cancelled"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType
  label: string
}

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
}

export function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        statusStyles[status],
        className
      )}
      {...props}
    >
      {label}
    </span>
  )
}
