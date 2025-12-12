/*
  BEGINNER NOTE: Settings page for admin configuration.
  Since there's no authentication, this is just a demo placeholder.
*/

import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Download, Database, Bell, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const handleExportCSV = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly.",
    });
    // In a real app, this would trigger a backend export
  };

  const handleBackupDB = () => {
    toast({
      title: "Backup Initiated",
      description: "Database backup is being created.",
    });
  };

  return (
    <MainLayout>
      <Header />

      <div className="p-6 space-y-6 max-w-4xl animate-fade-in">
        {/* Security Warning */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Security Notice
            </CardTitle>
            <CardDescription className="text-destructive/80">
              This demo runs without authentication for presentation purposes only.
              It is insecure for production use. If converting to production, implement
              authentication and role-based access control (RBAC).
            </CardDescription>
          </CardHeader>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure general application settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                defaultValue="Emergency Response Team"
                placeholder="Your organization name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                defaultValue="admin@emergency.local"
                placeholder="admin@example.com"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-refresh Dashboard</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically refresh data every 30 seconds
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Map Markers</Label>
                <p className="text-sm text-muted-foreground">
                  Display all markers on the map by default
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure alert and notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Critical Incident Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified for critical severity incidents
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Shelter Capacity Warnings</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when shelter capacity exceeds 80%
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Resource Depletion Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when resources are running low
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export data and manage backups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export Incidents (CSV)
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export Shelters (CSV)
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export Resources (CSV)
              </Button>
            </div>

            <Separator />

            <div>
              <Button variant="secondary" onClick={handleBackupDB}>
                <Database className="mr-2 h-4 w-4" />
                Create Database Backup
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Last backup: Never (demo mode)
              </p>
            </div>
          </CardContent>
        </Card>

        
       {/* About */}
<Card>
  <CardHeader>
    <CardTitle>About</CardTitle>
  </CardHeader>

  <CardContent className="space-y-2 text-sm text-muted-foreground">
    <p><strong>Version:</strong> 1.0.0 (Development Build)</p>

    <p>
      <strong>Stack:</strong> React + TypeScript + Vite + Tailwind + ShadCN/UI
    </p>

    <p>
      <strong>Backend:</strong> Node.js (API) + PostgreSQL (Planned Integration)
    </p>

    <p>
      <strong>Purpose:</strong> A modern, UI-focused disaster management system
      built for learning, demos, and real-world workflow planning.
    </p>

    <p className="pt-2">
      This project is designed to showcase disaster operations UI/UX, with
      scalable architecture ready for future backend expansion.
    </p>
  </CardContent>
</Card>

      </div>
    </MainLayout>
  );
}
