/*
  BEGINNER NOTE: This file contains all API functions that communicate with the database.
  We use Supabase client to make queries. Each function handles one type of operation.
  All functions also log activities for the audit trail.
*/

import { supabase } from "@/integrations/supabase/client";
import type {
  Incident,
  IncidentInput,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  ResourceType,
  ResourceStatus,
  Shelter,
  ShelterInput,
  Resource,
  ResourceInput,
  ActivityLog,
  IncidentImage,
  DashboardStats,
} from "@/types/database";

// ===================== ACTIVITY LOGGING =====================
// BEGINNER NOTE: This function logs every action for the audit trail

async function logActivity(
  action: string,
  resourceType: string,
  resourceId?: string,
  resourceName?: string,
  details?: Record<string, unknown>
) {
  try {
    await supabase.from("activity_log").insert([{
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      resource_name: resourceName,
      details: details ? JSON.parse(JSON.stringify(details)) : null,
    }]);
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - logging shouldn't break the main operation
  }
}

// ===================== INCIDENTS API =====================

export async function fetchIncidents(filters?: {
  type?: string;
  severity?: string;
  status?: string;
  search?: string;
}) {
  let query = supabase
    .from("incidents")
    .select("*")
    .order("reported_at", { ascending: false });

  // Apply filters if provided
  // BEGINNER NOTE: We cast to 'any' here because filters come from URL params as strings
  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type as IncidentType);
  }
  if (filters?.severity && filters.severity !== "all") {
    query = query.eq("severity", filters.severity as IncidentSeverity);
  }
  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status as IncidentStatus);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Incident[];
}

export async function fetchIncidentById(id: string) {
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Incident | null;
}

export async function createIncident(input: IncidentInput) {
  const { data, error } = await supabase
    .from("incidents")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  // Log the activity
  await logActivity("CREATE", "incident", data.id, data.title, { severity: input.severity, type: input.type });

  return data as Incident;
}

export async function updateIncident(id: string, input: Partial<IncidentInput>) {
  const { data, error } = await supabase
    .from("incidents")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await logActivity("UPDATE", "incident", data.id, data.title, input);

  return data as Incident;
}

export async function deleteIncident(id: string) {
  // First get the incident name for logging
  const { data: incident } = await supabase
    .from("incidents")
    .select("title")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("incidents").delete().eq("id", id);
  if (error) throw error;

  await logActivity("DELETE", "incident", id, incident?.title);
}

// ===================== INCIDENT IMAGES API =====================

export async function fetchIncidentImages(incidentId: string) {
  const { data, error } = await supabase
    .from("incident_images")
    .select("*")
    .eq("incident_id", incidentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as IncidentImage[];
}

export async function addIncidentImage(
  incidentId: string,
  fileUrl: string,
  fileName?: string,
  fileType?: string
) {
  const { data, error } = await supabase
    .from("incident_images")
    .insert({
      incident_id: incidentId,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
    })
    .select()
    .single();

  if (error) throw error;
  return data as IncidentImage;
}

export async function deleteIncidentImage(id: string) {
  const { error } = await supabase.from("incident_images").delete().eq("id", id);
  if (error) throw error;
}

// ===================== SHELTERS API =====================

export async function fetchShelters(activeOnly = false) {
  let query = supabase.from("shelters").select("*").order("name");

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Shelter[];
}

export async function fetchShelterById(id: string) {
  const { data, error } = await supabase
    .from("shelters")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Shelter | null;
}

export async function createShelter(input: ShelterInput) {
  const { data, error } = await supabase
    .from("shelters")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  await logActivity("CREATE", "shelter", data.id, data.name, { capacity: input.capacity });

  return data as Shelter;
}

export async function updateShelter(id: string, input: Partial<ShelterInput>) {
  const { data, error } = await supabase
    .from("shelters")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await logActivity("UPDATE", "shelter", data.id, data.name, input);

  return data as Shelter;
}

export async function deleteShelter(id: string) {
  const { data: shelter } = await supabase
    .from("shelters")
    .select("name")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("shelters").delete().eq("id", id);
  if (error) throw error;

  await logActivity("DELETE", "shelter", id, shelter?.name);
}

// ===================== RESOURCES API =====================

export async function fetchResources(filters?: { type?: string; status?: string }) {
  let query = supabase.from("resources").select("*").order("name");

  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type as ResourceType);
  }
  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status as ResourceStatus);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Resource[];
}

export async function fetchResourceById(id: string) {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Resource | null;
}

export async function createResource(input: ResourceInput) {
  const { data, error } = await supabase
    .from("resources")
    .insert(input)
    .select()
    .single();
  
  if (error) throw error;

  await logActivity("CREATE", "resource", data.id, data.name, { type: input.type, quantity: input.quantity });

  return data as Resource;
}
// src/services/api.ts

// export async function createResource(resource: ResourceInput) {
//   const { data, error } = await supabase
//     .from('resources')
//     .insert([
//       {
//         name: resource.name,
//         type: resource.type,
//         quantity: resource.quantity,
//         status: resource.status,
//         location: resource.location,
//         // MAKE SURE THESE TWO LINES EXIST:
//         lat: resource.lat, 
//         lng: resource.lng,
//         notes: resource.notes
//       }
//     ])
//     .select()
//     .single();

//   if (error) throw error;

//   return data as Resource;
// }


export async function updateResource(id: string, input: Partial<ResourceInput>) {
  const { data, error } = await supabase
    .from("resources")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  
}

export async function deleteResource(id: string) {
  const { data: resource } = await supabase
    .from("resources")
    .select("name")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw error;

  await logActivity("DELETE", "resource", id, resource?.name);
}

// ===================== ACTIVITY LOG API =====================

export async function fetchActivityLog(limit = 50) {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ActivityLog[];
}

// ===================== DASHBOARD STATS =====================

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Fetch all counts in parallel for efficiency
  const [incidentsRes, sheltersRes, resourcesRes] = await Promise.all([
    supabase.from("incidents").select("id, status, severity"),
    supabase.from("shelters").select("id, is_active"),
    supabase.from("resources").select("id, status"),
  ]);

  const incidents = incidentsRes.data || [];
  const shelters = sheltersRes.data || [];
  const resources = resourcesRes.data || [];

  // Calculate statistics
  const activeStatuses = ["reported", "investigating", "responding"];

  return {
    totalIncidents: incidents.length,
    activeIncidents: incidents.filter((i) => activeStatuses.includes(i.status)).length,
    criticalIncidents: incidents.filter((i) => i.severity === "critical" && activeStatuses.includes(i.status)).length,
    totalShelters: shelters.length,
    activeShelters: shelters.filter((s) => s.is_active).length,
    totalResources: resources.length,
    availableResources: resources.filter((r) => r.status === "available").length,
  };
}

// ===================== SEED DATA =====================
// BEGINNER NOTE: This function populates the database with sample data for testing

export async function seedSampleData() {
  // Sample incidents (Indian Context - Bengaluru Cluster for Map visibility)
  const incidents: IncidentInput[] = [
    {
      title: "Market Fire - Majestic Area",
      description: "Short circuit causing fire in a crowded commercial complex. Narrow lanes impeding fire engine access.",
      type: "fire",
      severity: "critical",
      status: "responding",
      lat: 12.9767,
      lng: 77.5713,
      address: "Kempegowda Majestic Market, Bengaluru",
    },
    {
      title: "Urban Flooding - Silk Board Junction",
      description: "Heavy monsoon rains caused severe waterlogging. Traffic stalled and low-lying slums require evacuation.",
      type: "flood",
      severity: "high",
      status: "investigating",
      lat: 12.9172,
      lng: 77.6228,
      address: "Silk Board Junction, Hosur Road",
    },
    {
      title: "Highway Collision - NICE Road",
      description: "Multi-vehicle collision involving a truck and private bus. Traffic blocked towards Electronic City.",
      type: "accident",
      severity: "medium",
      status: "responding",
      lat: 12.8876,
      lng: 77.5209,
      address: "NICE Ring Road, near Clover Leaf",
    },
    {
      title: "Cyclone Warning - Coastal Impact",
      description: "High velocity winds reported. Trees down in residential blocks. Power infrastructure damaged.",
      type: "storm",
      severity: "low",
      status: "reported",
      lat: 12.9352,
      lng: 77.6245,
      address: "Koramangala 4th Block",
    },
    {
      title: "Medical Emergency - Cricket Stadium",
      description: "Stampede-like situation at gate 4 during match exit. Multiple minor injuries reported.",
      type: "medical",
      severity: "high",
      status: "responding",
      lat: 12.9788,
      lng: 77.5996,
      address: "Chinnaswamy Stadium, MG Road",
    },
  ];

  // Sample shelters (Indian Context - Schools, Community Halls, Convention Centers)
  const shelters: ShelterInput[] = [
    {
      name: "Kendriya Vidyalaya School Hall",
      address: "Malleswaram 18th Cross",
      lat: 13.0068,
      lng: 77.5668,
      capacity: 500,
      current_occupancy: 127,
      contact_info: "+91 80 2344 5678",
      is_active: true,
    },
    {
      name: "BBMP Community Center",
      address: "Jayanagar 4th Block",
      lat: 12.9299,
      lng: 77.5824,
      capacity: 300,
      current_occupancy: 45,
      contact_info: "+91 80 2656 7890",
      is_active: true,
    },
    {
      name: "Palace Grounds Convention Hall",
      address: "Ballari Road, Sadashivanagar",
      lat: 12.9983,
      lng: 77.5920,
      capacity: 2000,
      current_occupancy: 0,
      contact_info: "+91 80 2333 1234",
      is_active: false, // Standby
    },
    {
      name: "St. Joseph's College Auditorium",
      address: "Langford Road, Shantinagar",
      lat: 12.9624,
      lng: 77.5986,
      capacity: 450,
      current_occupancy: 0,
      contact_info: "+91 80 2221 1429",
      is_active: true,
    },
  ];

  // Sample resources (Indian Context - NDRF, 108 Ambulance, Ration Kits)
  const resources: ResourceInput[] = [
    { 
        name: "Fire Tender Unit 1", 
        type: "vehicle", 
        quantity: 1, 
        status: "deployed", 
        location: "High Grounds Fire Station", 
        notes: "Deployed to Majestic Market Fire",
        lat: 12.9765,
        lng: 77.5700
    },
    { 
        name: "Quick Response Team (QRT)", 
        type: "vehicle", 
        quantity: 1, 
        status: "available", 
        location: "Sarjapur Fire Station",
        lat: 12.9141,
        lng: 77.6646
    },
    { 
        name: "108 Ambulance Fleet", 
        type: "vehicle", 
        quantity: 8, 
        status: "available", 
        location: "Victoria Hospital",
        lat: 12.9716,
        lng: 77.5946
    },
    { 
        name: "First Aid & Triage Kits", 
        type: "medical", 
        quantity: 150, 
        status: "available", 
        location: "District Health Office" 
    },
    { 
        name: "Packaged Drinking Water (Bisleri/Kinley)", 
        type: "food", 
        quantity: 5000, 
        status: "available", 
        location: "Indira Canteen Warehouse", 
        notes: "5000L stock ready" 
    },
    { 
        name: "Dry Ration Kits (Rice/Dal)", 
        type: "food", 
        quantity: 2000, 
        status: "available", 
        location: "APMC Yard Storage" 
    },
    { 
        name: "Portable Diesel Generators", 
        type: "equipment", 
        quantity: 25, 
        status: "deployed", 
        location: "Various Shelters", 
        notes: "Providing backup power to shelters" 
    },
    { 
        name: "Tarpaulins & Temporary Sheets", 
        type: "shelter", 
        quantity: 500, 
        status: "available", 
        location: "State Disaster Management Warehouse" 
    },
    { 
        name: "NDRF Team (Battalion 10)", 
        type: "personnel", 
        quantity: 40, 
        status: "deployed", 
        location: "Yelahanka Base", 
        notes: "Specialized flood rescue team",
        lat: 13.0704,
        lng: 77.5960
    },
    { 
        name: "Civil Defence Volunteers", 
        type: "personnel", 
        quantity: 50, 
        status: "available", 
        location: "City Control Room" 
    },
  ];

  // Insert all sample data
  for (const incident of incidents) {
    await createIncident(incident);
  }

  for (const shelter of shelters) {
    await createShelter(shelter);
  }

  for (const resource of resources) {
    await createResource(resource);
  }

  await logActivity("SEED", "system", undefined, "Sample Data", { message: "Database seeded with Indian context data" });

  return { incidents: incidents.length, shelters: shelters.length, resources: resources.length };
}
