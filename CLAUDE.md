# assembl — agent memory

**Concept (locked 2026-07-10):** assembl is a **living business operating
system**, not an AI agent marketplace. One Business Genome per customer;
every surface (website, CRM, bookings, knowledge, agents, emails) reads it.
"Less admin. More mahi." / "assembl grows your business while you run it."

**The demo cast is FICTIONAL (locked 2026-07-10):** no real prospect has
agreed to appear, so no demo surface may name a real business or person.
Flagship vertical: "Harbourside Dog Training" / owner "Sam" (tenant key
`auckland-dog-trainer` is a legacy identifier only — never surface the old
real-world branding it once carried). All sample verticals live in
`lib/living-site/verticals.ts` + `living_site_genome`; every sample site
carries a "sample business — details fictional" strip. Keep it that way.

**Read `docs/LIVING-SITE-HANDOVER.md` before touching Living Site work** —
it carries the full state, database details, PR history, and the open list.

**Strategic direction — agentic customer journeys.** assembl creates agentic
customer journeys that understand what people need, complete the work around
them, and prove the experience is improving. "Find the friction. Assemble the
journey. Prove the result." Full strategy in `docs/assembl-context.md`; the
reusable foundation lives in `lib/journey/` (`docs/agentic-customer-journey.md`)
with the reference journey "everyday, assembled" at `/journeys/everyday-assembled`.
One `CustomerJourney` object powers the runtime, customer interface, approvals,
wait state and proof; industries reuse it by changing configuration only. The
Business Genome is the intelligence foundation; context is selected per stage
(never load the whole genome). Nothing sends/orders without a human yes; label
simulated/proposed/approval-required honestly — never claim `completed` unless
genuinely done.

**Design canon — invoke the `assembl-design` skill**
(`plugins/assembl-core/skills/assembl-design/SKILL.md`) before ANY assembl
visual, interface or copy work. Naming is lowercase `assembl` everywhere;
motion is assembly (no spinners); accent teal, gold hairlines, paper white,
graphite primaries; no canary yellow.

**Design canon (locked 2026-07-10): `docs/DESIGN-SYSTEM-VNEXT.md`.** The
short version: not a SaaS dashboard — the calmest business OS ever designed.
One primary action per screen; progressive disclosure; if a screen can lose
half its elements, remove them. Quiet editorial typography, whitespace, one
restrained accent; motion assembles (nothing pops or bounces). Human words,
no AI jargon, never expose implementation. Don't make it look like an AI
product — make it look like the future of running a business. Success
metric: "How did it already know that?"

## Invariants that bite

- `middleware.ts` splash gate rewrites every non-exempt path to `/` on
  assembl.co.nz — new public routes and asset types MUST be exempted in both
  the splash and demo-auth lists, or they silently serve the homepage/401.
- Tui splat: upright = runtime Rx(130°) `orient` on the inner group in
  `components/v2/home/TuiSplat.tsx`; the binary's "upright bake" is wrong.
- `node scripts/brand-guard.mjs` + `pnpm lint:macrons` run on build: never
  write "canary"/old gold hexes on marketing surfaces; macrons required
  (Tā, Tōro, Pīkau, Mātauranga).
- `pnpm typecheck` needs `pnpm --filter @assembl/canvas build` once first.
- `MicroLabel as=` accepts div|h2|h3|p|span only.
- Supabase (`wurwcrgxjjwqdaxqceey`): `living_site_genome` +
  `living_site_enquiries` are RLS deny-all; access only via
  `lib/supabase/service.ts` in server code, with static fallback
  (`lib/customers/auckland-dog-trainer/genome-store.ts`).
- Verify UI changes against `pnpm build && pnpm start` (prod bundle), not
  just dev — and screenshot with the preinstalled Chromium.

## Workflow

- Feature branch per effort (`claude/…`); after a PR merges, restart the same
  branch from `origin/main` — never stack on merged history.
- Demo data is SAMPLE-labelled everywhere; nothing sends without a human yes
  (draft-only is a product principle, not just copy).

## Copy rules — non-negotiable

- Every customer-facing string lives in `COPY.md` (mirrored by
  `lib/copy/homepage.ts`). Code renders strings from that manifest; you never
  author copy inline.
- You may NEVER rewrite, paraphrase, "tighten", or "improve" any string in
  `COPY.md`. If a task seems to need new or changed copy, STOP and ask Kate.
  Propose; never substitute.
- Banned everywhere, including placeholder and alt text: "quietly", "quiet
  intelligence", "seamless", "seamlessly", "effortless", "unlock", "empower",
  "elevate", "supercharge", "revolutionise", "game-changing", "cutting-edge",
  "harness the power", "take your business to the next level", "in today's
  fast-paced world", "the work that matters" as a standalone line.
- No rule-of-three cadence added for rhythm ("X, Y, and Z" repeated as
  decoration).
- NZ English spelling. Te reo Māori words keep their macrons (mahi, Tāmaki
  Makaurau, Aotearoa, mātauranga). Never add te reo as decoration; never
  generate karakia, mihimihi, pepeha or any ceremonial text.
- The tagline "Mahi that earns its proof." is fixed. Never touch it.
- Sentences must pass this test: could a reader picture the actual work and the
  time it saves? If a sentence could sit on any SaaS site, it does not belong
  on this one.
