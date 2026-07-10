# assembl — agent memory

**Concept (locked 2026-07-10):** assembl is a **living business operating
system**, not an AI agent marketplace. One Business Genome per customer;
every surface (website, CRM, bookings, knowledge, agents, emails) reads it.
"Less admin. More mahi." / "assembl grows your business while you run it."
First vertical: Fred the Dog Trainer (`auckland-dog-trainer`).

**Read `docs/LIVING-SITE-HANDOVER.md` before touching Living Site work** —
it carries the full state, database details, PR history, and the open list.

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
