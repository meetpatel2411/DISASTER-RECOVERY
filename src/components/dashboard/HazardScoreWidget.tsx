/*
  BEGINNER NOTE: This widget displays the Multi-Factor Hazard Score (MHS)
  as a compact dashboard widget with visual indicator.
*/

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Brain, Loader2 } from "lucide-react";
import { getDemoHazardScore, type HazardScoreResponse } from "@/services/aiService";
import type { Incident } from "@/types/database";

interface HazardScoreWidgetProps {
  incidents: Incident[];
}

export function HazardScoreWidget({ incidents }: HazardScoreWidgetProps) {
  const [hazardScore, setHazardScore] = useState<HazardScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load demo hazard score on mount
    const timer = setTimeout(() => {
      setHazardScore(getDemoHazardScore());
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-success bg-success/10";
      case "medium":
        return "text-warning bg-warning/10";
      case "high":
        return "text-orange-500 bg-orange-500/10";
      case "critical":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return "stroke-success";
    if (score < 60) return "stroke-warning";
    if (score < 80) return "stroke-orange-500";
    return "stroke-destructive";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Hazard Score
          </span>
          <Badge variant="secondary" className="text-xs">MHS</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : hazardScore ? (
          <div className="flex items-center gap-4">
            {/* Score Circle */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="transparent"
                  strokeWidth="6"
                  className="stroke-muted"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="transparent"
                  strokeWidth="6"
                  strokeDasharray={`${(hazardScore.score / 100) * 220} 220`}
                  className={`${getScoreColor(hazardScore.score)} transition-all duration-500`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold">{hazardScore.score}</span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <Badge className={`${getLevelColor(hazardScore.level)} mb-2`}>
                {hazardScore.level.toUpperCase()} RISK
              </Badge>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {hazardScore.recommendations[0]}
              </p>
              <Link to="/predictions">
                <Button variant="link" className="h-auto p-0 text-xs text-primary mt-1">
                  <Brain className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hazard data available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
