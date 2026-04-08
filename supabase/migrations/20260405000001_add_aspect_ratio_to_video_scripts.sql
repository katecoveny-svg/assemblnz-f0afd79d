-- Add aspect_ratio column to video_scripts for PRISM Video Studio
ALTER TABLE public.video_scripts ADD COLUMN IF NOT EXISTS aspect_ratio TEXT DEFAULT '9:16';
