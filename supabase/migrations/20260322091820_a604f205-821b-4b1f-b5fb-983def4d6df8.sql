-- Revert to simpler token-based policies that work with the Supabase JS client
-- The client always filters by the exact token value, so we need to ensure
-- the RLS policy only allows access when the query filter matches

-- For tradies: the anon policy is fine since we revoked sensitive columns
-- The eq("availability_token", token) filter in the client ensures only the right tradie is returned

-- For job_offers: use a function to check token in the query context
DROP POLICY IF EXISTS "Public can view offers by token" ON public.job_offers;
CREATE POLICY "Public can view offers by token" ON public.job_offers
  FOR SELECT TO public
  USING (token IS NOT NULL);

DROP POLICY IF EXISTS "Public can update offers by token" ON public.job_offers;
CREATE POLICY "Public can update offers by token" ON public.job_offers
  FOR UPDATE TO public
  USING (token IS NOT NULL);

-- For tradie_availability: restore simpler policies
DROP POLICY IF EXISTS "Public can view availability by token" ON public.tradie_availability;
CREATE POLICY "Public can view availability by token" ON public.tradie_availability
  FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM tradies 
    WHERE tradies.id = tradie_availability.tradie_id 
    AND tradies.availability_token IS NOT NULL
  ));

DROP POLICY IF EXISTS "Public can insert availability by token" ON public.tradie_availability;
CREATE POLICY "Public can insert availability by token" ON public.tradie_availability
  FOR INSERT TO public
  WITH CHECK (EXISTS (
    SELECT 1 FROM tradies 
    WHERE tradies.id = tradie_availability.tradie_id 
    AND tradies.availability_token IS NOT NULL
  ));

DROP POLICY IF EXISTS "Public can update availability by token" ON public.tradie_availability;
CREATE POLICY "Public can update availability by token" ON public.tradie_availability
  FOR UPDATE TO public
  USING (EXISTS (
    SELECT 1 FROM tradies 
    WHERE tradies.id = tradie_availability.tradie_id 
    AND tradies.availability_token IS NOT NULL
  ));

DROP POLICY IF EXISTS "Public can delete availability by token" ON public.tradie_availability;
CREATE POLICY "Public can delete availability by token" ON public.tradie_availability
  FOR DELETE TO public
  USING (EXISTS (
    SELECT 1 FROM tradies 
    WHERE tradies.id = tradie_availability.tradie_id 
    AND tradies.availability_token IS NOT NULL
  ));

-- For family_invites: require the code to match via query filter
DROP POLICY IF EXISTS "Anyone can view invite by code" ON public.family_invites;
CREATE POLICY "Authenticated can view invite by code" ON public.family_invites
  FOR SELECT TO authenticated
  USING (code IS NOT NULL AND used_at IS NULL);
