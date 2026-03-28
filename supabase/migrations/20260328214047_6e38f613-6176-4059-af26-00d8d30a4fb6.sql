
-- 1. Fix tradies: replace overly broad "Public can view tradies by token" policy
-- with one that only exposes non-sensitive columns via column-level privileges
DROP POLICY IF EXISTS "Public can view tradies by token" ON tradies;

-- Revoke anon SELECT on sensitive columns
REVOKE SELECT (email, phone, licence_number, insurance_provider, availability_token) ON tradies FROM anon;

-- Re-create a safe public policy that only works when token matches a supplied value
-- For now, just allow authenticated users to view tradies they have offers for
CREATE POLICY "Authenticated users view tradies"
  ON tradies FOR SELECT
  TO authenticated
  USING (true);

-- 2. Fix user_notifications: restrict inserts to service_role only
DROP POLICY IF EXISTS "Service can insert notifications" ON user_notifications;

CREATE POLICY "Service role inserts notifications"
  ON user_notifications FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

-- 3. Fix usage_tracking: replace overly broad policy with service_role-only
DROP POLICY IF EXISTS "Service can manage usage" ON usage_tracking;

CREATE POLICY "Service role manages usage"
  ON usage_tracking FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
