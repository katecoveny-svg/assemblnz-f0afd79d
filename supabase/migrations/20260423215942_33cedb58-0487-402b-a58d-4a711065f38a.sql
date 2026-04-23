-- Register new creative tool integrations for Auaha kete
INSERT INTO public.tool_registry (tool_name) VALUES
  ('auaha_adobe_creative_cloud'),
  ('auaha_runway_ml_video'),
  ('auaha_falai_image_gen'),
  ('auaha_unsplash_pexels'),
  ('auaha_buffer_scheduler'),
  ('auaha_spline_3d')
ON CONFLICT (tool_name) DO NOTHING;

-- Grant Auaha & Prism access to the new creative tools
INSERT INTO public.agent_toolsets (agent_id, tool_name) VALUES
  ('auaha', 'auaha_adobe_creative_cloud'),
  ('auaha', 'auaha_runway_ml_video'),
  ('auaha', 'auaha_falai_image_gen'),
  ('auaha', 'auaha_unsplash_pexels'),
  ('auaha', 'auaha_buffer_scheduler'),
  ('auaha', 'auaha_spline_3d'),
  ('PRISM', 'auaha_adobe_creative_cloud'),
  ('PRISM', 'auaha_runway_ml_video'),
  ('PRISM', 'auaha_falai_image_gen'),
  ('PRISM', 'auaha_unsplash_pexels'),
  ('PRISM', 'auaha_spline_3d'),
  ('echo', 'auaha_buffer_scheduler'),
  ('ECHO', 'auaha_buffer_scheduler')
ON CONFLICT DO NOTHING;