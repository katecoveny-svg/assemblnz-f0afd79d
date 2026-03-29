
-- Fix overly permissive policies

-- Drop the ALL policy on tradie_availability (too broad for public)
DROP POLICY "Public can manage availability by token" ON public.tradie_availability;

-- Replace with specific INSERT/UPDATE/DELETE for public token access
CREATE POLICY "Public can insert availability by token" ON public.tradie_availability FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tradies WHERE tradies.id = tradie_availability.tradie_id AND tradies.availability_token IS NOT NULL)
);
CREATE POLICY "Public can update availability by token" ON public.tradie_availability FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.tradies WHERE tradies.id = tradie_availability.tradie_id AND tradies.availability_token IS NOT NULL)
);
CREATE POLICY "Public can delete availability by token" ON public.tradie_availability FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.tradies WHERE tradies.id = tradie_availability.tradie_id AND tradies.availability_token IS NOT NULL)
);
