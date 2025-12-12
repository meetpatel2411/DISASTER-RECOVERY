import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Dashboard from "./pages/Dashboard";
import IncidentsPage from "./pages/IncidentsPage";
import IncidentForm from "./pages/IncidentForm";
import IncidentDetails from "./pages/IncidentDetails";
import SheltersPage from "./pages/SheltersPage";
import ResourcesPage from "./pages/ResourcesPage";
import MapPage from "./pages/MapPage";
import PredictionsPage from "./pages/PredictionsPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/incidents/new" element={<IncidentForm />} />
          <Route path="/incidents/:id" element={<IncidentDetails />} />
          <Route path="/incidents/:id/edit" element={<IncidentForm />} />
          <Route path="/shelters" element={<SheltersPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
          <Route path="/activity" element={<ActivityLogPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
