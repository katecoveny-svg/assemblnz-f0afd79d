-- ============================================================================
-- PR 2 — IPP 3A policy gate activation
-- ----------------------------------------------------------------------------
-- Activates a content_policy rule that runtime-enforces an IPP 3A
-- notification footer on agent outputs that reference third-party PII
-- (email, phone, IRD, NHI, NZBN patterns).
--
-- IPP 3A came into force on 1 May 2026 (Privacy Act 2020). When an agency
-- collects personal information indirectly (i.e., from someone other than
-- the individual), it must take reasonable steps to notify that individual
-- of: (a) the fact and purpose of collection, (b) intended recipients,
-- (c) the collector's name and address, (d) any legal authority requiring
-- collection, and (e) their rights to access and correct.
--
-- This rule appends a standard footer so downstream holders can fulfil the
-- notification obligation. It is a RUNTIME SAFETY-NET — the agent prompts
-- should still teach agents to produce notification blocks proactively.
--
-- Companion code: supabase/functions/_shared/policy.ts
--   - extends applyContentPolicy with `require_ipp3a_footer` field
--   - adds containsThirdPartyPii() helper (reuses existing PII_PATTERNS)
-- ============================================================================

INSERT INTO public.mcp_policy_rules (
  rule_code,
  rule_type,
  applies_to_toolset,
  applies_to_tool,
  rule_logic,
  enforcement_stage,
  is_active,
  reasoning_maori,
  description
) VALUES (
  'ipp3a_global_notification',
  'content_policy',
  NULL,  -- applies to all toolsets
  NULL,  -- applies to all tools
  jsonb_build_object(
    'require_ipp3a_footer',
    E'> **IPP 3A notification — Privacy Act 2020 (in force 1 May 2026)**\n>\n> This output references information about an individual that may not have been collected directly from them. Under Information Privacy Principle 3A, the holder must take reasonable steps to notify the individual about: (a) the fact and purpose of collection, (b) intended recipients, (c) the collector''s name and address, (d) any legal authority requiring collection, and (e) their right to access and correct the information. Use Assembl''s standard notification template before sharing externally.'
  ),
  'mana_post',
  true,
  E'Tiakitia te mana o te t\u0101ngata — aroha ki te kaupapa.',
  E'IPP 3A (Privacy Act 2020, in force 1 May 2026): when output contains a recognised NZ-context PII pattern (email, phone, IRD, NHI, NZBN), append the standard IPP 3A notification footer so the holder can fulfil their notification obligation. Runtime safety-net behind the prompt-level notification rules.'
)
ON CONFLICT (rule_code) DO UPDATE SET
  rule_type = EXCLUDED.rule_type,
  applies_to_toolset = EXCLUDED.applies_to_toolset,
  applies_to_tool = EXCLUDED.applies_to_tool,
  rule_logic = EXCLUDED.rule_logic,
  enforcement_stage = EXCLUDED.enforcement_stage,
  is_active = EXCLUDED.is_active,
  reasoning_maori = EXCLUDED.reasoning_maori,
  description = EXCLUDED.description,
  updated_at = now();
