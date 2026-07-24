# Concept preservation inventory

Per brief addition #1 (preserve before replacing). Captured 2026-07-22 from
source, before any new concept-platform work. The three existing private
outreach concepts are PRESERVED — none of the routes, components or copy
below are modified by the concept-platform build. New work is added as
sibling routes.

Access model for all three: hosted under `/customers/<slug>/…`, gated by a
per-subtree passphrase (`PilotGate` → `isPilotAuthed()` cookie), `robots:
noindex,nofollow`. `/customers/*` is already exempt from the middleware
splash gate and demo basic-auth (it carries its own gate), and is not in
`sitemap.xml`. The signed magic-link layer (`/for/[slug]`, `/demo-pass/…`,
HMAC + revocable `demo_invites`) already exists and is the reuse target for
addition #4 — do NOT build a parallel token system.

## 1. Woolworths — `everyday-rewards`

Tenant: `Everyday Rewards` / `Woolworths New Zealand` (status `concept`).

- Routes:
  - `/customers/everyday-rewards/dash` — shopper-facing pitch (layout
    `dash/layout.tsx` wraps `EdrShell`; Roboto + Cormorant + Space Mono).
    - `dash/page.tsx` — overview
    - `dash/journey/` — `JourneyPlayer.tsx` (5-step points journey, phone +
      `TrolleyMascot`)
    - `dash/wait-states/` — `WaitStatesDemo.tsx` (the six real EDR app wait
      moments as sponsored earn surfaces)
    - `dash/economics/` — `EconomicsModel.tsx` (live-editable attribution
      economics)
    - `dash/partners/` — native partners rail with the assembl slot
  - `/customers/everyday-rewards/ops/*` — operator surfaces (analytics,
    brief, campaigns, comms, compliance, liability, reconciliation,
    sponsors, tiers).
- Concept thesis (PRESERVED as-is): assembl turns the small waits already
  in the Everyday Rewards app into sponsored points-earn moments; native
  2,000-point → $15 voucher economy, never a new currency.
- Brand tokens (`lib/customers/everyday-rewards/config.ts`, verified against
  live everydayrewards.co.nz CSS 2026-07-01): orange `#fd6400`, orangeDark
  `#c65100`, orangeLight `#ffe6d1`, charcoal `#3a474e`, navy `#22303c`. Do
  NOT alter these.
- Components: `EdrShell`, `EdrNav`, `PhoneFrame`, `marks` (TrolleyMascot),
  `ui.tsx` (Container, Eyebrow, DisplayHeading, Card, Stat, OrangeButton),
  `AppSlotMock`, ops chrome + drafters.
- Honesty: everything marked "concept · pending"; silhouette/placeholder
  marks only (no real EDR/ASB logos); every tally is a demo number.

**Concept-platform note:** the existing dash is a *wait-moment attribution*
pitch. The brief's Woolworths reveal (describe the week → household context →
prepared shop → add guests → basket/budget reassemble → agent negotiation →
before/with → pilot) is a *different* concept that maps onto the real
`lib/journey/` grocery engine. The new "assembled" journey experience is
added as a sibling route and reuses the EDR brand tokens + UI kit + gate;
the wait-moments dash is untouched.

## 2. Air New Zealand — `air-nz`

- Routes: `/customers/air-nz/dash` (+ `economics`, `journey`,
  `koru-partners`, `shairpoints`, `wait-states`) and
  `/customers/air-nz/ops` (+ `revenue`). Own `airnz.module.css` +
  `ops.module.css`.
- Components (`components/customers/air-nz/`): `chrome`, `ops-chrome`,
  `JourneyDemo`, `EconomicsCalculator`, `WaitStatesExplorer`, `KoruMark`,
  `Loader`, `AppSlotMock`. Brand config `lib/brand/configs/air-nz.ts`;
  data `lib/customers/air-nz/{data,ops-data,agent}.ts`; chat route
  `app/api/customers/air-nz/chat/route.ts`.
- Signature elements to preserve: Koru mark, the airline loader, the
  wait-states explorer, Airpoints/“shairpoints” framing, revenue ops.
- Later reveal (brief): disruption → journey reorganises → useful wait
  option → declined offer → adapts → commercial model → pilot.

## 3. Contact Energy — `contact-energy`

- Routes: `/customers/contact-energy` (`page.tsx`, `layout.tsx`,
  `contact.module.css`), `/customers/contact-energy/assembling`, plus a
  public-style `app/demo/contact-energy/[[...rest]]/page.tsx`. Chat route
  `app/api/customers/contact-energy/chat/route.ts`; bill parse
  `app/api/bills/parse-email/route.ts`.
- Components (`components/customers/contact-energy/`): `chrome`, `Ledger`,
  `MatarikiLoader`, `UsageChart`, `WaitStateDemo`, `CreditsProvider`.
- Assets: `public/brand/contact-energy/` (pattern-switch.svg + README).
  Brand config `lib/brand/configs/contact-energy.ts`; data
  `lib/customers/contact-energy/{data,agent}.ts`; bills `lib/bills/data.ts`.
- Signature elements to preserve: Matariki loader, usage chart, the ledger,
  bill-explanation flow.
- Later reveal (brief): unexpected bill → weather + household context →
  drivers explained → ranked actions → vulnerable-customer safeguard →
  human handoff → avoided-effort + retention hypothesis.

## Shared journey engine (the reuse target)

`lib/journey/` — the one reusable `CustomerJourney` model + deterministic
runtime. Pure, browser-safe, test-covered.

- `types.ts` — `CustomerJourney`, `JourneyStage`, `JourneyRun`,
  `JourneyEvent`, `ProposedAction`, `EvidenceRecord`, `ProofMetric`,
  authority ladder, honest `StatusTreatment`s.
- `runtime.ts` — `startJourneyRun` → `processIntent` → `answerContext`/
  `completeContext` → `processRecommendation` → `proposeBasket` →
  `approveAction`/`rejectAction` → `completeWait` → `detectExceptions`/
  `runResolution` → `proposeSavePreferences`/`completeJourney`. Emits a full
  event timeline, proposed actions, evidence, and per-agent verifications.
- `services/{intent,plan,context,resolution}.ts` — deterministic grocery
  services (intent parse, plan/basket assembly with dietary exclusions +
  budget, context question ranking, budget/stockout resolution).
- `journeys/everyday-assembled.ts` — the reference `CustomerJourney`
  configuration + `SEED_HOUSEHOLD` (fictional beach-house weekend).
- `proof.ts`, `verification.ts`, `genome/grocery-genome.ts`, `catalogue.ts`.
- Public reference render: `/journeys/everyday-assembled` and `/experience`.

Because the runtime is pure and re-derives the plan from intent + context +
approved resolutions, a scenario change can be applied by rebuilding the run
— which is exactly what the "change one thing" and "one shared run ID"
requirements need.
