/*
  BEGINNER NOTE: The header component shows the current page title
  and provides quick actions like refresh and seed data.
  Now includes mobile menu toggle.
*/

import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./MobileSidebar";

// Map routes to page titles
const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/incidents": "Incidents",
  "/shelters": "Shelters",
  "/resources": "Resources",
  "/map": "Map View",
  "/predictions": "AI Predictions",
  "/activity": "Activity Log",
  "/settings": "Settings",
};

interface HeaderProps {
  onRefresh?: () => void;
  onSeedData?: () => void;
  isLoading?: boolean;
}

export function Header({ onRefresh, onSeedData, isLoading }: HeaderProps) {
  const location = useLocation();
  const basePath = "/" + (location.pathname.split("/")[1] || "");
  const title = pageTitles[basePath] || pageTitles[location.pathname] || "Page";

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-border bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <MobileSidebar />
        
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
            Disaster Recovery Management System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onSeedData && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSeedData}
            disabled={isLoading}
            className="hidden sm:flex"
          >
            <Database className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Demo Data</span>
          </Button>
        )}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4", isLoading && "animate-spin")}
            />
            <span className="hidden md:inline ml-2">Refresh</span>
          </Button>
        )}
      </div>
    </header>
  );
}
