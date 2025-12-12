/*
  BEGINNER NOTE: This page shows an interactive map with all incidents,
  shelters, and resources plotted as markers using Leaflet.js
*/

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchIncidents, fetchShelters, fetchResources } from "@/services/api";
import type { Incident, Shelter, Resource } from "@/types/database";
import { cn } from "@/lib/utils";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons
const createIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const severityColors: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

const typeEmojis: Record<string, string> = {
  flood: "🌊",
  fire: "🔥",
  earthquake: "🌍",
  storm: "⛈️",
  accident: "🚗",
  medical: "🏥",
  other: "⚠️",
};

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [showIncidents, setShowIncidents] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showResources, setShowResources] = useState(true);

  // Fetch all data
  const { data: incidents = [], refetch: refetchIncidents } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => fetchIncidents(),
  });

  const { data: shelters = [], refetch: refetchShelters } = useQuery({
    queryKey: ["shelters"],
    queryFn: () => fetchShelters(),
  });

  const { data: resources = [], refetch: refetchResources } = useQuery({
    queryKey: ["resources"],
    queryFn: () => fetchResources(),
  });

  const handleRefresh = () => {
    refetchIncidents();
    refetchShelters();
    refetchResources();
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([40.7128, -74.006], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when data or filters change
  useEffect(() => {
    if (!markersRef.current || !mapInstanceRef.current) return;

    markersRef.current.clearLayers();
    const bounds: L.LatLngBounds = L.latLngBounds([]);

    // Add incident markers
    if (showIncidents) {
      incidents.forEach((incident: Incident) => {
        if (incident.lat && incident.lng) {
          const color = severityColors[incident.severity] || "#6b7280";
          const emoji = typeEmojis[incident.type] || "⚠️";
          const icon = createIcon(color, emoji);

          const marker = L.marker([incident.lat, incident.lng], { icon })
            .bindPopup(`
              <div style="min-width: 200px;">
                <h3 style="font-weight: 600; margin-bottom: 4px;">${incident.title}</h3>
                <p style="color: #666; font-size: 12px; margin-bottom: 8px;">${incident.type} • ${incident.severity}</p>
                ${incident.description ? `<p style="font-size: 13px; margin-bottom: 8px;">${incident.description.substring(0, 100)}${incident.description.length > 100 ? '...' : ''}</p>` : ''}
                <p style="color: #666; font-size: 12px;">${incident.address || 'No address'}</p>
              </div>
            `)
            .addTo(markersRef.current!);

          bounds.extend([incident.lat, incident.lng]);
        }
      });
    }

    // Add shelter markers
    if (showShelters) {
      shelters.forEach((shelter: Shelter) => {
        if (shelter.lat && shelter.lng) {
          const icon = createIcon(shelter.is_active ? "#22c55e" : "#9ca3af", "🏠");

          const marker = L.marker([shelter.lat, shelter.lng], { icon })
            .bindPopup(`
              <div style="min-width: 200px;">
                <h3 style="font-weight: 600; margin-bottom: 4px;">${shelter.name}</h3>
                <p style="color: #666; font-size: 12px; margin-bottom: 8px;">${shelter.is_active ? 'Active' : 'Inactive'} Shelter</p>
                <p style="font-size: 13px;">Capacity: ${shelter.current_occupancy}/${shelter.capacity}</p>
                <p style="color: #666; font-size: 12px; margin-top: 4px;">${shelter.address}</p>
              </div>
            `)
            .addTo(markersRef.current!);

          bounds.extend([shelter.lat, shelter.lng]);
        }
      });
    }

    // Add resource markers (only those with coordinates)
    if (showResources) {
      resources.forEach((resource: Resource) => {
        if (resource.lat && resource.lng) {
          const statusColors: Record<string, string> = {
            available: "#22c55e",
            deployed: "#eab308",
            maintenance: "#3b82f6",
            unavailable: "#9ca3af",
          };
          const color = statusColors[resource.status] || "#6b7280";
          const icon = createIcon(color, "📦");

          const marker = L.marker([resource.lat, resource.lng], { icon })
            .bindPopup(`
              <div style="min-width: 180px;">
                <h3 style="font-weight: 600; margin-bottom: 4px;">${resource.name}</h3>
                <p style="color: #666; font-size: 12px; margin-bottom: 8px;">${resource.type} • ${resource.status}</p>
                <p style="font-size: 13px;">Quantity: ${resource.quantity}</p>
              </div>
            `)
            .addTo(markersRef.current!);

          bounds.extend([resource.lat, resource.lng]);
        }
      });
    }

    // Fit bounds if we have markers
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [incidents, shelters, resources, showIncidents, showShelters, showResources]);

  return (
    <MainLayout>
      <Header onRefresh={handleRefresh} />

      <div className="p-6 space-y-4 animate-fade-in">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-6 p-4 rounded-xl border bg-card shadow-card">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-incidents"
              checked={showIncidents}
              onCheckedChange={(checked) => setShowIncidents(checked as boolean)}
            />
            <Label htmlFor="show-incidents" className="flex items-center gap-2 cursor-pointer">
              <span>⚠️ Incidents</span>
              <Badge variant="secondary">{incidents.filter((i: Incident) => i.lat && i.lng).length}</Badge>
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="show-shelters"
              checked={showShelters}
              onCheckedChange={(checked) => setShowShelters(checked as boolean)}
            />
            <Label htmlFor="show-shelters" className="flex items-center gap-2 cursor-pointer">
              <span>🏠 Shelters</span>
              <Badge variant="secondary">{shelters.filter((s: Shelter) => s.lat && s.lng).length}</Badge>
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="show-resources"
              checked={showResources}
              onCheckedChange={(checked) => setShowResources(checked as boolean)}
            />
            <Label htmlFor="show-resources" className="flex items-center gap-2 cursor-pointer">
              <span>📦 Resources</span>
              <Badge variant="secondary">{resources.filter((r: Resource) => r.lat && r.lng).length}</Badge>
            </Label>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-muted-foreground">Severity:</span>
            {Object.entries(severityColors).map(([severity, color]) => (
              <div key={severity} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs capitalize">{severity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div
            ref={mapRef}
            className="h-[calc(100vh-280px)] min-h-[400px] w-full"
          />
        </div>
      </div>
    </MainLayout>
  );
}
