-- Kaiako — the force-free dog trainer, catalogue-mirror row.
--
-- Kaiako is the training specialist inside the Kaitiaki bundle (lead: Keeper)
-- and the training voice behind the Alphassembl consumer surface. It RETIRES
-- the earlier PACK proposal: the live roster + locked prompt moved from slug
-- 'pack' to 'kaiako' in lib/marketplace/{agents,agent-prompts}.ts, and the
-- Kaitiaki bundle membership now lists 'kaiako'. This migration mirrors that
-- into the DB agents catalogue so /admin and DB-driven surfaces stay in sync.
--
-- Consistent with reference_agent_prompts_live_in_code: chats read the system
-- prompt from CODE, so agents.system_prompt stays NULL here. 'pack' was never
-- seeded into the DB, so there is no old row to retire — this is a clean add.
--
-- Depends on 20260704090000_kaitiaki_bundle.sql (bundle row + Keeper + the
-- agents_bundle_check admitting 'kaitiaki'). Idempotent: upsert ON CONFLICT
-- (slug); re-running is a no-op.

BEGIN;

INSERT INTO public.agents
  (slug, name, te_reo, description, category, model_tier, pricing_tier,
   price_tier, price_monthly_nzd, icon, accent, greeting, status,
   bundle, is_bundle_lead, parent_slug)
VALUES
  ('kaiako', 'Kaiako', '',
   'The force-free dog trainer inside Alphassembl — LIMA, the humane hierarchy and reward-based methods in plain-English plans. Grounds every reply in the Dog Control Act 1996, SPCA NZ advice and Ian Dunbar''s puppy guidance, with a Trust score on each. Guidance only: a bite, aggression or severe anxiety is referred to a vet or a certified behaviourist.',
   'animal', 'premium', 'per_agent', 'free', 0, 'paw', '#FFF7EC',
   'Kia ora — I''m your Alphassembl trainer. Tell me about your dog and what''s tricky: pulling on the lead, puppy biting, recall, jumping, crate training. I''ll build a force-free plan grounded in NZ advice and cite where each step comes from. Anything with a bite or real aggression, I''ll point you straight to a vet or certified behaviourist.',
   'live', 'kaitiaki', false, 'keeper')
ON CONFLICT (slug) DO UPDATE SET
  name              = EXCLUDED.name,
  description       = EXCLUDED.description,
  category          = EXCLUDED.category,
  model_tier        = EXCLUDED.model_tier,
  pricing_tier      = EXCLUDED.pricing_tier,
  price_tier        = EXCLUDED.price_tier,
  price_monthly_nzd = EXCLUDED.price_monthly_nzd,
  icon              = EXCLUDED.icon,
  accent            = EXCLUDED.accent,
  greeting          = EXCLUDED.greeting,
  status            = EXCLUDED.status,
  bundle            = EXCLUDED.bundle,
  is_bundle_lead    = EXCLUDED.is_bundle_lead,
  parent_slug       = EXCLUDED.parent_slug,
  updated_at        = now();

COMMIT;

-- Verify:
--   SELECT slug, name, bundle, parent_slug, status FROM public.agents WHERE slug = 'kaiako';
