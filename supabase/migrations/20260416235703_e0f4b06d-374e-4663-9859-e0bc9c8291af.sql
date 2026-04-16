
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-assets', 'video-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for video-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'video-assets');
