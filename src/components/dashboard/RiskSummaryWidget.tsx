/*
  BEGINNER NOTE: This widget shows a quick summary of predicted risks
  based on incident history. Shows top risks with probabilities.
*/

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Loader2, AlertTriangle } from "lucide-react";
import { getDemoPredictions, type DisasterPrediction } from "@/services/aiService";
import type { Incident } from "@/types/database";

interface RiskSummaryWidgetProps {
  incidents: Incident[];
}

export function RiskSummaryWidget({ incidents }: RiskSummaryWidgetProps) {
  const [predictions, setPredictions] = useState<DisasterPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load demo predictions on mount
    const timer = setTimeout(() => {
      const demo = getDemoPredictions();
      setPredictions(demo.predictions.slice(0, 2));
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-success/10 text-success";
      case "medium":
        return "bg-warning/10 text-warning";
      case "high":
        return "bg-orange-500/10 text-orange-500";
      case "critical":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Risk Forecast
          </span>
          <Badge variant="secondary" className="text-xs">Demo</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : predictions.length > 0 ? (
          <>
            {predictions.map((pred, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium capitalize">{pred.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{pred.probability}%</span>
                  <Badge variant="outline" className={getSeverityColor(pred.severity)}>
                    {pred.severity}
                  </Badge>
                </div>
              </div>
            ))}
            <Link to="/predictions">
              <Button variant="link" className="w-full h-auto p-0 text-primary">
                <Brain className="h-3 w-3 mr-1" />
                View Full Predictions
              </Button>
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No risk data available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
