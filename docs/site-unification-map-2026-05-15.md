# assembl site unification map — 2026-05-15

## Purpose

This document turns the scattered assembl material into a practical map for rebuilding the public site as a modern product platform, not a brochure page.

The public site should make three things obvious within seconds:

1. assembl sells governed specialist agents for Aotearoa New Zealand operators and whānau.
2. The product is organised into kete, agents, workflows, evidence packs, and human sign-off.
3. There is real depth already: app surfaces, Tōro flows, evidence verification, pilots, Supabase functions, plugin packs, and agent prompts.

## Current Reality

The current Next.js repo is the live product shell. The latest GitHub zip is a snapshot of `origin/main` at `70299fd8`, which matches the current repo baseline. This worktree also has one small readability commit on `codex/unblock-latest-pr`.

The retired/Lovable material is still valuable, but it should be treated as source material, not as the system of record. Some files are stale, some are mislabeled, and some contradict the latest plugin canon.

The separate plugin zip at `/Users/kateharland/Downloads/assembl-plugins-main.zip` matches the local `/Users/kateharland/Desktop/assembl-plugins` repo at commit `d2209fa2b6d1ecc264928feb636f820ae3e97f13`. Treat that repo as the current plugin-marketplace snapshot rather than a new divergent source.

The actual product depth already exists across:

- public marketing routes: `/`, `/kete`, `/kete/[slug]`, `/agents`, `/evidence-pack`, `/pilot-sprint`, `/pricing`, `/platform`, `/platform/hybrid-services`, `/how-it-works`, `/verify`
- authenticated/product routes: `/app/chat`, `/app/toro/[slug]`, `/app/toro/[slug]/inbox`, `/app/toro/[slug]/family`, `/app/toro/[slug]/consent`, `/app/admin/dashboard`, `/app/admin/metrics`
- proof routes and APIs: `/evidence/verify/[hash]`, `/.well-known/assembl-agent-keys`, `/app/evidence/export`, evidence pack renderer components
- product data: `lib/kete.ts`, `lib/kete-detail.ts`, `lib/agents.ts`, `lib/pricing.ts`, `lib/site-config.ts`
- plugin canon: `plugins/*`, `/Users/kateharland/Desktop/assembl-plugins`
- runtime/backend proof: Supabase migrations and functions for Tōro, agent prompts, evidence packs, routing, Stripe, Chatwoot, and agent flows

## Separate Plugin Repo Findings

The hyperagent-created `assembl-plugins` repo is useful because it names the plugin architecture more clearly than the public site. Its README says this repo is the canonical plugin marketplace and that Supabase `agent_prompts` is a runtime cache, not the source of truth.

It currently frames assembl as:

- seven industry kete: Waihanga, Manaaki, Pīkau, Arataki, Auaha, Ako, Hoko
- one core baseline plugin: `assembl-core`
- TŌRO as a separate whānau navigator, delivered through composable launch plugins rather than an industry kete

The strongest product detail in the repo is Tōro:

- `toro-term-planner`: free wedge; turns NZ school newsletters, emails, PDFs, screenshots, and photos into calendar events, payments, gear lists, permission slips, and parent alerts
- `toro-kid-money`: viral wedge; chores, photo proof, parent approval, Spend/Save/Give jars, manual bank transfer first, CDR/Open Banking later
- `toro-holiday-ideas`: school-holiday planning wedge for NZ families

Important constraints from the plugin repo that should shape marketing copy:

- Tōro talks to parents, not children.
- It never files, pays, sends, lodges, or commits without explicit human approval.
- Public copy should avoid saying "AI" where "agent", "navigator", or the concrete job is clearer.
- TSW lodgement, IRD filing, WorkSafe notification, Companies Office registration, Privacy Commissioner notification, and MPI declarations are explicitly out of scope for agents.

This plugin repo strengthens the recommendation that the public site should show real capability through kete, workflows, agents, and evidence packs, while keeping final authority with humans.

## What assembl Sells

assembl sells specialist agents that draft operational work for NZ businesses and whānau. The agents do not replace humans or file/send consequential material on their own. They draft, check, cite, route, record, and stage work for human approval.

The core sell is not "AI chat". It is:

- industry-specific workflows
- NZ legislation and policy grounding
- human review before consequential action
- evidence packs / Mana Receipts
- plugin-based expansion
- practical operator outcomes: consents, customs entries, food-safety logs, school newsletters, chores, route planning, and audit trails

## Canon To Confirm

These decisions should be treated as blockers before a full redesign, because the site currently contains contradictions.

### Kete Count

Current app has 9 kete:

- Waihanga — Construction
- Manaaki — Hospitality
- Pīkau — Freight & Customs
- Arataki — Automotive
- Auaha — Creative
- Ako — Early Childhood Education
- Mātauranga — Secondary Education
- Hoko — Retail
- Tōro — Whānau

Current external plugin repo says 7 industry kete plus TŌRO:

- Waihanga — Construction
- Manaaki — Hospitality
- Pīkau — Freight & Customs
- Arataki — Tourism & Visitor Experience
- Auaha — Creative Industries
- Ako — Education
- Hoko — Retail & E-commerce
- TŌRO — whānau navigator

Recommendation: use the current app’s 9-kete model only if Kate confirms the May 14 addition of Mātauranga as canonical. Otherwise, revert public framing to "seven industry kete + TŌRO whānau".

### Arataki

Conflict: app and agent data frame Arataki as Automotive / fleet / workshop compliance. Some audit/plugin docs frame Arataki as Tourism & Visitor Experience or governance.

Recommendation: do not redesign Arataki copy until Kate chooses one current meaning. The strongest code-backed current implementation is Automotive.

### Ako And Mātauranga

Conflict: app separates Ako as Early Childhood Education and Mātauranga as Secondary Education. Plugin docs say the old NCEA content was misclassified and that Mātauranga is greenfield until a school pilot signs.

Recommendation: keep Ako as ECE if current code remains canonical. Keep Mātauranga visible as "coming soon / school-operator pilot", not as fully live capability.

### Tōro Naming

Use Tōro in public copy. Treat Tōroa as legacy database/function naming only until migrations are renamed safely. Do not surface Tōroa in marketing.

### Pricing

Current repo pricing in `lib/pricing.ts`:

- Family: NZ$29/month, $0 setup
- Operator: NZ$1,490/month, $590 setup
- Leader: NZ$1,990/month, $1,290 setup
- Enterprise: from NZ$2,990/month, from $2,890 setup
- Pilot Sprint: NZ$5,000 + GST

Some external docs invert Operator/Leader/Enterprise monthly and setup amounts. Recommendation: treat `lib/pricing.ts` and `PRICING-SOURCE-OF-TRUTH.md` as canonical unless Kate says otherwise.

## Capability Inventory

### Waihanga

Live/deepest industry kete. Agents include Ārai, Kaupapa, Ata, Rawa, Whakaaē, and Pai. Workflows include consent prechecks, Building Act s 14B applications, producer statements, variations, SWMS, CCC bundles, BIM/plan review, and evidence pack assembly. Pilot/customer framing points to TOA Architecture.

### Pīkau

Live/deepest freight kete. Agents include Pīkau, Gateway, and Transit-Freight. Workflows include customs entries, HS classification, tariff checks, freight documentation, Customs and Excise Act grounding, and Aironaut Customs pilot material.

### Tōro

Deep product but split between legacy names and new launch bundle. Current surfaces include `/app/toro/[slug]`, inbox, family, consent, billing, mock data, Chatwoot draft approval, route planner, and older Tōroa migrations/functions. New plugin repo adds Term Planner, Kid Money, and Holiday Ideas:

- Term Planner: school newsletters into calendar, payments, gear, permission slips
- Kid Money: chores, photo proof, parent approval, manual transfer first, CDR later
- Holiday Ideas: NZ school-holiday planning

### Evidence Pack / Mana Receipt

The proof layer is a major differentiator. It should become a first-class public story and product object, not a background concept. Existing code includes evidence pack renderers, verifier routes, export route, mock receipts, citations, closing pages, and verification UI.

### Agents Marketplace

Current `/agents` has a client-side marketplace component, but the content underrepresents real capability. It should show agents grouped by kete, with live/coming-soon/pilot statuses, example outputs, legislation grounding, and links into workflows or evidence pack previews.

### Platform / Hybrid Services

`/platform` and `/platform/hybrid-services` exist and frame operator/platform value. These can become the B2B architecture layer once homepage and agents are clearer.

### Hāpai / Electrify / Kaupapa / Voyage / AAAIP

These are adjacent product or research surfaces. They should not clutter the core homepage yet. They can sit under "labs", "pilot work", or "operator tools" after the main product architecture is clean.

## Recommended Public Site Architecture

### Primary Navigation

- Kete
- Agents
- Evidence Packs
- Pilot Sprint
- Pricing
- Tōro
- Sign in

Optional secondary/footer links:

- Platform
- How it works
- Verify a pack
- About
- Contact
- Hāpai
- Electrify

### Homepage

Role: portal, not long-form brochure.

First viewport should include:

- clear headline: compliance evidence packs / governed agents for NZ operators
- primary CTA: Book a pilot
- secondary CTA: See evidence pack
- visible kete launcher: 9 kete if confirmed, otherwise seven industry kete + Tōro
- proof rail: Pearl Live counters, recent verified packs, active pilots, agent runs
- immediate links into `/kete`, `/agents`, `/evidence-pack`, `/pilot-sprint`

Avoid: seven stacked marketing sections. Use a dense product dashboard feel with cinematic imagery and visible depth above the fold.

### Kete Index

Role: choose your industry or whānau product.

Should show each kete as a product tile with:

- industry
- status: live, pilot, coming soon, greenfield, mothballed
- top workflows
- top agents
- example evidence pack
- CTA into kete page

### Kete Detail Pages

Role: industry landing pages that prove actual work.

Each kete page should have:

- specific workflow list
- agents in that kete
- legislation/check sources
- sample evidence pack
- pilot/customer status
- "start with Pilot Sprint" CTA

### Agents Page

Role: answer "what can the agents actually do?"

Use a filterable, scannable platform catalogue:

- group by kete
- live vs pilot vs scaffolded
- role, workflow, legislation, output type
- example proof artefact
- "try in chat" or "see example pack" where possible

### Evidence Pack Page

Role: make the core proof object tangible.

Should show:

- what a pack contains
- how citations, reviewer record, sign-off, and verifier work
- sample pack preview
- public verification flow
- relation to Pilot Sprint

### Pilot Sprint Page

Role: conversion page.

Keep this direct:

- NZ$5,000 + GST
- two weeks
- one workflow
- one evidence pack
- what customer supplies
- what assembl returns
- book CTA

### Tōro Page

Role: family product entry.

Separate this from B2B kete. Show:

- Term Planner
- Kid Money
- Holiday Ideas
- parent approval / no auto-send / no kid banking in phase 1
- $29/month family tier
- private beta or soft-launch CTA

## Design Direction

Use the current warm paper / pounamu / soft gold brand, but make the UI feel like a working platform.

Keep:

- warm paper background
- pounamu jade
- soft gold thread
- Cormorant Garamond for editorial headings
- Inter for dense product UI
- IBM Plex Mono for metadata/evidence details
- cinematic vessel imagery

Add:

- denser product surfaces
- visible navigation into the product
- status chips and proof counters
- live activity panels
- agent/workflow cards
- Framer Motion reveals that never hide core content on first paint
- route transitions and micro-interactions once layout is stable

Avoid:

- hidden content behind slow reveals
- oversized empty hero
- long brochure scroll
- vague "AI" claims
- generic SaaS cards with no operational proof

## Build Sequence

### Phase 0 — Canon Lock

Before a large redesign:

1. Confirm kete count and labels.
2. Confirm Arataki scope.
3. Confirm Ako / Mātauranga split.
4. Confirm pricing source of truth.
5. Confirm which Tōro agents are public now.

### Phase 1 — Product Portal Homepage

Create a new homepage that acts as a platform entry point:

- hero + CTA + proof rail
- kete launcher
- agent capability preview
- evidence pack preview
- pilot sprint conversion band

### Phase 2 — Agents And Kete Catalogue

Upgrade `/agents` and `/kete` so visitors can actually understand what exists.

### Phase 3 — Evidence Pack Proof Layer

Make evidence packs and verification feel like the core product object.

### Phase 4 — Tōro Product Surface

Create a clear Tōro page for whānau users and connect it to app surfaces.

### Phase 5 — Cleanup

Remove or quarantine stale claims, old Tōroa copy, old kete counts, and contradictory pricing references from public surfaces.

## Immediate Recommended Next Step

Ask Kate to confirm the five canon decisions in Phase 0. Then build the homepage portal branch with three reviewable commits:

1. Layout skeleton, no animation.
2. Brand styling and typography.
3. Motion and reveal polish.

Suggested branch when ready: `fix/homepage-portal-2026-05-15`.
