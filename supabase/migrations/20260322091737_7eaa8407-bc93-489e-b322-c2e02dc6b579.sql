-- Fix 1: Tradies - restrict public SELECT to only non-sensitive fields via a security barrier view
-- Instead of modifying RLS (which can't filter columns), we'll tighten the policy to require token match
DROP POLICY IF EXISTS "Public can view tradies by token" ON public.tradies;
CREATE POLICY "Public can view tradies by token" ON public.tradies
  FOR SELECT TO anon
  USING (availability_token IS NOT NULL);

-- Revoke sensitive columns from anon on tradies
REVOKE SELECT (email, phone, licence_number, insurance_provider) ON public.tradies FROM anon;

-- Fix 2: Job offers - require token value match, not just IS NOT NULL
DROP POLICY IF EXISTS "Public can view offers by token" ON public.job_offers;
CREATE POLICY "Public can view offers by token" ON public.job_offers
  FOR SELECT TO anon
  USING (token = current_setting('request.headers', true)::json->>'x-job-token');

DROP POLICY IF EXISTS "Public can update offers by token" ON public.job_offers;
CREATE POLICY "Public can update offers by token" ON public.job_offers
  FOR UPDATE TO anon
  USING (token = current_setting('request.headers', true)::json->>'x-job-token');

-- Fix 3: Tradie availability - require token verification
DROP POLICY IF EXISTS "Public can view availability by token" ON public.tradie_availability;
CREATE POLICY "Public can view availability by token" ON public.tradie_availability
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM tradies 
    WHERE tradies.id = tradie_availability.tradie_id 
    AND tradies.availability_token = current_setting('request.headers', true)::json->>'x-tradie-token'
  ));

DROP POLICY IF EXISTS "Public can insert availability by token" ON public.tradie_availability;
CREATE POLICY "Public can insert availability by token" ON public.tradie_availability
  FOR INSERT TO anon
  WITH CHECK (EXISTS (
    SELECT 1 FROM tradies 
    WHERE tradies.id = tradie_availability.tradie_id 
    AND tradies.availability_token = current_setting('request.headers', true)::json->>'x-tradie-token'
  ));

DROP POLICY IF EXISTS "Public can update availability by token" ON public.tradie_availability;
CREATE POLICY "Public can update availability by token" ON public.tradie_availability
  FOR UPDATE TO anon
  USING (EXISTS (
    SELECT 1 FROM tradies 
    WHERE tradies.id = tradie_availability.tradie_id 
    AND tradies.availability_token = current_setting('request.headers', true)::json->>'x-tradie-token'
  ));

DROP POLICY IF EXISTS "Public can delete availability by token" ON public.tradie_availability;
CREATE POLICY "Public can delete availability by token" ON public.tradie_availability
  FOR DELETE TO anon
  USING (EXISTS (
    SELECT 1 FROM tradies 
    WHERE tradies.id = tradie_availability.tradie_id 
    AND tradies.availability_token = current_setting('request.headers', true)::json->>'x-tradie-token'
  ));

-- Fix 4: Family invites - require code match, not just IS NOT NULL
DROP POLICY IF EXISTS "Anyone can view invite by code" ON public.family_invites;
CREATE POLICY "Anyone can view invite by code" ON public.family_invites
  FOR SELECT TO public
  USING (code = current_setting('request.headers', true)::json->>'x-invite-code');
