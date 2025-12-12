import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    const { type, data } = await req.json();
    console.log(`Processing AI request: ${type}`);

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'predict_disasters':
        systemPrompt = `You are a disaster prediction AI assistant. Analyze the provided historical incident data and environmental factors to predict potential upcoming disasters. Return JSON with this structure:
{
  "predictions": [
    {
      "type": "flood|fire|earthquake|storm|accident|medical|other",
      "probability": 0-100,
      "timeframe": "string (e.g., '24-48 hours')",
      "location": "string",
      "severity": "low|medium|high|critical",
      "reasoning": "string",
      "preventiveMeasures": ["string"]
    }
  ],
  "riskTimeline": [
    { "day": 1, "floodRisk": 0-100, "fireRisk": 0-100, "stormRisk": 0-100 }
  ]
}`;
        userPrompt = `Analyze this disaster data and predict upcoming risks for the next 7 days:\n${JSON.stringify(data)}`;
        break;

      case 'calculate_hazard_score':
        systemPrompt = `You are a hazard assessment AI. Calculate a Multi-Factor Hazard Score (0-100) for the given region based on historical data, terrain, weather patterns, and population density. Return JSON:
{
  "score": 0-100,
  "level": "low|medium|high|critical",
  "factors": [
    { "name": "string", "value": 0-100, "weight": 0-1 }
  ],
  "recommendations": ["string"]
}`;
        userPrompt = `Calculate hazard score for this region:\n${JSON.stringify(data)}`;
        break;

      case 'prioritize_resources':
        systemPrompt = `You are a disaster response optimization AI. Analyze the incident, available resources, and shelters to recommend the optimal resource allocation. Return JSON:
{
  "recommendations": [
    {
      "action": "string",
      "resourceId": "string",
      "resourceName": "string",
      "priority": 1-10,
      "reasoning": "string",
      "estimatedImpact": "string"
    }
  ],
  "shelterRecommendation": {
    "shelterId": "string",
    "shelterName": "string",
    "reasoning": "string",
    "estimatedCapacityNeeded": 0
  }
}`;
        userPrompt = `Prioritize resources for this incident:\n${JSON.stringify(data)}`;
        break;

      case 'generate_recovery_plan':
        systemPrompt = `You are a disaster recovery planning AI. Generate a comprehensive, prioritized recovery plan for the given incident. Return JSON:
{
  "plan": {
    "title": "string",
    "summary": "string",
    "estimatedDuration": "string",
    "phases": [
      {
        "phase": 1,
        "name": "string",
        "duration": "string",
        "tasks": [
          {
            "task": "string",
            "priority": "critical|high|medium|low",
            "resources": ["string"],
            "personnel": 0,
            "estimatedTime": "string"
          }
        ]
      }
    ],
    "resourceSummary": {
      "personnel": 0,
      "vehicles": 0,
      "medicalSupplies": 0,
      "shelterCapacity": 0
    },
    "keyMilestones": [
      { "milestone": "string", "targetTime": "string" }
    ]
  }
}`;
        userPrompt = `Generate a recovery plan for this incident:\n${JSON.stringify(data)}`;
        break;

      case 'generate_heatmap_data':
        systemPrompt = `You are a geo-risk analysis AI. Generate heatmap risk data for the given region based on historical incidents. Return JSON:
{
  "zones": [
    {
      "lat": number,
      "lng": number,
      "riskScore": 0-100,
      "primaryRisk": "flood|fire|earthquake|storm|accident|medical|other",
      "radius": number (meters)
    }
  ]
}`;
        userPrompt = `Generate risk heatmap data based on this incident history:\n${JSON.stringify(data)}`;
        break;

      default:
        throw new Error(`Unknown AI request type: ${type}`);
    }

    // Call Lovable AI Gateway
   

    

  } catch (error) {
    console.error('Error in disaster-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
