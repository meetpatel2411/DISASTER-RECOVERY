/*
  BEGINNER NOTE: This file handles all AI-powered features.
  It calls the disaster-ai edge function for predictions, recommendations, and planning.
  
  UPDATES:
  - Added AI_CACHE to prevent re-fetching the same data repeatedly.
  - Added seededRandom to ensure environmental data (rain, temp) is consistent for a specific location/day.
*/

import { supabase } from "@/integrations/supabase/client";
import type { Incident, Shelter, Resource } from "@/types/database";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface DisasterPrediction {
  type: string;
  probability: number;
  timeframe: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  reasoning: string;
  preventiveMeasures: string[];
}

export interface RiskTimelineDay {
  day: number;
  floodRisk: number;
  fireRisk: number;
  stormRisk: number;
}

export interface PredictionResponse {
  predictions: DisasterPrediction[];
  riskTimeline: RiskTimelineDay[];
}

export interface HazardFactor {
  name: string;
  value: number;
  weight: number;
}

export interface HazardScoreResponse {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  factors: HazardFactor[];
  recommendations: string[];
}

export interface ResourceRecommendation {
  action: string;
  resourceId: string;
  resourceName: string;
  priority: number;
  reasoning: string;
  estimatedImpact: string;
}

export interface ShelterRecommendation {
  shelterId: string;
  shelterName: string;
  reasoning: string;
  estimatedCapacityNeeded: number;
}

export interface PrioritizationResponse {
  recommendations: ResourceRecommendation[];
  shelterRecommendation: ShelterRecommendation;
}

export interface RecoveryTask {
  task: string;
  priority: "critical" | "high" | "medium" | "low";
  resources: string[];
  personnel: number;
  estimatedTime: string;
}

export interface RecoveryPhase {
  phase: number;
  name: string;
  duration: string;
  tasks: RecoveryTask[];
}

export interface RecoveryPlanResponse {
  plan: {
    title: string;
    summary: string;
    estimatedDuration: string;
    phases: RecoveryPhase[];
    resourceSummary: {
      personnel: number;
      vehicles: number;
      medicalSupplies: number;
      shelterCapacity: number;
    };
    keyMilestones: { milestone: string; targetTime: string }[];
  };
}

export interface HeatmapZone {
  lat: number;
  lng: number;
  riskScore: number;
  primaryRisk: string;
  radius: number;
}

export interface HeatmapResponse {
  zones: HeatmapZone[];
}

// ==========================================
// 2. STABILITY UTILITIES (CACHE & SEEDS)
// ==========================================

// Cache to store AI responses so we don't re-fetch on every click
const AI_CACHE = new Map<string, unknown>();

// Helper function to get current season
function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// Seeded random generator: Returns the same number for the same 'seed' string
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

// Generate consistent environmental factors based on location and date
// This replaces generic Math.random() so data doesn't jump around
function getSimulatedEnvironment(lat: number, lng: number) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const seedKey = `${lat.toFixed(2)}-${lng.toFixed(2)}-${today}`;

  return {
    season: getSeason(),
    // These numbers will now be stable for the whole day at this location
    recentRainfall: Math.floor(seededRandom(seedKey + 'rain') * 100), 
    temperature: 15 + Math.floor(seededRandom(seedKey + 'temp') * 20),
    humidity: 40 + Math.floor(seededRandom(seedKey + 'hum') * 50),
    windSpeed: Math.floor(seededRandom(seedKey + 'wind') * 50),
  };
}

// ==========================================
// 3. AI FUNCTIONS
// ==========================================

// Helper to call the AI edge function with Caching
async function callAI<T>(type: string, data: unknown): Promise<T> {
  const cacheKey = `${type}-${JSON.stringify(data)}`;

  if (AI_CACHE.has(cacheKey)) {
    // Return cached result if available
    return AI_CACHE.get(cacheKey) as T;
  }

  const { data: result, error } = await supabase.functions.invoke('disaster-ai', {
    body: { type, data }
  });

  if (error) {
    console.error('AI function error:', error);
    throw new Error(error.message || 'AI request failed');
  }

  if (result.error) {
    throw new Error(result.error);
  }

  // Save result to cache
  AI_CACHE.set(cacheKey, result);
  return result as T;
}

// Predict upcoming disasters based on historical data
export async function predictDisasters(incidents: Incident[]): Promise<PredictionResponse> {
  // Use a fixed reference point for environment (e.g., first incident or default)
  const refLat = incidents[0]?.lat || 12.9716; 
  const refLng = incidents[0]?.lng || 77.5946;

  // Get stable environmental data
  const envFactors = getSimulatedEnvironment(refLat, refLng);

  // Prepare data for AI analysis
  const analysisData = {
    historicalIncidents: incidents.map(i => ({
      type: i.type,
      severity: i.severity,
      date: i.reported_at,
      location: i.address,
      lat: i.lat,
      lng: i.lng,
    })),
    currentDate: new Date().toISOString(),
    environmentalFactors: envFactors,
    // Add context tags for better AI learning
    contextTags: [
        incidents.length > 5 ? "high_incident_volume" : "low_incident_volume",
        envFactors.recentRainfall > 80 ? "heavy_rain_alert" : "normal_weather"
    ]
  };

  return callAI<PredictionResponse>('predict_disasters', analysisData);
}

// Calculate hazard score for a region
export async function calculateHazardScore(
  incidents: Incident[],
  regionCenter: { lat: number; lng: number }
): Promise<HazardScoreResponse> {
  
  // Use seeded environment based on the specific region center
  const localWeather = getSimulatedEnvironment(regionCenter.lat, regionCenter.lng);
  const seedKey = `${regionCenter.lat}-${regionCenter.lng}`;

  const analysisData = {
    historicalIncidents: incidents.filter(i => i.lat && i.lng).map(i => ({
      type: i.type,
      severity: i.severity,
      date: i.reported_at,
      lat: i.lat,
      lng: i.lng,
    })),
    regionCenter,
    // Stable Terrain Factors based on location seed
    terrainFactors: {
      elevation: 50 + seededRandom(seedKey + 'elev') * 200, // meters
      nearWater: seededRandom(seedKey + 'water') > 0.5,
      urbanDensity: seededRandom(seedKey + 'density') * 100,
      forestCoverage: seededRandom(seedKey + 'forest') * 50,
    },
    populationDensity: 1000 + seededRandom(seedKey + 'pop') * 10000, // people per sq km
    recentWeather: {
      rainfall: localWeather.recentRainfall,
      temperature: localWeather.temperature,
    }
  };

  return callAI<HazardScoreResponse>('calculate_hazard_score', analysisData);
}

// Prioritize resources for an incident
export async function prioritizeResources(
  incident: Incident,
  resources: Resource[],
  shelters: Shelter[]
): Promise<PrioritizationResponse> {
  const analysisData = {
    incident: {
      id: incident.id,
      title: incident.title,
      type: incident.type,
      severity: incident.severity,
      status: incident.status,
      description: incident.description,
      location: incident.address,
      lat: incident.lat,
      lng: incident.lng,
    },
    availableResources: resources.filter(r => r.status === 'available').map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      quantity: r.quantity,
      location: r.location,
      lat: r.lat,
      lng: r.lng,
    })),
    availableShelters: shelters.filter(s => s.is_active).map(s => ({
      id: s.id,
      name: s.name,
      capacity: s.capacity,
      currentOccupancy: s.current_occupancy,
      availableSpace: s.capacity - s.current_occupancy,
      location: s.address,
      lat: s.lat,
      lng: s.lng,
    })),
  };

  return callAI<PrioritizationResponse>('prioritize_resources', analysisData);
}

// Generate a recovery plan for an incident
export async function generateRecoveryPlan(
  incident: Incident,
  resources: Resource[],
  shelters: Shelter[]
): Promise<RecoveryPlanResponse> {
  const analysisData = {
    incident: {
      id: incident.id,
      title: incident.title,
      type: incident.type,
      severity: incident.severity,
      status: incident.status,
      description: incident.description,
      location: incident.address,
      lat: incident.lat,
      lng: incident.lng,
      reportedAt: incident.reported_at,
    },
    availableResources: resources.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      quantity: r.quantity,
      status: r.status,
      location: r.location,
    })),
    availableShelters: shelters.map(s => ({
      id: s.id,
      name: s.name,
      capacity: s.capacity,
      currentOccupancy: s.current_occupancy,
      availableSpace: s.capacity - s.current_occupancy,
      isActive: s.is_active,
    })),
  };

  return callAI<RecoveryPlanResponse>('generate_recovery_plan', analysisData);
}

// Generate heatmap risk data based on incidents
export async function generateHeatmapData(incidents: Incident[]): Promise<HeatmapResponse> {
  const analysisData = {
    incidents: incidents.filter(i => i.lat && i.lng).map(i => ({
      type: i.type,
      severity: i.severity,
      date: i.reported_at,
      lat: i.lat,
      lng: i.lng,
    })),
  };

  return callAI<HeatmapResponse>('generate_heatmap_data', analysisData);
}

// ==========================================
// 4. DEMO FALLBACKS
// ==========================================

// Demo mode fallback data (used when AI is unavailable)
export function getDemoPredictions(): PredictionResponse {
  return {
    predictions: [
      {
        type: "flood",
        probability: 65,
        timeframe: "24-48 hours",
        location: "River District",
        severity: "high",
        reasoning: "Based on recent rainfall patterns and historical flood data",
        preventiveMeasures: ["Pre-position sandbags", "Alert low-lying areas", "Ready evacuation routes"],
      },
      {
        type: "storm",
        probability: 45,
        timeframe: "3-5 days",
        location: "Coastal Area",
        severity: "medium",
        reasoning: "Weather pattern analysis indicates incoming storm system",
        preventiveMeasures: ["Secure outdoor equipment", "Check emergency supplies", "Review shelter capacity"],
      },
    ],
    riskTimeline: [
      { day: 1, floodRisk: 20, fireRisk: 10, stormRisk: 15 },
      { day: 2, floodRisk: 45, fireRisk: 12, stormRisk: 20 },
      { day: 3, floodRisk: 65, fireRisk: 15, stormRisk: 35 },
      { day: 4, floodRisk: 50, fireRisk: 18, stormRisk: 55 },
      { day: 5, floodRisk: 30, fireRisk: 20, stormRisk: 70 },
      { day: 6, floodRisk: 20, fireRisk: 22, stormRisk: 45 },
      { day: 7, floodRisk: 15, fireRisk: 25, stormRisk: 25 },
    ],
  };
}

export function getDemoHazardScore(): HazardScoreResponse {
  return {
    score: 68,
    level: "high",
    factors: [
      { name: "Historical Frequency", value: 75, weight: 0.3 },
      { name: "Terrain Risk", value: 60, weight: 0.2 },
      { name: "Weather Patterns", value: 70, weight: 0.25 },
      { name: "Population Density", value: 65, weight: 0.15 },
      { name: "Infrastructure Vulnerability", value: 55, weight: 0.1 },
    ],
    recommendations: [
      "Increase flood monitoring in low-lying areas",
      "Update evacuation routes for high-density zones",
      "Pre-position emergency supplies near risk zones",
    ],
  };
}