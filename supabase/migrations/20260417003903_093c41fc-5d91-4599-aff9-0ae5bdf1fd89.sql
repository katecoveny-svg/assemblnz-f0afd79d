UPDATE storage.objects
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{mimetype}',
  to_jsonb(
    CASE
      WHEN name ILIKE '%.mp4' THEN 'video/mp4'
      WHEN name ILIKE '%.mp3' THEN 'audio/mpeg'
      WHEN name ILIKE '%.gif' THEN 'image/gif'
      WHEN name ILIKE '%.webm' THEN 'video/webm'
      WHEN name ILIKE '%.wav' THEN 'audio/wav'
      ELSE COALESCE(metadata->>'mimetype', 'application/octet-stream')
    END
  )
)
WHERE bucket_id = 'video-assets'
  AND (metadata->>'mimetype' = 'application/octet-stream' OR metadata->>'mimetype' IS NULL);