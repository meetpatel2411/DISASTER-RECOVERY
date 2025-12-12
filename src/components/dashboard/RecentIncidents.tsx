/*
  BEGINNER NOTE: This component displays a list of recent incidents
  in a card format for the dashboard.
*/

import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Incident } from "@/types/database";
import { cn } from "@/lib/utils";

interface RecentIncidentsProps {
  incidents: Incident[];
}

const severityColors: Record<string, string> = {
  low: "bg-severity-low/10 text-severity-low border-severity-low/20",
  medium: "bg-severity-medium/10 text-severity-medium border-severity-medium/20",
  high: "bg-severity-high/10 text-severity-high border-severity-high/20",
  critical: "bg-severity-critical/10 text-severity-critical border-severity-critical/20",
};

const typeIcons: Record<string, string> = {
  flood: "🌊",
  fire: "🔥",
  earthquake: "🌍",
  storm: "⛈️",
  accident: "🚗",
  medical: "🏥",
  other: "⚠️",
};

export function RecentIncidents({ incidents }: RecentIncidentsProps) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="text-lg font-semibold text-foreground">Recent Incidents</h3>
        <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">No incidents reported yet.</p>
          <Link to="/incidents">
            <Button variant="outline" className="mt-4">
              Report First Incident
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Incidents</h3>
        <Link to="/incidents">
          <Button variant="ghost" size="sm">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="divide-y divide-border">
        {incidents.slice(0, 5).map((incident) => (
          <Link
            key={incident.id}
            to={`/incidents/${incident.id}`}
            className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl">
              {typeIcons[incident.type] || "⚠️"}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{incident.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {incident.address || "Location not specified"}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <Badge
                variant="outline"
                className={cn("capitalize", severityColors[incident.severity])}
              >
                {incident.severity}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(incident.reported_at), { addSuffix: true })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
