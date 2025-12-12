/*
  BEGINNER NOTE: This file defines TypeScript types that match our database schema.
  Types help catch errors at compile time instead of runtime.
*/

// Enum types matching the database
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'investigating' | 'responding' | 'resolved' | 'closed';
export type IncidentType = 'flood' | 'fire' | 'earthquake' | 'storm' | 'accident' | 'medical' | 'other';
export type ResourceStatus = 'available' | 'deployed' | 'maintenance' | 'unavailable';
export type ResourceType = 'vehicle' | 'medical' | 'food' | 'shelter' | 'equipment' | 'personnel' | 'other';

// Database table types
export interface Incident {
  id: string;
  title: string;
  description: string | null;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  lat: number | null;
  lng: number | null;
  address: string | null;
  reported_at: string;
  updated_at: string;
  created_at: string;
}

export interface IncidentImage {
  id: string;
  incident_id: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  capacity: number;
  current_occupancy: number;
  contact_info: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  quantity: number;
  status: ResourceStatus;
  location: string | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  resource_name: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

// Form input types (for creating/updating)
export interface IncidentInput {
  title: string;
  description?: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  lat?: number;
  lng?: number;
  address?: string;
}

export interface ShelterInput {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  capacity: number;
  current_occupancy?: number;
  contact_info?: string;
  is_active?: boolean;
}

export interface ResourceInput {
  name: string;
  type: ResourceType;
  quantity: number;
  status: ResourceStatus;
  location?: string;
  lat?: number;
  lng?: number;
  notes?: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalIncidents: number;
  activeIncidents: number;
  totalShelters: number;
  activeShelters: number;
  totalResources: number;
  availableResources: number;
  criticalIncidents: number;
}

// Helper constants
export const INCIDENT_TYPES: IncidentType[] = ['flood', 'fire', 'earthquake', 'storm', 'accident', 'medical', 'other'];
export const INCIDENT_SEVERITIES: IncidentSeverity[] = ['low', 'medium', 'high', 'critical'];
export const INCIDENT_STATUSES: IncidentStatus[] = ['reported', 'investigating', 'responding', 'resolved', 'closed'];
export const RESOURCE_TYPES: ResourceType[] = ['vehicle', 'medical', 'food', 'shelter', 'equipment', 'personnel', 'other'];
export const RESOURCE_STATUSES: ResourceStatus[] = ['available', 'deployed', 'maintenance', 'unavailable'];

// Labels for display
export const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  reported: 'Reported',
  investigating: 'Investigating',
  responding: 'Responding',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const TYPE_LABELS: Record<IncidentType, string> = {
  flood: 'Flood',
  fire: 'Fire',
  earthquake: 'Earthquake',
  storm: 'Storm',
  accident: 'Accident',
  medical: 'Medical',
  other: 'Other',
};

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  vehicle: 'Vehicle',
  medical: 'Medical Supplies',
  food: 'Food & Water',
  shelter: 'Shelter Equipment',
  equipment: 'Equipment',
  personnel: 'Personnel',
  other: 'Other',
};

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  available: 'Available',
  deployed: 'Deployed',
  maintenance: 'Maintenance',
  unavailable: 'Unavailable',
};
