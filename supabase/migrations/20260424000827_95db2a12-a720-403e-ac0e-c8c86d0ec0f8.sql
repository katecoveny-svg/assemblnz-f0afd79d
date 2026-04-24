-- Allow authenticated users (operators) to update approval_queue rows
-- so they can sign off pending drafts. Validation trigger still enforces
-- legal status values.
CREATE POLICY "Authenticated operators can sign off approval_queue"
ON public.approval_queue
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);