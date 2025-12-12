/*
  BEGINNER NOTE: This component displays a single disaster prediction
  with probability, severity, and preventive measures.
*/

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Droplets,
  Flame,
  CloudRain,
  Mountain,
  Car,
  Stethoscope,
  HelpCircle,
  Clock,
  MapPin,
  Shield,
} from "lucide-react";
import type { DisasterPrediction } from "@/services/aiService";

interface PredictionCardProps {
  prediction: DisasterPrediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flood":
        return <Droplets className="h-5 w-5" />;
      case "fire":
        return <Flame className="h-5 w-5" />;
      case "storm":
        return <CloudRain className="h-5 w-5" />;
      case "earthquake":
        return <Mountain className="h-5 w-5" />;
      case "accident":
        return <Car className="h-5 w-5" />;
      case "medical":
        return <Stethoscope className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-success/10 text-success border-success/30";
      case "medium":
        return "bg-warning/10 text-warning border-warning/30";
      case "high":
        return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability < 30) return "bg-success";
    if (probability < 60) return "bg-warning";
    if (probability < 80) return "bg-orange-500";
    return "bg-destructive";
  };

  return (
    <Card className={`border-l-4 ${getSeverityColor(prediction.severity)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getSeverityColor(prediction.severity)}`}>
              {getTypeIcon(prediction.type)}
            </div>
            <div>
              <CardTitle className="text-lg capitalize">{prediction.type} Risk</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <MapPin className="h-3 w-3" />
                {prediction.location}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={getSeverityColor(prediction.severity)}>
            {prediction.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Probability */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Probability</span>
            <span className="font-medium">{prediction.probability}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProbabilityColor(prediction.probability)}`}
              style={{ width: `${prediction.probability}%` }}
            />
          </div>
        </div>

        {/* Timeframe */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Expected:</span>
          <span className="font-medium">{prediction.timeframe}</span>
        </div>

        {/* Reasoning */}
        <div className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
          {prediction.reasoning}
        </div>

        {/* Preventive Measures */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <Shield className="h-4 w-4 text-primary" />
            Preventive Measures
          </div>
          <ul className="space-y-1 ml-6">
            {prediction.preventiveMeasures.map((measure, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {measure}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
