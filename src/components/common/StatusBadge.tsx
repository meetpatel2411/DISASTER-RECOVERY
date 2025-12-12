/*
  BEGINNER NOTE: A reusable badge component for displaying incident status.
*/

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IncidentStatus } from "@/types/database";

interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

const statusStyles: Record<IncidentStatus, string> = {
  reported: "bg-status-reported/10 text-status-reported border-status-reported/30",
  investigating: "bg-status-investigating/10 text-status-investigating border-status-investigating/30",
  responding: "bg-status-responding/10 text-status-responding border-status-responding/30",
  resolved: "bg-status-resolved/10 text-status-resolved border-status-resolved/30",
  closed: "bg-status-closed/10 text-status-closed border-status-closed/30",
};

const statusLabels: Record<IncidentStatus, string> = {
  reported: "Reported",
  investigating: "Investigating",
  responding: "Responding",
  resolved: "Resolved",
  closed: "Closed",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", statusStyles[status], className)}
    >
      {statusLabels[status]}
    </Badge>
  );
}
