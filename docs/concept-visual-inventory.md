# concept visual inventory (preserve before replacing)

_Addition #1 of the private-concept brief. A durable record of the existing,
strong concept microsites **before** any change, so their exact layouts, motion,
copy and reusable components are preserved rather than approximately recreated._

**Preservation rule:** the surfaces below are **not deleted, moved or degraded**
by the private-concept platform work. The new private-concept renderer is
**additive** (new routes). Any reuse imports the existing components; it does not
reimplement them.

## Everyday Rewards (Woolworths NZ)

- **Routes (preserved):** `/customers/everyday-rewards` (gate), `/dash` (hub),
  `/dash/{partners,economics,journey,wait-states}`, `/ops/*` (sponsors,
  compliance, reconciliation, liability, tiers, comms, campaigns, analytics,
  brief).
- **Components (preserved):** `EdrShell`, `EdrNav`, `PhoneFrame`, `AppSlotMock`,
  `marks.tsx` (`RLeafMark`, `ConceptBadge`, `CrossBrandLockup`, `TrolleyMascot`,
  `Watermark`), `ui.tsx`, `OpsCommsDrafter`, `OpsLiabilityModel`,
  `OpsSponsorsBoard`, `ops-chrome.tsx`.
- **Signature motion:** `dash/wait-states/WaitStatesDemo.tsx` (spinner→earn card
  loop), `dash/journey/JourneyPlayer.tsx` (points-accrual journey).
- **Brand tokens:** `lib/customers/everyday-rewards/config.ts` — `EDR_BRAND`
  orange `#fd6400`, navy `#22303c`; concept watermark "concept · pending".
- **Gating:** `PilotGate` (password/pilot) + `layout.tsx` `robots: noindex`.

## Air New Zealand

- **Routes (preserved):** `/customers/air-nz/dash` (+ `shairpoints`, `economics`,
  `wait-states`, `journey`, `koru-partners`), `/customers/air-nz/ops/*` (revenue,
  sponsors, compliance, loyalty, brief, comms, campaigns, analytics).
- **Components (preserved):** `chrome.tsx`, `KoruMark`, `Loader.tsx` (loader
  modes `koru | plane | progress | oscar`), `JourneyDemo`, `WaitStatesExplorer`,
  `EconomicsCalculator`, `CommsDrafter`, `SponsorsBoard`, `AppSlotMock`,
  `ops-chrome.tsx`.
- **Signature motion:** `Loader.tsx` (koru/plane), `WaitStatesExplorer`,
  `JourneyDemo` (disruption→recovery).
- **Brand tokens:** `lib/customers/air-nz/data.ts` — `AIR_NZ_BRAND` Ocean Teal
  `#00B0B9` / deep `#00838C`, ink `#111111`. Programme **Koru**; currency
  **Airpoints Dollars `A$xx.xx`** (never "koru points"). No live Air NZ APIs.
- **Gating:** `dash/layout.tsx` + `ops/layout.tsx` gates.

## Contact Energy

- **Routes (preserved):** `/customers/contact-energy`, `/customers/contact-energy/assembling`.
- **Components (preserved):** `chrome.tsx`, `MatarikiLoader`, `UsageChart`,
  `Ledger`, `WaitStateDemo`, `CreditsProvider`.
- **Signature motion:** `MatarikiLoader.tsx`, `UsageChart` (usage animation),
  `WaitStateDemo`.
- **Brand tokens:** `lib/customers/contact-energy/data.ts` — `CONTACT_BRAND` red
  `#E62A32` / CTA `#D91C24`, ink `#303030`, paper `#F9F8F8`. Programme context:
  **Contact31+**. Verified from contact.co.nz.
- **Gating:** `layout.tsx` gate.

## Outreach one-pager palette (Kate's `build.py`, separate from in-repo tokens)

The pitch one-pagers use a slightly different accent set (EDR `#EE7623`, Contact
`#E4001B`, Air NZ `#00B8A9`) on cream `#FBFAF6` with champagne `#BFA37A`. The
**private concept surfaces use the verified in-repo brand tokens above** (the
"beautiful existing" brand); the one-pager palette is for print/QR only.

## Screenshot note

The dash/ops surfaces are pilot-gated (`PilotGate` / basic gate), so headless
screenshots return the gate, not the content. This source-level inventory is the
authoritative preservation record; to capture pixels, run `pnpm start`, pass the
pilot gate locally, and screenshot the routes listed above.
