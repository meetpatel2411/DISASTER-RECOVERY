/*
  BEGINNER NOTE: This dialog displays AI-generated recovery plans
  with phases, tasks, and resource requirements.
*/

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Loader2,
  Clock,
  Users,
  Truck,
  HeartPulse,
  Home,
  CheckCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateRecoveryPlan, type RecoveryPlanResponse } from "@/services/aiService";
import type { Incident, Resource, Shelter } from "@/types/database";

interface RecoveryPlanDialogProps {
  incident: Incident;
  resources: Resource[];
  shelters: Shelter[];
}

export function RecoveryPlanDialog({ incident, resources, shelters }: RecoveryPlanDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<RecoveryPlanResponse | null>(null);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const result = await generateRecoveryPlan(incident, resources, shelters);
      setPlan(result);
      toast({
        title: "Recovery plan generated",
        description: "AI has created a comprehensive recovery plan.",
      });
    } catch (error) {
      console.error("Plan generation error:", error);
      toast({
        title: "Error generating plan",
        description: error instanceof Error ? error.message : "Failed to generate recovery plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // Create a simple text-based export (could be enhanced with a PDF library)
    if (!plan) return;

    const content = `
RECOVERY PLAN: ${plan.plan.title}
Generated: ${new Date().toLocaleString()}

SUMMARY
${plan.plan.summary}

ESTIMATED DURATION: ${plan.plan.estimatedDuration}

RESOURCE SUMMARY
- Personnel Required: ${plan.plan.resourceSummary.personnel}
- Vehicles Required: ${plan.plan.resourceSummary.vehicles}
- Medical Supplies: ${plan.plan.resourceSummary.medicalSupplies}
- Shelter Capacity: ${plan.plan.resourceSummary.shelterCapacity}

PHASES
${plan.plan.phases.map(phase => `
Phase ${phase.phase}: ${phase.name} (${phase.duration})
${phase.tasks.map(task => `  • [${task.priority.toUpperCase()}] ${task.task}
    Resources: ${task.resources.join(', ')}
    Personnel: ${task.personnel}
    Time: ${task.estimatedTime}`).join('\n')}
`).join('\n')}

KEY MILESTONES
${plan.plan.keyMilestones.map(m => `• ${m.milestone} - Target: ${m.targetTime}`).join('\n')}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recovery-plan-${incident.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Plan exported",
      description: "Recovery plan has been downloaded.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Recovery Plan</span>
          <Badge variant="secondary" className="ml-1">AI</Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI Recovery Plan Generator
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive, AI-powered recovery plan for this incident
          </DialogDescription>
        </DialogHeader>

        {!plan ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-6">
              Click the button below to generate an AI-powered recovery plan
            </p>
            <Button onClick={handleGeneratePlan} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Recovery Plan
                </>
              )}
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Plan Header */}
              <Card>
                <CardHeader>
                  <CardTitle>{plan.plan.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.plan.summary}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Duration: {plan.plan.estimatedDuration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resource Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{plan.plan.resourceSummary.personnel}</p>
                        <p className="text-xs text-muted-foreground">Personnel</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <Truck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{plan.plan.resourceSummary.vehicles}</p>
                        <p className="text-xs text-muted-foreground">Vehicles</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <HeartPulse className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{plan.plan.resourceSummary.medicalSupplies}</p>
                        <p className="text-xs text-muted-foreground">Medical Kits</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <Home className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{plan.plan.resourceSummary.shelterCapacity}</p>
                        <p className="text-xs text-muted-foreground">Shelter Spots</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phases */}
              {plan.plan.phases.map((phase) => (
                <Card key={phase.phase}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Phase {phase.phase}: {phase.name}
                      </CardTitle>
                      <Badge variant="outline">{phase.duration}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {phase.tasks.map((task, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                      >
                        <Badge className={getPriorityColor(task.priority)} variant="secondary">
                          {task.priority}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{task.task}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {task.personnel} personnel
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.estimatedTime}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Resources: {task.resources.join(", ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {plan.plan.keyMilestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{milestone.milestone}</p>
                          <p className="text-xs text-muted-foreground">
                            Target: {milestone.targetTime}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export Button */}
              <div className="flex justify-end gap-2">
                <Button onClick={handleGeneratePlan} variant="outline" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Regenerate
                </Button>
                <Button onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Plan
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
