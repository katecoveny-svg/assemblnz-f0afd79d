
-- HELM Family Management Platform Tables

-- Families
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nz_region TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Family Members
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Children
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year_level TEXT,
  school TEXT,
  avatar_color TEXT DEFAULT '#B388FF',
  bus_route_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location TEXT,
  notes TEXT,
  source TEXT DEFAULT 'manual',
  source_message_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  source TEXT DEFAULT 'manual',
  source_message_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Packing Items
CREATE TABLE public.packing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  packed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.packing_items ENABLE ROW LEVEL SECURITY;

-- Timetables
CREATE TABLE public.timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  period INTEGER NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, day_of_week, period)
);
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- Gear Rules
CREATE TABLE public.gear_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  items TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gear_rules ENABLE ROW LEVEL SECURITY;

-- Inbox Messages (school notices)
CREATE TABLE public.inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  subject TEXT,
  sender TEXT,
  provider TEXT,
  raw_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

-- Parsed Items (AI-extracted from notices)
CREATE TABLE public.parsed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.inbox_messages(id) ON DELETE SET NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL,
  parsed_data JSONB NOT NULL,
  confidence NUMERIC(3,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'proposed',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parsed_items ENABLE ROW LEVEL SECURITY;

-- Family Invites
CREATE TABLE public.family_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  role TEXT NOT NULL DEFAULT 'coparent',
  created_by UUID REFERENCES auth.users(id),
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;

-- Delivery Requests
CREATE TABLE public.delivery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id),
  item_description TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  fee_cents INTEGER,
  currency TEXT DEFAULT 'NZD',
  estimated_arrival TEXT,
  tracking_url TEXT,
  delivery_provider_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;

-- Integrations (calendar connections)
CREATE TABLE public.helm_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  scopes TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.helm_integrations ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is member of a family
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = _user_id AND family_id = _family_id
  )
$$;

-- RLS Policies using family membership

-- families: members can view their families
CREATE POLICY "Family members can view" ON public.families FOR SELECT USING (
  public.is_family_member(auth.uid(), id)
);
CREATE POLICY "Authenticated can create families" ON public.families FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Family admin can update" ON public.families FOR UPDATE USING (
  public.is_family_member(auth.uid(), id)
);
CREATE POLICY "Family admin can delete" ON public.families FOR DELETE USING (
  created_by = auth.uid()
);

-- family_members
CREATE POLICY "Members can view family members" ON public.family_members FOR SELECT USING (
  public.is_family_member(auth.uid(), family_id)
);
CREATE POLICY "Authenticated can insert family members" ON public.family_members FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() OR public.is_family_member(auth.uid(), family_id)
);
CREATE POLICY "Members can delete" ON public.family_members FOR DELETE USING (
  user_id = auth.uid()
);

-- children
CREATE POLICY "Members can view children" ON public.children FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can insert children" ON public.children FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can update children" ON public.children FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can delete children" ON public.children FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- events
CREATE POLICY "Members can view events" ON public.events FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can update events" ON public.events FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can delete events" ON public.events FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- tasks
CREATE POLICY "Members can view tasks" ON public.tasks FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can update tasks" ON public.tasks FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can delete tasks" ON public.tasks FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- packing_items
CREATE POLICY "Members can view packing" ON public.packing_items FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can insert packing" ON public.packing_items FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can update packing" ON public.packing_items FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can delete packing" ON public.packing_items FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- timetables
CREATE POLICY "Members can view timetables" ON public.timetables FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can insert timetables" ON public.timetables FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can update timetables" ON public.timetables FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can delete timetables" ON public.timetables FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- gear_rules
CREATE POLICY "Members can view gear_rules" ON public.gear_rules FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can insert gear_rules" ON public.gear_rules FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can update gear_rules" ON public.gear_rules FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can delete gear_rules" ON public.gear_rules FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- inbox_messages
CREATE POLICY "Members can view inbox" ON public.inbox_messages FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can insert inbox" ON public.inbox_messages FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can update inbox" ON public.inbox_messages FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can delete inbox" ON public.inbox_messages FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- parsed_items
CREATE POLICY "Members can view parsed" ON public.parsed_items FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can insert parsed" ON public.parsed_items FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can update parsed" ON public.parsed_items FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can delete parsed" ON public.parsed_items FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- family_invites
CREATE POLICY "Members can view invites" ON public.family_invites FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can create invites" ON public.family_invites FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Anyone can view invite by code" ON public.family_invites FOR SELECT USING (code IS NOT NULL);
CREATE POLICY "Authenticated can use invite" ON public.family_invites FOR UPDATE TO authenticated USING (code IS NOT NULL AND used_by IS NULL);

-- delivery_requests
CREATE POLICY "Members can view deliveries" ON public.delivery_requests FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can insert deliveries" ON public.delivery_requests FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can update deliveries" ON public.delivery_requests FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));

-- helm_integrations
CREATE POLICY "Members can view integrations" ON public.helm_integrations FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can insert integrations" ON public.helm_integrations FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can update integrations" ON public.helm_integrations FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Members can delete integrations" ON public.helm_integrations FOR DELETE USING (public.is_family_member(auth.uid(), family_id));
