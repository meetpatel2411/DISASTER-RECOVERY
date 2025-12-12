import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  AlertTriangle,
  Home,
  Package,
  Map,
  Activity,
  Settings,
  Shield,
  Brain,
  Menu,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Navigation items configuration
const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/incidents", icon: AlertTriangle, label: "Incidents" },
  { to: "/shelters", icon: Home, label: "Shelters" },
  { to: "/resources", icon: Package, label: "Resources" },
  { to: "/map", icon: Map, label: "Map View" },
  { to: "/predictions", icon: Brain, label: "Predictions", badge: "AI" },
  { to: "/activity", icon: Activity, label: "Activity Log" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* TRIGGER BUTTON 
        - variant="outline": Gives it a border so it doesn't blend into the background.
        - bg-background: Ensures it's not transparent.
      */}
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="lg:hidden shrink-0 shadow-sm border-gray-200 bg-background"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>

      {/* SIDEBAR CONTENT */}
      <SheetContent side="left" className="flex w-72 flex-col p-0 bg-sidebar text-sidebar-foreground border-r-sidebar-border">
        {/* Screen Reader Title (Accessibility Requirement) */}
        <SheetHeader className="sr-only">
          <SheetTitle>Mobile Navigation Menu</SheetTitle>
        </SheetHeader>

        {/* 1. Header / Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-sidebar-foreground">
                DisasterOps
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Recovery System</p>
            </div>
          </div>
          
          {/* Close Button */}
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground/70">
              <X className="h-5 w-5" />
            </Button>
          </SheetClose>
        </div>

        {/* 2. Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col gap-1 px-4">
            {navItems.map((item) => (
              <SheetClose key={item.to} asChild>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors touch-manipulation",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )
                  }
                >
                  {/* Wrapper div with flex */}
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span className="">{item.label}</span>

                    {item.badge && (
                      <span className="rounded-full bg-success/80 mx-2 px-2 py-0.5 text-xs font-medium text-sidebar-foreground">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </NavLink>
              </SheetClose>
            ))}
          </nav>
        </div>

        {/* 3. Footer / Security Notice */}
        <div className="border-t border-sidebar-border p-4 mt-auto">
          <div className="rounded-lg bg-destructive/10 p-3">
            <p className="text-xs font-medium text-destructive">⚠️ Demo Mode</p>
            <p className="mt-1 text-xs text-sidebar-foreground/60">
              No authentication. Mobile View.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}