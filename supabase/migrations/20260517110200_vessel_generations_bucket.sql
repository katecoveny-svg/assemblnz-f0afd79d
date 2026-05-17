-- ─────────────────────────────────────────────────────────────────────────────
-- vessel-generations Storage bucket
--
-- The /tools/vessel route handler mirrors every Fal.ai image into this
-- bucket so /tools/vessel/output/<id> share links and Open Graph meta tags
-- keep working after Fal's CDN expires the original URL.
--
-- - Public bucket: served via the Supabase public CDN; readable by anon.
-- - Service-role writes only: the public route handler uses the service key.
-- - 10 MB cap and image/* MIME allowlist as a defensive belt.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vessel-generations',
  'vessel-generations',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS — anon SELECT (the bucket is public, but this is belt-and-
-- braces in case object-level policies are tightened later) + service-role
-- INSERT for the route handler's mirror upload.

DROP POLICY IF EXISTS "vessel-generations public read"
  ON storage.objects;
CREATE POLICY "vessel-generations public read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vessel-generations');

DROP POLICY IF EXISTS "vessel-generations service role write"
  ON storage.objects;
CREATE POLICY "vessel-generations service role write"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'vessel-generations');
