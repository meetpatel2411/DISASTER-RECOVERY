/*
  BEGINNER NOTE: This is the Dashboard page - the main landing page
  showing overview statistics, recent incidents, and AI predictions widget.
*/

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentIncidents } from "@/components/dashboard/RecentIncidents";
import { RiskSummaryWidget } from "@/components/dashboard/RiskSummaryWidget";
import { HazardScoreWidget } from "@/components/dashboard/HazardScoreWidget";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Home,
  Package,
  AlertCircle,
  Plus,
  Map,
  Brain,
} from "lucide-react";
import { fetchDashboardStats, fetchIncidents, seedSampleData } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const queryClient = useQueryClient();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  // Fetch recent incidents
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => fetchIncidents(),
  });

  // Refresh all data
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    queryClient.invalidateQueries({ queryKey: ["incidents"] });
    toast({ title: "Data refreshed", description: "All data has been updated." });
  };

  // Seed sample data
  const handleSeedData = async () => {
    try {
      const result = await seedSampleData();
      queryClient.invalidateQueries();
      toast({
        title: "Sample data created",
        description: `Added ${result.incidents} incidents, ${result.shelters} shelters, and ${result.resources} resources.`,
      });
    } catch (error) {
      toast({
        title: "Error seeding data",
        description: error instanceof Error ? error.message : "Failed to create sample data",
        variant: "destructive",
      });
    }
  };

  const isLoading = statsLoading || incidentsLoading;

  return (
    <MainLayout>
      <Header
        onRefresh={handleRefresh}
        onSeedData={handleSeedData}
        isLoading={isLoading}
      />

      <div className="p-4 md:p-6 space-y-6 animate-fade-in">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard
            label="Active Incidents"
            value={stats?.activeIncidents ?? 0}
            icon={AlertTriangle}
            variant={stats?.activeIncidents && stats.activeIncidents > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Critical Alerts"
            value={stats?.criticalIncidents ?? 0}
            icon={AlertCircle}
            variant={stats?.criticalIncidents && stats.criticalIncidents > 0 ? "danger" : "default"}
          />
          <StatCard
            label="Active Shelters"
            value={`${stats?.activeShelters ?? 0}/${stats?.totalShelters ?? 0}`}
            icon={Home}
            variant="default"
          />
          <StatCard
            label="Available Resources"
            value={`${stats?.availableResources ?? 0}/${stats?.totalResources ?? 0}`}
            icon={Package}
            variant="success"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          <Link to="/incidents/new">
            <Button size="sm" className="md:size-default">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Report</span> Incident
            </Button>
          </Link>
          <Link to="/map">
            <Button variant="outline" size="sm" className="md:size-default">
              <Map className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Open</span> Map
            </Button>
          </Link>
          <Link to="/predictions">
            <Button variant="outline" size="sm" className="md:size-default">
              <Brain className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">AI</span> Predictions
            </Button>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Recent Incidents - takes 2 cols on xl */}
          <div className="xl:col-span-2">
            <RecentIncidents incidents={incidents} />
          </div>

          {/* Right Sidebar - AI Widgets */}
          <div className="space-y-6">
            {/* Risk Summary Widget */}
            <RiskSummaryWidget incidents={incidents} />

            {/* Hazard Score Widget */}
            <HazardScoreWidget incidents={incidents} />

            {/* Quick Stats Card */}
            <div className="rounded-xl border bg-card p-4 md:p-6 shadow-card">
              <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Incidents</span>
                  <span className="text-lg font-semibold">{stats?.totalIncidents ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Shelters</span>
                  <span className="text-lg font-semibold">{stats?.activeShelters ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Resources Deployed</span>
                  <span className="text-lg font-semibold">
                    {(stats?.totalResources ?? 0) - (stats?.availableResources ?? 0)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  ⚠️ <strong>Security Notice:</strong> This demo runs without authentication. 
                  Not for production use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
