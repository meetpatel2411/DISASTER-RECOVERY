/*
  BEGINNER NOTE: Form component for creating and editing incidents.
  Uses React Hook Form for form handling and validation.
*/

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { fetchIncidentById, createIncident, updateIncident } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import {
  INCIDENT_TYPES,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  TYPE_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
} from "@/types/database";
import type { IncidentInput, IncidentType, IncidentSeverity, IncidentStatus } from "@/types/database";

export default function IncidentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncidentInput>({
    defaultValues: {
      type: "other",
      severity: "medium",
      status: "reported",
    },
  });

  // Fetch existing incident if editing
  const { data: incident, isLoading } = useQuery({
    queryKey: ["incident", id],
    queryFn: () => fetchIncidentById(id!),
    enabled: isEditing,
  });

  // Populate form when incident data loads
  useEffect(() => {
    if (incident) {
      reset({
        title: incident.title,
        description: incident.description || "",
        type: incident.type,
        severity: incident.severity,
        status: incident.status,
        lat: incident.lat || undefined,
        lng: incident.lng || undefined,
        address: incident.address || "",
      });
    }
  }, [incident, reset]);

  // Create/Update mutations
  const createMutation = useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast({ title: "Incident created", description: "New incident has been reported." });
      navigate("/incidents");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create incident",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IncidentInput> }) =>
      updateIncident(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", id] });
      toast({ title: "Incident updated", description: "Changes have been saved." });
      navigate("/incidents");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update incident",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IncidentInput) => {
    // Convert lat/lng strings to numbers if provided
    const formattedData = {
      ...data,
      lat: data.lat ? Number(data.lat) : undefined,
      lng: data.lng ? Number(data.lng) : undefined,
    };

    if (isEditing) {
      updateMutation.mutate({ id: id!, data: formattedData });
    } else {
      createMutation.mutate(formattedData);
    }
  };

  if (isEditing && isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading incident...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="rounded-xl border bg-card p-6 shadow-card animate-fade-in">
          <h1 className="text-2xl font-semibold text-foreground mb-6">
            {isEditing ? "Edit Incident" : "Report New Incident"}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the incident"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the incident..."
                rows={4}
                {...register("description")}
              />
            </div>

            {/* Type, Severity, Status - Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(value: IncidentType) => setValue("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select
                  value={watch("severity")}
                  onValueChange={(value: IncidentSeverity) => setValue("severity", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_SEVERITIES.map((sev) => (
                      <SelectItem key={sev} value={sev}>
                        {SEVERITY_LABELS[sev]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value: IncidentStatus) => setValue("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street address or location description"
                {...register("address")}
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  placeholder="e.g., 40.7128"
                  {...register("lat")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  placeholder="e.g., -74.0060"
                  {...register("lng")}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Save Changes" : "Create Incident"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
