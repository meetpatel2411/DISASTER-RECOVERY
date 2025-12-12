/*
  BEGINNER NOTE: A reusable card component for displaying statistics
  with an icon, label, and value.
*/

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  variant?: "default" | "warning" | "danger" | "success";
  className?: string;
}

const variantStyles = {
  default: "bg-card",
  warning: "bg-warning/10 border-warning/20",
  danger: "bg-destructive/10 border-destructive/20",
  success: "bg-success/10 border-success/20",
};

const iconStyles = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/20 text-warning",
  danger: "bg-destructive/20 text-destructive",
  success: "bg-success/20 text-success",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-card transition-shadow hover:shadow-card-hover",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-3", iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
