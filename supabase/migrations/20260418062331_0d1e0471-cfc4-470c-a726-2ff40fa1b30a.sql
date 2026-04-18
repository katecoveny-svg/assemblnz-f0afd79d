-- VOYAGE Command Mode: trip planner schema

-- Master trip
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID,
  name TEXT NOT NULL,
  tagline TEXT,
  currency TEXT NOT NULL DEFAULT 'NZD',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  base_lat NUMERIC,
  base_lng NUMERIC,
  base_zoom INTEGER DEFAULT 6,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Families joining the trip
CREATE TABLE public.trip_families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  accent_color TEXT NOT NULL DEFAULT '#00B894',
  home_city TEXT,
  home_lat NUMERIC,
  home_lng NUMERIC,
  member_count INTEGER NOT NULL DEFAULT 1,
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Destinations / stops
CREATE TABLE public.trip_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  region TEXT,
  color TEXT NOT NULL DEFAULT '#00B894',
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Days
CREATE TABLE public.trip_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES public.trip_destinations(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  title TEXT,
  summary TEXT,
  weather_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities
CREATE TABLE public.trip_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_id UUID NOT NULL REFERENCES public.trip_days(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_time TEXT,
  duration_minutes INTEGER,
  cost NUMERIC DEFAULT 0,
  activity_type TEXT NOT NULL DEFAULT 'free',
  booked BOOLEAN NOT NULL DEFAULT false,
  urgent BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Convoys (per-family per-day routing)
CREATE TABLE public.trip_convoys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES public.trip_families(id) ON DELETE CASCADE,
  day_id UUID NOT NULL REFERENCES public.trip_days(id) ON DELETE CASCADE,
  origin_label TEXT,
  origin_lat NUMERIC,
  origin_lng NUMERIC,
  destination_label TEXT,
  destination_lat NUMERIC,
  destination_lng NUMERIC,
  depart_at TIMESTAMPTZ,
  arrive_at TIMESTAMPTZ,
  distance_km NUMERIC,
  status TEXT NOT NULL DEFAULT 'planned',
  route_polyline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_trip_families_trip ON public.trip_families(trip_id);
CREATE INDEX idx_trip_destinations_trip ON public.trip_destinations(trip_id, sort_order);
CREATE INDEX idx_trip_days_trip ON public.trip_days(trip_id, date);
CREATE INDEX idx_trip_activities_day ON public.trip_activities(day_id, sort_order);
CREATE INDEX idx_trip_convoys_trip_day ON public.trip_convoys(trip_id, day_id);

-- Updated_at trigger on trips
CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_convoys ENABLE ROW LEVEL SECURITY;

-- trips policies
CREATE POLICY "trips: sample trips are public"
  ON public.trips FOR SELECT
  USING (is_sample = true OR auth.uid() = owner_id);

CREATE POLICY "trips: owners insert"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "trips: owners update"
  ON public.trips FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "trips: owners delete"
  ON public.trips FOR DELETE
  USING (auth.uid() = owner_id);

-- Helper to check trip access
CREATE OR REPLACE FUNCTION public.can_access_trip(_trip_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trips
    WHERE id = _trip_id
      AND (is_sample = true OR owner_id = auth.uid())
  )
$$;

CREATE OR REPLACE FUNCTION public.owns_trip(_trip_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trips
    WHERE id = _trip_id AND owner_id = auth.uid()
  )
$$;

-- Child table policies (read = can_access_trip, write = owns_trip)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['trip_families','trip_destinations','trip_days','trip_activities','trip_convoys'] LOOP
    EXECUTE format('CREATE POLICY "%1$s: read via trip" ON public.%1$s FOR SELECT USING (public.can_access_trip(trip_id))', t);
    EXECUTE format('CREATE POLICY "%1$s: insert via trip" ON public.%1$s FOR INSERT WITH CHECK (public.owns_trip(trip_id))', t);
    EXECUTE format('CREATE POLICY "%1$s: update via trip" ON public.%1$s FOR UPDATE USING (public.owns_trip(trip_id))', t);
    EXECUTE format('CREATE POLICY "%1$s: delete via trip" ON public.%1$s FOR DELETE USING (public.owns_trip(trip_id))', t);
  END LOOP;
END $$;