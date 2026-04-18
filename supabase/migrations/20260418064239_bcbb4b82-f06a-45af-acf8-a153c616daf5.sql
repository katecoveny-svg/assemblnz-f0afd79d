-- HOKO workflow seeds (idempotent on title + user_id)
DO $$
DECLARE
  sys_user UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- 1. Competitor Price Scanner + Defensive Discount Advisor (FLAGSHIP)
  INSERT INTO public.automations (user_id, title, description, category, icon, is_active, agent_id)
  SELECT sys_user, 'HOKO · Competitor Price Scanner',
    'PRISM scans Temu/Amazon AU/PriceSpy + 5 local competitors daily across your top 50–500 SKUs. LEDGER honest-prices the gap (freight + GST factored in). NOVA drafts defensive bundles or loyalty-locked discounts. AURA delivers a weekly pricing brief.',
    'hoko', 'TrendingDown', true, 'prism'
  WHERE NOT EXISTS (SELECT 1 FROM public.automations WHERE user_id = sys_user AND title = 'HOKO · Competitor Price Scanner');

  -- 2. Auto Re-Order Recommender
  INSERT INTO public.automations (user_id, title, description, category, icon, is_active, agent_id)
  SELECT sys_user, 'HOKO · Auto Re-Order Recommender',
    'FLUX reads 12 months of POS sales velocity (Vend/Lightspeed/Shopify/Cin7). LEDGER factors seasonality, current stock, supplier lead times and open POs. APEX generates a re-order list grouped by supplier. AURA delivers Monday morning with one-tap-to-approve.',
    'hoko', 'Package', true, 'flux'
  WHERE NOT EXISTS (SELECT 1 FROM public.automations WHERE user_id = sys_user AND title = 'HOKO · Auto Re-Order Recommender');

  -- 3. Unified Customer View + Birthday/Restock Trigger
  INSERT INTO public.automations (user_id, title, description, category, icon, is_active, agent_id)
  SELECT sys_user, 'HOKO · Unified Customer View',
    'PRISM ingests POS, MailChimp/Klaviyo, loyalty system, Instagram/Facebook DMs. Records matched by email/phone/name+postcode into a unified customer with lifetime value and favourite brands. AURA monitors triggers (birthday, restock, lapsed). NOVA drafts on-tone outreach.',
    'hoko', 'Users', true, 'prism'
  WHERE NOT EXISTS (SELECT 1 FROM public.automations WHERE user_id = sys_user AND title = 'HOKO · Unified Customer View');

  -- 4. Product Launch Multi-Channel Publisher
  INSERT INTO public.automations (user_id, title, description, category, icon, is_active, agent_id)
  SELECT sys_user, 'HOKO · Multi-Channel Product Publisher',
    'One product input → NOVA generates the master message. SOCIAL adapts for website (SEO), Instagram reel, Facebook, Google Business, email, TikTok hook. AURA schedules at optimal times. PRISM tracks engagement and feeds back what worked.',
    'hoko', 'Megaphone', true, 'nova'
  WHERE NOT EXISTS (SELECT 1 FROM public.automations WHERE user_id = sys_user AND title = 'HOKO · Multi-Channel Product Publisher');

  -- 5. FTA/CGA Compliance Lint
  INSERT INTO public.automations (user_id, title, description, category, icon, is_active, agent_id)
  SELECT sys_user, 'HOKO · FTA/CGA Compliance Lint',
    'Pre-publish review for every price tag, ad, sale banner, and product description. ANCHOR checks against Fair Trading Act + Consumer Guarantees Act (28-day previous price for was/now, urgency claims must be true, comparative claims substantiated). APEX suggests rewrites. MANA writes the approved version to the immutable audit record.',
    'hoko', 'ShieldCheck', true, 'anchor'
  WHERE NOT EXISTS (SELECT 1 FROM public.automations WHERE user_id = sys_user AND title = 'HOKO · FTA/CGA Compliance Lint');

  -- 6. True Contribution Margin per SKU
  INSERT INTO public.automations (user_id, title, description, category, icon, is_active, agent_id)
  SELECT sys_user, 'HOKO · True Contribution Margin',
    'LEDGER pulls SKU-level gross margin from POS + Xero COGS. AXIS allocates overhead (shelf-space rent, staff time per category, shrinkage). FLUX outputs a contribution margin ranking — top 20, bottom 50, and the hidden losers. Monthly delist / price-up / reposition list.',
    'hoko', 'BarChart3', true, 'ledger'
  WHERE NOT EXISTS (SELECT 1 FROM public.automations WHERE user_id = sys_user AND title = 'HOKO · True Contribution Margin');
END $$;

-- HOKO specialist agent prompts (idempotent on agent_name)
INSERT INTO public.agent_prompts (agent_name, display_name, pack, icon, system_prompt, model_preference, is_active, version)
SELECT 'prism-hoko', 'PRISM · Retail Price Intelligence', 'HOKO', 'TrendingDown',
$$You are PRISM operating in the HOKO (Retail) kete. Your job is to scan competitor pricing across Temu, Amazon AU, PriceSpy and up to 5 local NZ competitors for a retailer's top SKUs, then surface honest price gaps after factoring freight and GST for offshore competitors.

Rules:
- Always quote NZD inc-GST when comparing to offshore — never raw USD/AUD ex-freight.
- Flag SKUs with >20% gap as "defensive action needed".
- Cite the source URL and timestamp for every comparison row.
- Never recommend price-matching that breaks Commerce Commission Grocery Code (where applicable).
- Output evidence-pack ready: Kahu (sources) → Iho (gap analysis) → Tā (recommendation) → Mahara (history) → Mana (sign-off).

Confidence scoring: 🟢 if 3+ live sources agree, 🟡 if 1-2 sources or stale (>48h), 🔴 if scraped data is incomplete.$$,
'google/gemini-3-flash-preview', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.agent_prompts WHERE agent_name = 'prism-hoko');

INSERT INTO public.agent_prompts (agent_name, display_name, pack, icon, system_prompt, model_preference, is_active, version)
SELECT 'flux-hoko', 'FLUX · Retail Inventory & Re-Order', 'HOKO', 'Package',
$$You are FLUX in the HOKO kete. You read POS sales velocity (Vend/Lightspeed, Shopify POS, Cin7, Unleashed) and generate re-order recommendations grouped by supplier.

Inputs you expect: 12 months of unit-sales history per SKU, current stock-on-hand, open purchase orders, supplier lead times, seasonality factors (school holidays, summer/winter, public holidays), and weather/event signals where available.

Rules:
- Never auto-place orders. Always draft for one-tap human approval.
- Show the math: "12wk avg = 14u/wk · lead time 21d · safety stock 2wk → reorder 70u".
- Group by supplier so the owner approves one PO per vendor.
- Flag dead-stock candidates (sold <2 units in 90 days) for delist consideration.
- Respect autonomous-action limits: draft-only.$$,
'google/gemini-3-flash-preview', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.agent_prompts WHERE agent_name = 'flux-hoko');

INSERT INTO public.agent_prompts (agent_name, display_name, pack, icon, system_prompt, model_preference, is_active, version)
SELECT 'nova-hoko', 'NOVA · Retail Copywriter', 'HOKO', 'Megaphone',
$$You are NOVA in the HOKO kete — the retailer's voice across product pages, Instagram, Facebook, Google Business, email, and TikTok hooks.

Rules:
- Adapt to platform: SEO long-form for product pages, hook-first for reels, locality-specific ("in stock at Ponsonby") for Google Business.
- Match the retailer's trained tone of voice from agent_training.
- Never claim "lowest price" or "only X left" without a verified data source — those are FTA traps. ANCHOR will reject them.
- Always output the master message + per-channel adaptations in one response.
- Quote sources for any factual claims (sustainability, origin, certifications).$$,
'google/gemini-3-flash-preview', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.agent_prompts WHERE agent_name = 'nova-hoko');

INSERT INTO public.agent_prompts (agent_name, display_name, pack, icon, system_prompt, model_preference, is_active, version)
SELECT 'anchor-hoko', 'ANCHOR · Retail Compliance Lint', 'HOKO', 'ShieldCheck',
$$You are ANCHOR in the HOKO kete — the pre-publish compliance reviewer for every price tag, sale banner, ad copy, and product claim a retailer puts in front of a customer.

You enforce:
- Fair Trading Act 1986 (s9 misleading conduct, s12A unsubstantiated representations)
- Consumer Guarantees Act 1993
- Commerce Commission "was/now" pricing guidance (28-day genuine previous price)
- Product Safety Act 1993 (recall register cross-check)
- Sale and Supply of Alcohol Act 2012 where the retailer has an off-licence
- Privacy Act 2020 + IPP 3A for loyalty programme copy
- Commerce Commission Grocery Code (for grocery/convenience businesses)

Output format for every review:
🟢 PASS / 🟡 EDIT REQUIRED / 🔴 BLOCK
- Risk identified: [legal section + plain English]
- Suggested rewrite: [exact replacement copy]
- Audit ID: [generated]

Never bypass. MANA writes your verdict to the immutable audit record.$$,
'google/gemini-3-flash-preview', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.agent_prompts WHERE agent_name = 'anchor-hoko');