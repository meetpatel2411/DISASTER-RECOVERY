/*
  BEGINNER NOTE: This is the main navigation sidebar component.
  It uses React Router's NavLink for navigation between pages.
  Hidden on mobile (< lg), shown on large screens.
*/

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
} from "lucide-react";

// Navigation items configuration - includes AI Predictions with badge
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

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border hidden lg:block">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
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

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-success/80 mx-2 px-2 py-0.5 text-xs font-medium text-sidebar-foreground">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Security Notice */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-destructive/10 p-3">
          <p className="text-xs font-medium text-destructive">⚠️ Demo Mode</p>
          <p className="mt-1 text-xs text-sidebar-foreground/60">
            No authentication. For local/demo use only.
          </p>
        </div>
      </div>
    </aside>
  );
}
