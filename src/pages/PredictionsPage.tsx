/*
  BEGINNER NOTE: This page shows AI-powered disaster predictions including:
  - Upcoming disaster forecasts
  - 7-day risk timeline chart
  - Multi-Factor Hazard Score
  - Geo-risk analysis
*/

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Brain, TrendingUp, MapPin, RefreshCw, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchIncidents } from "@/services/api";
import {
  predictDisasters,
  calculateHazardScore,
  getDemoPredictions,
  getDemoHazardScore,
  type PredictionResponse,
  type HazardScoreResponse,
} from "@/services/aiService";
import { RiskTimelineChart } from "@/components/predictions/RiskTimelineChart";
import { HazardScoreCard } from "@/components/predictions/HazardScoreCard";
import { PredictionCard } from "@/components/predictions/PredictionCard";

export default function PredictionsPage() {
  const [isAILoading, setIsAILoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [hazardScore, setHazardScore] = useState<HazardScoreResponse | null>(null);
  const [useDemo, setUseDemo] = useState(false);

  // Fetch incidents for analysis
  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => fetchIncidents(),
  });

  // Generate AI predictions
  const handleGeneratePredictions = async () => {
    setIsAILoading(true);
    try {
      const result = await predictDisasters(incidents);
      setPredictions(result);
      setUseDemo(false);
      toast({
        title: "Predictions generated",
        description: "AI analysis complete based on current incident data.",
      });
    } catch (error) {
      console.error("AI prediction error:", error);
      // Fall back to demo data
      setPredictions(getDemoPredictions());
      setUseDemo(false);
      toast({
        title: "Using demo predictions",
        description: "AI unavailable. Showing sample prediction data.",
        variant: "default",
      });
    } finally {
      setIsAILoading(false);
    }
  };

  // Calculate hazard score
  const handleCalculateHazard = async () => {
    setIsAILoading(true);
    try {
      // Use center of incident data or default coordinates
      const avgLat = incidents.reduce((sum, i) => sum + (i.lat || 40.7128), 0) / Math.max(incidents.length, 1);
      const avgLng = incidents.reduce((sum, i) => sum + (i.lng || -74.006), 0) / Math.max(incidents.length, 1);
      
      const result = await calculateHazardScore(incidents, { lat: avgLat, lng: avgLng });
      setHazardScore(result);
      setUseDemo(false);
      toast({
        title: "Hazard score calculated",
        description: "Regional risk assessment complete.",
      });
    } catch (error) {
      console.error("Hazard calculation error:", error);
      setHazardScore(getDemoHazardScore());
      setUseDemo(false);
      toast({
        title: "Using demo hazard data",
        description: "AI unavailable. Showing sample hazard score.",
        variant: "default",
      });
    } finally {
      setIsAILoading(false);
    }
  };

  // Load demo data on first visit
  const handleLoadDemo = () => {
    setPredictions(getDemoPredictions());
    setHazardScore(getDemoHazardScore());
    setUseDemo(false);
  };

  return (
    <MainLayout>
      <Header onRefresh={() => {}} isLoading={isAILoading} />

      <div className="p-4 md:p-6 space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Brain className="h-7 w-7 md:h-8 md:w-8 text-primary" />
              AI Predictions
              <Badge variant="secondary" className="ml-2">Demo</Badge>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              AI-powered disaster forecasting and risk analysis
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleGeneratePredictions}
              disabled={isAILoading}
              className="flex-1 md:flex-none"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isAILoading ? 'animate-spin' : ''}`} />
              Generate Predictions
            </Button>
            <Button
              onClick={handleCalculateHazard}
              variant="outline"
              disabled={isAILoading}
              className="flex-1 md:flex-none"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Calculate Hazard
            </Button>
            
          </div>
        </div>

        {/* Demo Mode Notice */}
        {/* {useDemo && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center gap-3 py-3">
              <Info className="h-5 w-5 text-primary" />
              <p className="text-sm">
                <strong>Demo Mode:</strong> Showing sample prediction data. Click "Generate Predictions" with incident data to get AI-powered analysis.
              </p>
            </CardContent>
          </Card>
        )} */}

        {/* Main Content Tabs */}
        <Tabs defaultValue="predictions" className="space-y-4">
          <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex">
            <TabsTrigger value="predictions" className="gap-2">
              <AlertTriangle className="h-4 w-4 hidden sm:block" />
              Forecasts
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <TrendingUp className="h-4 w-4 hidden sm:block" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="hazard" className="gap-2">
              <MapPin className="h-4 w-4 hidden sm:block" />
              Hazard Score
            </TabsTrigger>
          </TabsList>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            {predictions?.predictions && predictions.predictions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {predictions.predictions.map((prediction, index) => (
                  <PredictionCard key={index} prediction={prediction} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No predictions yet. Click "Generate Predictions" to analyze incident data.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <RiskTimelineChart timeline={predictions?.riskTimeline || []} />
          </TabsContent>

          {/* Hazard Score Tab */}
          <TabsContent value="hazard">
            <HazardScoreCard hazardScore={hazardScore} />
          </TabsContent>
        </Tabs>

        {/* Footer Note */}
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> This prediction system uses AI analysis for demonstration purposes. 
              Actual disaster predictions should rely on official meteorological and geological services. 
              Always follow official emergency guidance.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
