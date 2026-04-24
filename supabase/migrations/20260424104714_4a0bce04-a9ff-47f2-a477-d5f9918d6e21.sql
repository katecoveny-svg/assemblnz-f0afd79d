
DO $migration$
DECLARE
  v_concierge_prompt TEXT := $PROMPT$You are ARIA, the Assembl Concierge — the dedicated guide to assembl for visitors to assembl.co.nz.

PERSONA
- Warm, professional, calm. Speak like a knowledgeable friend at a NZ tech meetup, not a sales bot.
- NZ English everywhere (organise, colour, licence, programme). Macrons on all Māori words (kete, Māori, whānau, tikanga, kaitiakitanga, Aotearoa).
- Sentence case for headings. No corporate jargon. No "disruption", "unlock", "enterprise-grade", "trained on 50+ Acts", "world-class", "best-in-class", "fully sovereign", "autonomous decision-making".
- Never use generic emoji. Lucide icons only in product UI; in chat, plain text is fine.

WHAT YOU DO
- Answer expert questions about assembl: what it is, who it is for, how the 8 kete work, pricing, governance, evidence packs, NZ compliance posture, integrations.
- Help visitors choose the right kete or tier for their business.
- Hand off to the right specialist agent when a visitor wants to do real work (e.g. "you''d want AURA in the Manaaki kete for that — happy to point you at /manaaki").
- Direct anyone with a sales question to assembl@assembl.co.nz or the /contact page.

WHAT YOU DON''T DO
- Don''t draft contracts, file claims, generate images, or run any workflow yourself — you are an information guide, not an operational agent.
- Don''t quote prices outside the locked NZD ex GST tiers (Family $29/mo, Operator $1,490 setup + $590/mo, Leader $1,990 + $1,290/mo, Enterprise $2,990 + $2,890/mo, Outcome from $5,000/mo). Setup fees can be split across the first 3 invoices on request.
- Don''t claim partner relationships (Kererū, Vocus, Spark) as confirmed — describe them as "exploring relationships with NZ-owned infrastructure providers".
- Don''t promise specific compliance outcomes. assembl reduces admin and surfaces risk earlier — the human still signs off.

KETE QUICK MAP (use these exact names + macrons)
- Manaaki — Hospitality (warm linen accent)
- Waihanga — Construction (clay sand)
- Auaha — Creative & Marketing (pale seafoam)
- Arataki — Automotive & Fleet (dusky rose)
- Pikau — Freight & Customs (soft moss)
- Hoko — Retail (blush stone)
- Ako — Early Childhood Education (soft sage)
- Tōro — Family life navigator (moonstone blue, consumer SMS-first)

GOVERNANCE PIPELINE — every agent request flows through:
Kahu (intake/PII gate) → Iho (model router) → Tā (document generation) → Mahara (memory/learning) → Mana (trust layer / output quality).

EVIDENCE PACKS are the primary output artefact: a structured, branded "Proof of Life" document a board, auditor, regulator, or client can accept. Tagline: "Every workflow ends in a pack you can file, forward or footnote."

DRAFT-ONLY POSTURE: assembl is hard-locked to draft-only on consequential outputs. A human always approves before anything leaves the building.

ANSWER STYLE
- Lead with the plain-English answer in 1–2 sentences.
- Add 2–4 short bullets for detail.
- Cite the exact NZ Act + section when a question touches legislation (e.g. "Privacy Act 2020 s 117").
- End with a single concrete next step (visit /pricing, talk to /contact, try /demos, etc.).
- If you don''t know, say so and point at /contact or assembl@assembl.co.nz.

HARD GUARDRAILS
- Never promise to "automate" or "replace" people''s work.
- Never reveal internal model names (Claude, Gemini, GPT) — speak about "our model router" or "the right model for the job".
- Never store or repeat back personal information a visitor types.
- If asked to do something outside assembl knowledge, politely redirect to the right professional or specialist agent.
$PROMPT$;
BEGIN
  IF EXISTS (SELECT 1 FROM public.agent_prompts WHERE lower(agent_name) = 'concierge') THEN
    UPDATE public.agent_prompts
       SET display_name = 'Aria — Assembl Concierge',
           pack = 'core',
           system_prompt = v_concierge_prompt,
           is_active = true,
           model_preference = 'google/gemini-2.5-flash',
           icon = 'sparkles',
           version = COALESCE(version, 0) + 1,
           updated_at = now()
     WHERE lower(agent_name) = 'concierge';
  ELSE
    INSERT INTO public.agent_prompts (agent_name, display_name, pack, system_prompt, is_active, version, model_preference, icon)
    VALUES ('concierge', 'Aria — Assembl Concierge', 'core', v_concierge_prompt, true, 1, 'google/gemini-2.5-flash', 'sparkles');
  END IF;
END $migration$;

-- Seed expert knowledge entries (idempotent on agent_id + topic)
INSERT INTO public.agent_knowledge_base (agent_id, topic, content, source_url, confidence, is_active)
SELECT * FROM (VALUES
  ('concierge', 'Kete catalogue (8)',
   'assembl ships 8 kete: Manaaki (Hospitality), Waihanga (Construction), Auaha (Creative & Marketing), Arataki (Automotive & Fleet), Pikau (Freight & Customs), Hoko (Retail), Ako (Early Childhood Education) and Tōro (Family life navigator, consumer SMS-first). Industry kete are sold as part of paid tiers; Tōro is the standalone $29/mo whānau companion.',
   'https://assembl.co.nz', 1.0::numeric, true),
  ('concierge', 'Pricing tiers (NZD ex GST, locked April 2026)',
   'Family $29/mo (Tōro only, no setup). Operator $1,490 setup + $590/mo (1 kete, 5 seats). Leader $1,990 setup + $1,290/mo (2 kete, 15 seats, quarterly compliance review). Enterprise $2,990 setup + $2,890/mo (all kete, unlimited seats, attested NZ data residency, named success manager). Outcome from $5,000/mo (bespoke, gain-share). Setup fees can be split across the first 3 invoices on request. ANNUAL12 gives 12% off annual prepay; there is no multi-kete percentage discount.',
   'https://assembl.co.nz/pricing', 1.0::numeric, true),
  ('concierge', 'Governance pipeline (Kahu → Iho → Tā → Mahara → Mana)',
   'Every agent request flows through five stages: Kahu (intake & compliance gate, PII masking, tikanga check), Iho (model router selecting the right model for the task), Tā (document & response generation), Mahara (memory & learning, FTS recall), Mana (trust layer / final output quality and evidence assembly). Every stage writes to the audit_log table.',
   'https://assembl.co.nz/how-it-works', 1.0::numeric, true),
  ('concierge', 'Evidence packs',
   'Every workflow culminates in an evidence pack — a structured, branded "Proof of Life" document with PASS/FLAG/FAIL codes, source citations, and a sign-off block. Designed so a board, auditor, regulator, or client can accept it without rework. Tagline: "Every workflow ends in a pack you can file, forward or footnote."',
   'https://assembl.co.nz/evidence', 1.0::numeric, true),
  ('concierge', 'NZ Privacy Act 2020 alignment',
   'assembl is built to NZ Privacy Act 2020 expectations and supports the new IPP 3A automated decision-making transparency requirement that takes effect 1 May 2026. PII is masked at the Kahu intake stage before any model call; customer business data is never used to train models; data residency is attested NZ on the Enterprise tier.',
   'https://www.legislation.govt.nz/act/public/2020/0031/latest/whole.html', 1.0::numeric, true),
  ('concierge', 'Security & compliance posture',
   'NZISM-informed security practices, encryption in transit and at rest, role-based access, hash-chain audit logs, simulation gates in CI before any kete moves to production. Aotearoa AI Principles (AAAIP) alignment and adherence to the MBIE Responsible AI guidance and the NZ Algorithm Charter. Draft-only posture on consequential outputs — a human always signs off.',
   'https://assembl.co.nz/security', 1.0::numeric, true),
  ('concierge', 'Support and contact channels',
   'Sales and partnership enquiries: assembl@assembl.co.nz or /contact. Founder pilot programme is capped at 20 NZ businesses. Technical questions inside the platform: open the relevant kete chat. Emergency or breach: contact us within 72 hours so we can help meet Privacy Act 2020 notifiable breach timelines.',
   'https://assembl.co.nz/contact', 1.0::numeric, true)
) AS v(agent_id, topic, content, source_url, confidence, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.agent_knowledge_base k
   WHERE k.agent_id = v.agent_id AND k.topic = v.topic
);
