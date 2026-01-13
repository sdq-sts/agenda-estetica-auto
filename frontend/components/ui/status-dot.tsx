import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusVariant = "pending" | "confirmed" | "completed" | "cancelled"

interface StatusDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: StatusVariant
  label: string
}

const statusConfig = {
  pending: {
    dotColor: "bg-amber-500",
    textColor: "text-slate-700",
  },
  confirmed: {
    dotColor: "bg-slate-700",
    textColor: "text-slate-700",
  },
  completed: {
    dotColor: "bg-success-500",
    textColor: "text-slate-700",
  },
  cancelled: {
    dotColor: "bg-danger-500",
    textColor: "text-slate-500",
  },
}

export function StatusDot({ variant, label, className, ...props }: StatusDotProps) {
  const config = statusConfig[variant]

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
      <span className={cn("text-sm font-medium", config.textColor)}>
        {label}
      </span>
    </div>
  )
}
