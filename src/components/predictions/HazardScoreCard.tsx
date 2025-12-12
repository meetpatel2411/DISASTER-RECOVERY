/*
  BEGINNER NOTE: This component displays the Multi-Factor Hazard Score (MHS)
  with a visual breakdown of contributing factors.
*/

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import type { HazardScoreResponse } from "@/services/aiService";

interface HazardScoreCardProps {
  hazardScore: HazardScoreResponse | null;
}

export function HazardScoreCard({ hazardScore }: HazardScoreCardProps) {
  if (!hazardScore) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            No hazard data available. Click "Calculate Hazard" to analyze regional risk.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-success text-success-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "high":
        return "bg-orange-500 text-white";
      case "critical":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="h-6 w-6 text-success" />;
      case "medium":
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      case "high":
        return <AlertCircle className="h-6 w-6 text-orange-500" />;
      case "critical":
        return <XCircle className="h-6 w-6 text-destructive" />;
      default:
        return null;
    }
  };

  const getProgressColor = (value: number) => {
    if (value < 30) return "bg-success";
    if (value < 60) return "bg-warning";
    if (value < 80) return "bg-orange-500";
    return "bg-destructive";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Main Score Card */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Multi-Factor Hazard Score
          </CardTitle>
          <CardDescription>
            Regional risk assessment based on multiple factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            {/* Score Circle */}
            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-muted/30"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${(hazardScore.score / 100) * 440} 440`}
                  className={`${
                    hazardScore.score < 30
                      ? "text-success"
                      : hazardScore.score < 60
                      ? "text-warning"
                      : hazardScore.score < 80
                      ? "text-orange-500"
                      : "text-destructive"
                  } transition-all duration-500`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold">{hazardScore.score}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>

            {/* Level Badge */}
            <div className="mt-4 flex items-center gap-2">
              {getLevelIcon(hazardScore.level)}
              <Badge className={getLevelColor(hazardScore.level)} variant="secondary">
                {hazardScore.level.toUpperCase()} RISK
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factors Breakdown */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Risk Factors Breakdown</CardTitle>
          <CardDescription>
            Contributing factors to the overall hazard score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hazardScore.factors.map((factor, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{factor.name}</span>
                <span className="text-muted-foreground">
                  {factor.value}% (weight: {(factor.weight * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getProgressColor(factor.value)}`}
                  style={{ width: `${factor.value}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>
            Suggested actions based on the hazard analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {hazardScore.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
