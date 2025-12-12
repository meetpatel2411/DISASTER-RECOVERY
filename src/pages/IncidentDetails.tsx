/*
  BEGINNER NOTE: Displays detailed information about a single incident.
  Now includes AI-powered recovery planning and resource prioritization.
*/

import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ArrowLeft, Pencil, MapPin, Clock, Calendar, ExternalLink } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fetchIncidentById, fetchResources, fetchShelters } from "@/services/api";
import { TYPE_LABELS } from "@/types/database";
import { RecoveryPlanDialog } from "@/components/incidents/RecoveryPlanDialog";
import { ResourcePrioritization } from "@/components/incidents/ResourcePrioritization";

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: incident, isLoading } = useQuery({
    queryKey: ["incident", id],
    queryFn: () => fetchIncidentById(id!),
    enabled: !!id,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["resources"],
    queryFn: () => fetchResources(),
  });

  const { data: shelters = [] } = useQuery({
    queryKey: ["shelters"],
    queryFn: () => fetchShelters(),
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["incident", id] });
    queryClient.invalidateQueries({ queryKey: ["resources"] });
    queryClient.invalidateQueries({ queryKey: ["shelters"] });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Header isLoading={true} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading incident details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!incident) {
    return (
      <MainLayout>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-4">
          <p className="text-muted-foreground">Incident not found.</p>
          <Button onClick={() => navigate("/incidents")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Incidents
          </Button>
        </div>
      </MainLayout>
    );
  }

  const typeIcon: Record<string, string> = {
    flood: "🌊",
    fire: "🔥",
    earthquake: "🌍",
    storm: "⛈️",
    accident: "🚗",
    medical: "🏥",
    other: "⚠️",
  };

  return (
    <MainLayout>
      <Header onRefresh={handleRefresh} />
      
      <div className="p-4 md:p-6 max-w-6xl mx-auto animate-fade-in space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Incident Card */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card overflow-hidden">
            {/* Header */}
            <div className="bg-primary/5 p-4 md:p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="text-3xl md:text-4xl">{typeIcon[incident.type] || "⚠️"}</div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                      {incident.title}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {TYPE_LABELS[incident.type]}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <RecoveryPlanDialog 
                    incident={incident} 
                    resources={resources} 
                    shelters={shelters} 
                  />
                  <Link to={`/incidents/${incident.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 space-y-6">
              {/* Description */}
              {incident.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </h3>
                  <p className="text-foreground whitespace-pre-wrap">
                    {incident.description}
                  </p>
                </div>
              )}

              {/* Location */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Location
                </h3>
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="break-all">
                    {incident.address || (
                      incident.lat && incident.lng
                        ? `${incident.lat}, ${incident.lng}`
                        : "Not specified"
                    )}
                  </span>
                </div>
                {incident.lat && incident.lng && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm text-muted-foreground">
                      Coordinates: {incident.lat?.toFixed(4)}, {incident.lng?.toFixed(4)}
                    </p>
                    <Link to={`/map?lat=${incident.lat}&lng=${incident.lng}`}>
                      <Button variant="link" size="sm" className="h-auto p-0">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View on Map
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Reported
                  </h3>
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{format(new Date(incident.reported_at), "PPpp")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(incident.reported_at), { addSuffix: true })}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Last Updated
                  </h3>
                  <div className="flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{format(new Date(incident.updated_at), "PPpp")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Resource Prioritization Sidebar */}
          <div className="lg:col-span-1">
            <ResourcePrioritization
              incident={incident}
              resources={resources}
              shelters={shelters}
              onUpdate={handleRefresh}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
