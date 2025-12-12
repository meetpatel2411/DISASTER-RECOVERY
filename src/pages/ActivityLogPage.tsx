/*
  BEGINNER NOTE: This page displays the activity/audit log showing
  all create, update, and delete operations with timestamps.
*/

import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow, format } from "date-fns";
import { fetchActivityLog } from "@/services/api";
import type { ActivityLog } from "@/types/database";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Database, Activity } from "lucide-react";

const actionIcons: Record<string, React.ReactNode> = {
  CREATE: <Plus className="h-4 w-4" />,
  UPDATE: <Pencil className="h-4 w-4" />,
  DELETE: <Trash2 className="h-4 w-4" />,
  SEED: <Database className="h-4 w-4" />,
};

const actionStyles: Record<string, string> = {
  CREATE: "bg-success/10 text-success border-success/30",
  UPDATE: "bg-info/10 text-info border-info/30",
  DELETE: "bg-destructive/10 text-destructive border-destructive/30",
  SEED: "bg-primary/10 text-primary border-primary/30",
};

export default function ActivityLogPage() {
  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["activityLog"],
    queryFn: () => fetchActivityLog(100),
  });

  return (
    <MainLayout>
      <Header onRefresh={() => refetch()} isLoading={isLoading} />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Info Banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-card shadow-card">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">Activity Log</p>
            <p className="text-sm text-muted-foreground">
              Tracks all add, update, and delete operations for audit purposes.
            </p>
          </div>
        </div>

        {/* Activity Log Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Action</TableHead>
                <TableHead>Resource Type</TableHead>
                <TableHead>Resource Name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading activity log...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">No activity recorded yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adding some sample data from the Dashboard.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: ActivityLog) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("flex items-center gap-1.5 w-fit", actionStyles[log.action])}
                      >
                        {actionIcons[log.action]}
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize font-medium">
                      {log.resource_type}
                    </TableCell>
                    <TableCell>
                      {log.resource_name || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      {log.details ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {JSON.stringify(log.details).substring(0, 100)}
                          {JSON.stringify(log.details).length > 100 ? "..." : ""}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm">
                        {format(new Date(log.created_at), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
