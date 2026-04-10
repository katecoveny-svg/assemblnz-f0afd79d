
INSERT INTO storage.buckets (id, name, public)
VALUES ('plans', 'plans', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Plans are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'plans');

CREATE POLICY "Service role can upload plans"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'plans');

CREATE POLICY "Service role can update plans"
ON storage.objects FOR UPDATE
USING (bucket_id = 'plans');
