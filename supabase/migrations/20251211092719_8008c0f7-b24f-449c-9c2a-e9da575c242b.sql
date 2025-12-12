-- BEGINNER NOTE: This creates all tables for the Disaster Recovery System
-- No authentication required - all data is publicly accessible for demo purposes

-- Create enum types for categorization
CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE incident_status AS ENUM ('reported', 'investigating', 'responding', 'resolved', 'closed');
CREATE TYPE incident_type AS ENUM ('flood', 'fire', 'earthquake', 'storm', 'accident', 'medical', 'other');
CREATE TYPE resource_status AS ENUM ('available', 'deployed', 'maintenance', 'unavailable');
CREATE TYPE resource_type AS ENUM ('vehicle', 'medical', 'food', 'shelter', 'equipment', 'personnel', 'other');

-- Incidents table: stores disaster/emergency incidents
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type incident_type NOT NULL DEFAULT 'other',
  severity incident_severity NOT NULL DEFAULT 'medium',
  status incident_status NOT NULL DEFAULT 'reported',
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  address TEXT,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Incident images: stores images/documents for incidents
CREATE TABLE public.incident_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shelters table: emergency shelter locations
CREATE TABLE public.shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  capacity INTEGER NOT NULL DEFAULT 0,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  contact_info TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resources table: emergency resources inventory
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type resource_type NOT NULL DEFAULT 'other',
  quantity INTEGER NOT NULL DEFAULT 0,
  status resource_status NOT NULL DEFAULT 'available',
  location TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity log: tracks all CRUD operations for audit
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  resource_name TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
-- SECURITY NOTE: These policies allow public access for demo purposes only
-- In production, implement proper authentication and restrict access

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for demo (INSECURE - demo only!)
CREATE POLICY "Public read incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Public insert incidents" ON public.incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update incidents" ON public.incidents FOR UPDATE USING (true);
CREATE POLICY "Public delete incidents" ON public.incidents FOR DELETE USING (true);

CREATE POLICY "Public read incident_images" ON public.incident_images FOR SELECT USING (true);
CREATE POLICY "Public insert incident_images" ON public.incident_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete incident_images" ON public.incident_images FOR DELETE USING (true);

CREATE POLICY "Public read shelters" ON public.shelters FOR SELECT USING (true);
CREATE POLICY "Public insert shelters" ON public.shelters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update shelters" ON public.shelters FOR UPDATE USING (true);
CREATE POLICY "Public delete shelters" ON public.shelters FOR DELETE USING (true);

CREATE POLICY "Public read resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Public insert resources" ON public.resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update resources" ON public.resources FOR UPDATE USING (true);
CREATE POLICY "Public delete resources" ON public.resources FOR DELETE USING (true);

CREATE POLICY "Public read activity_log" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Public insert activity_log" ON public.activity_log FOR INSERT WITH CHECK (true);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shelters_updated_at
  BEFORE UPDATE ON public.shelters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_incidents_severity ON public.incidents(severity);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_type ON public.incidents(type);
CREATE INDEX idx_incidents_reported_at ON public.incidents(reported_at DESC);
CREATE INDEX idx_resources_type ON public.resources(type);
CREATE INDEX idx_resources_status ON public.resources(status);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);