-- 1. Deactivate stub-only AUAHA tools so the LLM stops being offered them.
UPDATE public.tool_registry
SET is_active = false,
    description = COALESCE(description, '') || ' [DEACTIVATED 2026-04: integration not yet wired]'
WHERE tool_name IN ('auaha_adobe_creative_cloud', 'auaha_spline_3d', 'auaha_unsplash_pexels')
  AND is_active = true;

-- 2. Promote LIVE_DATA_TOOLS into tool_registry so per-agent toolset wiring
--    (agent_toolsets) can grant/revoke them per kete. Schemas mirror the
--    LlmTool definitions in supabase/functions/_shared/tool-executor.ts.
INSERT INTO public.tool_registry (tool_name, tool_category, description, requires_integration, is_active, tool_schema)
VALUES
  ('get_nz_weather', 'live_data', 'Fetch current weather and short forecast for an NZ location.', ARRAY['weather'], true,
    '{"type":"function","function":{"name":"get_nz_weather","description":"Fetch current weather and short forecast for a New Zealand location.","parameters":{"type":"object","properties":{"city":{"type":"string"},"lat":{"type":"number"},"lon":{"type":"number"},"mode":{"type":"string","enum":["current","forecast","both"]}}}}}'::jsonb),
  ('get_nz_fuel_prices', 'live_data', 'NZ retail fuel prices (91, 95, diesel, EV) from MBIE weekly monitoring.', ARRAY['fuel'], true,
    '{"type":"function","function":{"name":"get_nz_fuel_prices","description":"Get current NZ retail fuel prices.","parameters":{"type":"object","properties":{}}}}'::jsonb),
  ('get_nz_route', 'live_data', 'Driving route between two NZ locations with distance, duration, tolls.', ARRAY['routes'], true,
    '{"type":"function","function":{"name":"get_nz_route","description":"Get a driving route between two NZ locations.","parameters":{"type":"object","properties":{"origin":{"type":"string"},"destination":{"type":"string"},"mode":{"type":"string","enum":["driving","truck"]}},"required":["origin","destination"]}}}'::jsonb),
  ('search_knowledge_base', 'live_data', 'Search the NZ industry knowledge base (Acts, IRD/MBIE/MPI/WorkSafe).', ARRAY['knowledge_base'], true,
    '{"type":"function","function":{"name":"search_knowledge_base","description":"Search the NZ industry knowledge base.","parameters":{"type":"object","properties":{"query":{"type":"string"},"kete":{"type":"string"},"limit":{"type":"number"}},"required":["query"]}}}'::jsonb),
  ('recall_memory', 'live_data', 'Recall facts the user has previously shared with any agent.', ARRAY[]::text[], true,
    '{"type":"function","function":{"name":"recall_memory","description":"Recall facts the user has previously shared.","parameters":{"type":"object","properties":{"query":{"type":"string"},"limit":{"type":"number"}},"required":["query"]}}}'::jsonb),
  ('get_compliance_updates', 'live_data', 'Recent NZ regulatory changes from the daily compliance scanner.', ARRAY['compliance'], true,
    '{"type":"function","function":{"name":"get_compliance_updates","description":"Get recent NZ regulatory changes.","parameters":{"type":"object","properties":{"industry":{"type":"string"},"since_days":{"type":"number"},"impact":{"type":"string","enum":["low","medium","high"]}}}}}'::jsonb),
  ('get_iot_signal', 'live_data', 'Live operational data: vehicle, freight, marine AIS, agri, construction.', ARRAY['fleet','freight','ais','agriculture','construction','marine'], true,
    '{"type":"function","function":{"name":"get_iot_signal","description":"Get a live operational data signal.","parameters":{"type":"object","properties":{"source":{"type":"string","enum":["vehicle","freight","ais","agri","construction","marine_weather"]},"ref":{"type":"string"}},"required":["source"]}}}'::jsonb),
  ('send_sms', 'live_data', 'Send SMS or WhatsApp via the TNZ gateway. Requires user confirmation.', ARRAY[]::text[], true,
    '{"type":"function","function":{"name":"send_sms","description":"Send an SMS or WhatsApp message via the TNZ gateway.","parameters":{"type":"object","properties":{"to":{"type":"string"},"body":{"type":"string"},"channel":{"type":"string","enum":["sms","whatsapp"]}},"required":["to","body"]}}}'::jsonb)
ON CONFLICT (tool_name) DO UPDATE
  SET requires_integration = EXCLUDED.requires_integration,
      tool_category = EXCLUDED.tool_category,
      description = EXCLUDED.description,
      is_active = true,
      tool_schema = EXCLUDED.tool_schema,
      updated_at = now();

-- 3. Backfill requires_integration on AUAHA + TORO + auaha-runway tools so
--    chat/index.ts can cross-validate against live-data-context scope.
UPDATE public.tool_registry SET requires_integration = ARRAY['knowledge_base']
  WHERE tool_name LIKE 'toro_%' AND requires_integration = ARRAY[]::text[];

UPDATE public.tool_registry SET requires_integration = ARRAY['knowledge_base']
  WHERE tool_name = 'auaha_falai_image_gen' AND requires_integration = ARRAY[]::text[];

UPDATE public.tool_registry SET requires_integration = ARRAY['knowledge_base']
  WHERE tool_name = 'auaha_runway_ml_video' AND requires_integration = ARRAY[]::text[];

UPDATE public.tool_registry SET requires_integration = ARRAY['knowledge_base']
  WHERE tool_name = 'auaha_buffer_scheduler' AND requires_integration = ARRAY[]::text[];