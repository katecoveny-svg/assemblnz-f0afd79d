-- Add share token + public visibility flag to evidence_packs for share-link feature
ALTER TABLE public.evidence_packs
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_publicly_shared BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS share_view_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_evidence_packs_share_token
  ON public.evidence_packs(share_token)
  WHERE share_token IS NOT NULL;

-- Allow anonymous reads ONLY when the pack has been explicitly shared.
-- This is the only column-restricted public-access policy on this table.
DROP POLICY IF EXISTS "Public can view shared evidence packs" ON public.evidence_packs;
CREATE POLICY "Public can view shared evidence packs"
ON public.evidence_packs
FOR SELECT
TO anon, authenticated
USING (is_publicly_shared = true AND share_token IS NOT NULL);

-- Allow the owning user to mint/revoke a share link
DROP POLICY IF EXISTS "Users can update their own evidence packs" ON public.evidence_packs;
CREATE POLICY "Users can update their own evidence packs"
ON public.evidence_packs
FOR UPDATE
TO authenticated
USING (user_id = (auth.uid())::text)
WITH CHECK (user_id = (auth.uid())::text);

-- View-counter RPC (security definer so it can bump the counter even though
-- the caller may be anonymous and lacks UPDATE rights)
CREATE OR REPLACE FUNCTION public.increment_evidence_share_view(_token TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.evidence_packs
     SET share_view_count = share_view_count + 1
   WHERE share_token = _token
     AND is_publicly_shared = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_evidence_share_view(TEXT) TO anon, authenticated;