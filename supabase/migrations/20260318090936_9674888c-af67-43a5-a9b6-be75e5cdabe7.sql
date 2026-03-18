INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-images', 'chat-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

CREATE POLICY "Anyone can upload chat images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "Anyone can read chat images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'chat-images');