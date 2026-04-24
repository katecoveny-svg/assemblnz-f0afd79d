
-- Private bucket for source docs attached to evidence packs
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence-uploads', 'evidence-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own folder: {auth.uid()}/...
CREATE POLICY "Users upload own evidence sources"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'evidence-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users read own evidence sources"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'evidence-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own evidence sources"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'evidence-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
