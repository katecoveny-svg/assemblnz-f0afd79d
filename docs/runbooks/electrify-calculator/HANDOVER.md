# HANDOVER: Electrify NZ — SME Switch-to-Electric Calculator

**Owner:** Kate Hudson, Assembl Ltd
**Build target:** Claude Code (with HyperAgent assist)
**Timeline:** Ship a working v1 in 3–5 days
**Repo:** Create new branch `feature/electrify-calculator` off main in the main Assembl Next.js repo. Do NOT spin up a new repo — this lives at `assembl.co.nz/electrify`.
**Stack:** Next.js (App Router) + Supabase + Tailwind + Whenua palette. Same stack Kate already uses.

---

## 1. Why this exists (read this first)

Mike Casey (CEO of Rewiring Aotearoa, the electric-cherry-orchardist) is on a national speaking tour. His charity has proven NZ has hit the "electrification tipping point" — running electric machines is now cheaper over their lifetime than running fossil fuel ones, even with finance costs included.

The headline numbers Mike is putting in the public sphere:
- NZ spends ~$55M/day ($20B/yr) on fossil fuels, mostly imported
- 10 million fossil fuel machines in NZ, 8.5M ready to electrify today
- Households save $1,500/yr at current rates, $4,500/yr with cheap finance
- Combined national opportunity: $10.7B/yr by 2040

**What exists already:** Rewiring Aotearoa has a household calculator at calculate.rewiring.nz.
**What does NOT exist:** A calculator for NZ small businesses. This is the gap.

This tool is Assembl's lead magnet into the freight (PIKAU), automotive/fleet (ATATAKI), construction (WAIHANGA), and hospitality (MANAAKI) ketes. It is also the door-opener for a partnership conversation with Rewiring Aotearoa.

**Success looks like:**
1. An SME owner fills it in in under 90 seconds on a phone
2. They get a credible TCO comparison, payback period, and a "what to switch first" sequence
3. They give us their email to download a branded PDF
4. They see a soft CTA to "talk to ARATAKI/PIKAU about executing this"

---

## 2. Scope — what's in v1, what's not

### IN scope for v1
- Single-page form, mobile-first, 6–8 questions max
- Server-side TCO calculation using a deterministic model (NOT an LLM call — this needs to be reproducible and defensible)
- Results page with: 10-year TCO comparison chart, annual savings $, payback period, CO2e reduction, recommended switch sequence
- Email capture → branded PDF via Supabase Edge Function
- Soft CTA to Assembl ARATAKI / PIKAU / WAIHANGA / MANAAKI agent based on the business type the user selected
- Data source attribution to Rewiring Aotearoa, EECA, MBIE (this is non-negotiable — credit the underlying research)
- Tikanga compliance check on all copy (use the tikanga-compliance skill — no banned terms, no "AI" in customer copy, use "intelligent automation")

### OUT of scope for v1 (don't build these yet)
- Live integration with Xero for actual fuel/energy spend (v2)
- Solar quote integration with installers (v2)
- Bank finance pre-approval (v2)
- Login/account creation — just email capture
- Spanish/te reo toggle (v2, but ALL copy must already pass macron and tikanga checks)
- Agent chat embed — soft CTA only in v1

---

## 3. The data model (this is the most important part)

Calculations must be defensible. Source every number. Store the assumptions in a single `config/electrification-assumptions.ts` file so they can be updated as Rewiring Aotearoa publishes new data.

### Required input fields (the form)

| Field | Type | Options | Required |
|---|---|---|---|
| `businessType` | enum | hospitality / construction / freight / retail / automotive_fleet / creative / ece / professional_other | yes |
| `region` | enum | Auckland / Waikato / BoP / Wellington / Canterbury / Otago / Southland / Northland / Other | yes |
| `monthlyFuelSpend` | number (NZD) | range: 0–50,000 | yes |
| `fuelType` | multi-select | petrol / diesel / lpg / natural_gas / coal | yes |
| `vehicleCount` | number | 0–50 | yes |
| `vehicleType` | enum | passenger / light_commercial / heavy_commercial / mixed | conditional on vehicleCount > 0 |
| `premisesType` | enum | own_freehold / lease_long_term / lease_short_term | yes |
| `rooftopSolarSuitable` | boolean + "unsure" | y/n/unsure | yes |
| `monthlyElectricitySpend` | number (NZD) | 0–20,000 | yes |
| `email` | string | — | required only at PDF download step |

### Calculation outputs

```typescript
type ElectrificationResult = {
  annualSavingsCurrent: number;       // savings at 5.5% finance
  annualSavingsCheapFinance: number;  // savings at 1% (Green loan) finance
  paybackYears: number;
  tenYearSavings: number;
  co2eAvoidedTonnes: number;
  upfrontCapexEstimate: number;
  recommendedSequence: SwitchStep[];  // ordered list of what to switch when
  solarRecommendation: SolarRec | null;
  confidence: 'high' | 'medium' | 'low'; // based on how much input data we got
  assumptionsUsed: string[];          // for the PDF footer — full transparency
};

type SwitchStep = {
  order: number;
  machine: string;             // "Replace 1x diesel ute with EV"
  estimatedCapex: number;
  estimatedAnnualSaving: number;
  paybackYears: number;
  rationale: string;           // one-line explanation
};
```

### Key formulas (v1, deterministic, no LLM)

These are simplifications of the Rewiring Aotearoa methodology. Source every constant in `config/electrification-assumptions.ts`.

```typescript
// Vehicle TCO comparison (per vehicle, per year)
// Petrol/diesel:    annual_fuel_cost = (annual_km / fuel_economy_l_per_100km / 100) * fuel_price_per_litre
// EV equivalent:    annual_energy_cost = (annual_km * kwh_per_km) * electricity_price_per_kwh
// Maintenance delta: EV maintenance ~ 40% of ICE maintenance (Rewiring Aotearoa figure)

// Fuel constants (UPDATE these from MBIE quarterly):
const FUEL_PRICES_NZD_PER_LITRE = { petrol: 2.85, diesel: 2.20 }; // CHECK current MBIE data at build time
const ELECTRICITY_PRICE_NZD_PER_KWH = { grid_avg: 0.32, solar: 0.12 };
const EV_EFFICIENCY_KWH_PER_KM = { passenger: 0.18, light_commercial: 0.28, heavy: 0.95 };
const ICE_EFFICIENCY_L_PER_100KM = { passenger: 8.0, light_commercial: 11.0, heavy: 35.0 };
const ANNUAL_KM_DEFAULT = { passenger: 14000, light_commercial: 25000, heavy: 60000 };

// Process heat / space heating (gas -> heat pump)
// Rewiring Aotearoa: heat pumps are ~4x more efficient than gas
// So: new_energy_cost = (old_fuel_cost * fossil_fuel_efficiency) / heat_pump_cop
// Use COP of 3.5 as conservative default

// CO2e emissions factors (kg CO2e per unit)
const EMISSIONS_FACTORS = {
  petrol_per_litre: 2.31,
  diesel_per_litre: 2.68,
  natural_gas_per_kwh: 0.20,
  lpg_per_kg: 2.94,
  nz_grid_electricity_per_kwh: 0.073,  // NZ grid is ~88% renewable
};

// Capex estimates (NZD, conservative 2026 figures, UPDATE annually):
const CAPEX_NZD = {
  ev_passenger: 55000,
  ev_light_commercial: 75000,
  ev_heavy_truck: 220000,
  heat_pump_hot_water: 5500,
  heat_pump_space_heating_per_room: 3500,
  induction_cooktop_commercial: 8000,
  rooftop_solar_per_kw_installed: 1800,
  battery_per_kwh_installed: 1100,
};
```

**IMPORTANT:** Do NOT make these up. At build time, web-search MBIE for current fuel prices, EECA for current heat pump efficiency, and check Rewiring Aotearoa's published reports for the latest figures. If a number can't be sourced, flag it as `low` confidence and surface that in the UI.

### Recommended switch sequence logic

Per the Machine Count report, prioritise by:
1. **Highest emissions reduction per $ spent** (this is roughly: vehicles first, then process/space heat, then hot water, then cooktops)
2. **Shortest payback period**
3. **Lease vs own** — if user leases short-term, deprioritise capex-heavy fixed installations

Output should be an ordered list of 3–5 actions, each with a year recommendation ("Year 1", "Year 2", etc.).

---

## 4. File structure to create

```
src/
  app/
    electrify/
      page.tsx                      # the form
      results/
        page.tsx                    # the results display
      api/
        calculate/
          route.ts                  # POST endpoint, runs the deterministic calc
        generate-pdf/
          route.ts                  # POST endpoint, generates branded PDF
        capture-lead/
          route.ts                  # POST endpoint, writes to Supabase + sends email
  components/
    electrify/
      ElectrifyForm.tsx             # the 6–8 question form
      ResultsCard.tsx               # the TCO comparison block
      SwitchSequence.tsx            # ordered list of recommended switches
      EmailCaptureModal.tsx         # the "get the PDF" modal
      AttributionFooter.tsx         # credits Rewiring Aotearoa, MBIE, EECA
  config/
    electrification-assumptions.ts  # ALL constants live here
  lib/
    electrify/
      calculator.ts                 # the deterministic calculation logic
      sequence-builder.ts           # builds the recommended switch sequence
      pdf-generator.ts              # uses @react-pdf/renderer
supabase/
  migrations/
    YYYYMMDD_electrify_leads.sql    # leads table + RLS policy
```

### Supabase table

```sql
create table public.electrify_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text not null,
  business_type text not null,
  region text not null,
  monthly_fuel_spend numeric,
  monthly_electricity_spend numeric,
  vehicle_count int,
  fuel_types text[],
  premises_type text,
  rooftop_solar_suitable text,
  calculated_annual_savings numeric,
  calculated_payback_years numeric,
  calculated_co2e_tonnes numeric,
  recommended_agent text,  -- 'ARATAKI' | 'PIKAU' | etc.
  utm_source text,
  utm_campaign text
);

alter table public.electrify_leads enable row level security;

-- Inserts only via service role from the API route. No public read.
create policy "service_role_insert_only" on public.electrify_leads
  for insert with check (false);
```

The API route writes using the service role key, never the anon key.

---

## 5. Brand and tikanga rules (do NOT skip this section)

This is the bit Claude Code most often misses. Read it twice.

### Whenua palette (the ONLY colours)
- Kōwhai Gold `#D4A843` — primary CTAs, highlight numbers
- Pounamu Teal `#3A7D6E` — secondary, "good" signals (savings, positive deltas)
- Tāngaroa Navy `#1A3A5C` — headlines and the dark mode body bg
- Page bg `#09090F` (dark) or Bone `#F5F0E8` (light)

**Banned:** neon greens, neon pinks, neon blues. If you see `#00FF88`, `#FF2D9B`, `#00E5FF` in any output, delete and restart that section.

### Fonts
- Headings: **Lato 300, UPPERCASE** with letter-spacing
- Body: **Plus Jakarta Sans**
- Numbers / code: **JetBrains Mono**

### Copy rules (these are hard rules, not preferences)
- NEVER use the word "AI" in any user-facing copy. Use "intelligent automation," "system," or "platform."
- Use NZ English (organisation, not organization; tonne, not ton)
- Use macrons correctly on Māori words (Māori, Aotearoa, kōwhai, etc.)
- Don't use buzzwords ("synergy", "leverage", "revolutionary"). Be direct.
- Never claim certainty where there isn't any — surface the `confidence` field in the UI

### Required attribution footer (verbatim)
> This calculator uses publicly available data from Rewiring Aotearoa, MBIE, and EECA. Savings estimates are based on the methodology in Rewiring Aotearoa's *Electric Homes* and *Machine Count* reports, adapted for small businesses. This is a guide, not financial advice. Every business is different — talk to an electrician, accountant, and your bank before making capital decisions.

---

## 6. The build order (3–5 day plan)

### Day 1 — Spec lock and data source verification
- Read this handover end-to-end
- Web-search current MBIE fuel prices and update `electrification-assumptions.ts`
- Pull the latest Electric Homes report PDF and verify the key constants
- Write the Supabase migration and run it locally
- Build the `calculator.ts` pure function with unit tests (this is the hardest part — do it first, with tests)

### Day 2 — Form and results page
- Build `ElectrifyForm.tsx` — mobile-first, 6–8 questions, single page with progress dots
- Build `ResultsCard.tsx` and `SwitchSequence.tsx`
- Wire up the `/api/calculate` route — pure server-side, no LLM calls

### Day 3 — PDF, email capture, lead routing
- Build the branded PDF template using `@react-pdf/renderer`
- Wire up `/api/capture-lead` to write to Supabase
- Wire up `/api/generate-pdf` to return a downloadable PDF
- Add email sending via Resend (or whatever Kate's already using)
- Route the lead to the right kete agent based on `businessType`

### Day 4 — Polish, tikanga check, accessibility
- Run the tikanga-compliance skill on every piece of copy
- Run the elite-copywriter skill on the headlines and CTAs
- Test on a real iPhone in portrait
- Lighthouse: aim for >90 on mobile performance
- Add OpenGraph tags and a meta description for `/electrify`

### Day 5 — Soft launch
- Deploy to Vercel preview, share preview URL with Kate
- Add to the Assembl sitemap
- Send Kate the cold-email draft for Mike Casey (separate task)
- Write the LinkedIn post announcing the tool

---

## 7. What to ask Kate before starting

Before you start coding, ask Kate (one message, three questions max):

1. **Do you want the lead capture email to go to your address, or should it route to the relevant kete agent's inbox?**
2. **Are you OK with us using Resend for transactional email, or do you already have something set up in Supabase?**
3. **Do you want the soft CTA at the bottom of the results page to say "Book a 15-min call" (links to Cal.com / your calendar) or "Get matched with a specialist" (which would route to the agent based on business type)?**

If she doesn't reply in 4 hours, default to: her email, Resend, and "Book a 15-min call."

---

## 8. Stretch goals (only if v1 ships ahead of schedule)

- Programmatic SEO: spin up `/electrify/[business-type]` pages for hospitality, freight, construction, retail, automotive — each with a niche-specific intro and pre-filled examples. This is where the SEO juice lives.
- Embed a "live" $55M/day counter at the top of the page (ticker that increments fossil fuel spend in real time). This is pure attention-bait but works.
- Add an "Email this to my accountant" share button on the results page.

---

## 9. Do NOT do these things

- Do NOT call an LLM in the calculator path. The math must be deterministic and auditable.
- Do NOT skip the tikanga-compliance and elite-copywriter skills on any user-facing copy.
- Do NOT use neon colours. Whenua palette only.
- Do NOT use the word "AI" in customer-facing copy.
- Do NOT hardcode email addresses or API keys — use Supabase secrets.
- Do NOT make up numbers. If you can't source a number, mark the calculation as `low` confidence and surface that.
- Do NOT collect personal data beyond email and business type without an explicit consent checkbox. IPP 3A (NZ Privacy Act, effective 1 May 2026) applies.
- Do NOT publish to production without Kate's sign-off on a Vercel preview first.

---

## 10. Definition of done

A user on an iPhone can:
1. Land on `/electrify`
2. Answer 6–8 questions in under 90 seconds
3. See their estimated annual savings, payback period, CO2e reduction, and a 3–5 step switch sequence
4. Enter their email and download a branded PDF
5. See a soft CTA pointing them at the right kete agent

And in Supabase:
1. A row has been written to `electrify_leads` with all the relevant fields
2. The lead has been routed to the right inbox
3. Kate can see the row in her Supabase dashboard

When all 8 of those items are working on a Vercel preview, ship it.

---

## Appendix A — Cold email draft for Mike Casey

Use this AFTER the calculator is live on a preview URL. Send from Kate's address.

Subject: A small business version of your electrification calculator

Kia ora Mike,

I'm Kate Hudson, founder of Assembl — an Auckland operations platform built for NZ SMEs.

I caught your EV Quest interview and the Electric Homes / Machine Count work has been on my mind ever since. The $55M/day number is the kind of fact that should be on every small business owner's fridge.

We've built a small-business version of your calculator at [PREVIEW_URL]. It takes 90 seconds and gives a tradie, café owner, freight broker or fleet operator a TCO comparison, payback period, and a "what to switch first" sequence. All numbers source-credited to Rewiring Aotearoa, MBIE, and EECA.

This is a free public tool — we'd love your thoughts on the methodology before we promote it widely. If it's useful, we'd also love to talk about whether Assembl could be the execution layer for the SMEs your reports identify (we already have automotive/fleet and freight/customs pilots running).

Happy to come to you. Auckland-based but on a plane to Wānaka any time.

Ngā mihi,
Kate

---

## Appendix B — Source links to read before coding

- Rewiring Aotearoa Electric Homes report: https://www.rewiring.nz/electric-homes-report
- Rewiring Aotearoa Machine Count: https://www.rewiring.nz/machine-count
- Rewiring Aotearoa household calculator (for reference, not to copy): https://calculate.rewiring.nz
- Mike Casey on EV Quest: https://podcasts.apple.com/ua/podcast/how-nz-can-slash-energy-bills-mike-casey-of-rewiring/id1614097185?i=1000737969501
- MBIE fuel prices (check at build time): https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/oil-statistics

END OF HANDOVER
