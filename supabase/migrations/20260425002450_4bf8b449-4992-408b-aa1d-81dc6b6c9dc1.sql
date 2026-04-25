-- Allow anonymous (logged-out) visitors to log grid-click events.
-- The user_id column stays nullable; only authenticated users get attributed.
DROP POLICY IF EXISTS "Users can insert own agent analytics" ON public.agent_analytics_events;

CREATE POLICY "Anyone can insert agent analytics events"
ON public.agent_analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- If they're logged in, the row's user_id must match (or be null for anon-style logging).
  -- If they're anonymous, user_id must be null.
  (auth.uid() IS NULL AND user_id IS NULL)
  OR (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
);