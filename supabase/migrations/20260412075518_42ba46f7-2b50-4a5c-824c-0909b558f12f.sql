
-- Create shipments table for Pikau kete
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  hs_code TEXT,
  value_nzd NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  incoterm TEXT,
  dangerous_goods BOOLEAN DEFAULT false,
  carrier TEXT,
  tracking_code TEXT,
  broker_code TEXT,
  country_of_origin TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_shipment_status()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('draft', 'declared', 'cleared', 'held') THEN
    RAISE EXCEPTION 'status must be draft, declared, cleared, or held';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_shipment_status_trigger
  BEFORE INSERT OR UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.validate_shipment_status();

-- Updated_at trigger
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shipments"
  ON public.shipments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shipments"
  ON public.shipments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipments"
  ON public.shipments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shipments"
  ON public.shipments FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_shipments_user_id ON public.shipments(user_id);
CREATE INDEX idx_shipments_status ON public.shipments(status);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
