/*
  BEGINNER NOTE: This component shows AI-recommended resource prioritization
  for incident response, with apply recommendation functionality.
*/

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Home, Check, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  prioritizeResources,
  type PrioritizationResponse,
} from "@/services/aiService";
import { updateResource, updateShelter } from "@/services/api";
import type { Incident, Resource, Shelter } from "@/types/database";

interface ResourcePrioritizationProps {
  incident: Incident;
  resources: Resource[];
  shelters: Shelter[];
  onUpdate: () => void;
}

export function ResourcePrioritization({
  incident,
  resources,
  shelters,
  onUpdate,
}: ResourcePrioritizationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [recommendations, setRecommendations] = useState<PrioritizationResponse | null>(null);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      const result = await prioritizeResources(incident, resources, shelters);
      setRecommendations(result);
      toast({
        title: "Recommendations ready",
        description: "AI has prioritized resources for this incident.",
      });
    } catch (error) {
      console.error("Prioritization error:", error);
      toast({
        title: "Error getting recommendations",
        description: error instanceof Error ? error.message : "Failed to prioritize resources",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRecommendations = async () => {
    if (!recommendations) return;

    setIsApplying(true);
    try {
      // Deploy recommended resources
      for (const rec of recommendations.recommendations.slice(0, 3)) {
        const resource = resources.find(r => r.id === rec.resourceId || r.name === rec.resourceName);
        if (resource && resource.status === 'available') {
          await updateResource(resource.id, {
            status: 'deployed',
            notes: `Deployed to: ${incident.title}`
          });
        }
      }

      toast({
        title: "Recommendations applied",
        description: "Resources have been deployed based on AI recommendations.",
      });
      onUpdate();
    } catch (error) {
      console.error("Apply recommendations error:", error);
      toast({
        title: "Error applying recommendations",
        description: error instanceof Error ? error.message : "Failed to apply recommendations",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority <= 3) return <Badge className="bg-destructive">Priority {priority}</Badge>;
    if (priority <= 6) return <Badge className="bg-warning text-warning-foreground">Priority {priority}</Badge>;
    return <Badge variant="outline">Priority {priority}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Resource Prioritization
              <Badge variant="secondary">AI</Badge>
            </CardTitle>
            <CardDescription>
              AI-recommended resource allocation for this incident
            </CardDescription>
          </div>
          {!recommendations && (
            <Button onClick={handleGetRecommendations} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!recommendations ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Zap className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Click "Get Recommendations" to analyze available resources and get AI-powered prioritization.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resource Recommendations */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Recommended Actions
              </h4>
              {recommendations.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  {getPriorityBadge(rec.priority)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{rec.action}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Resource: {rec.resourceName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rec.reasoning}
                    </p>
                    <p className="text-xs text-primary mt-1">
                      Impact: {rec.estimatedImpact}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shelter Recommendation */}
            {recommendations.shelterRecommendation && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  Recommended Shelter
                </h4>
                <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                  <p className="font-medium">{recommendations.shelterRecommendation.shelterName}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {recommendations.shelterRecommendation.reasoning}
                  </p>
                  <p className="text-sm mt-2">
                    <span className="text-muted-foreground">Estimated capacity needed: </span>
                    <span className="font-medium">
                      {recommendations.shelterRecommendation.estimatedCapacityNeeded} people
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleGetRecommendations} disabled={isLoading}>
                Refresh
              </Button>
              <Button onClick={handleApplyRecommendations} disabled={isApplying}>
                {isApplying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Apply Recommendations
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
