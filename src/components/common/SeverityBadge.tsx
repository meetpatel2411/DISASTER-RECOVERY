/*
  BEGINNER NOTE: A reusable badge component for displaying incident severity.
*/

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IncidentSeverity } from "@/types/database";

interface SeverityBadgeProps {
  severity: IncidentSeverity;
  className?: string;
}

const severityStyles: Record<IncidentSeverity, string> = {
  low: "bg-severity-low/10 text-severity-low border-severity-low/30 hover:bg-severity-low/20",
  medium: "bg-severity-medium/10 text-severity-medium border-severity-medium/30 hover:bg-severity-medium/20",
  high: "bg-severity-high/10 text-severity-high border-severity-high/30 hover:bg-severity-high/20",
  critical: "bg-severity-critical/10 text-severity-critical border-severity-critical/30 hover:bg-severity-critical/20",
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-medium", severityStyles[severity], className)}
    >
      {severity === "critical" && <span className="mr-1 animate-pulse">●</span>}
      {severity}
    </Badge>
  );
}
