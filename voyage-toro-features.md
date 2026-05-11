# Voyage — Tōro features

Wow features for the **Tōro** kete (whānau / household / consumer tier).
Each one is wired to a real NZ data source, costed honestly, and
documented end-to-end. No vibes; no hallucinations; no "we'll figure
out the data later."

Tōro lives in the same governed pipeline as every other kete — Kahu →
Iho → Tā → Mana, draft-only autonomy, evidence packs — so each agent
below produces a citable artefact, not a chatty assistant reply.

The first one (**Tōro Route**) ships in this branch as a working
edge function plus a live preview page. The other eight are scoped
and ready for the build queue.

---

## A.1 — Tōro Route · Optimised route + fuel

**What it does.** Plain-language plan for the next trip: distance,
time, real fuel cost against this week's MBIE prices, and the cheaper
station nearby. One restrained sentence first; receipts underneath.

**What's shipped.**
- `supabase/functions/agent-toro-route/index.ts` — composes the
  existing `nz-fuel-prices` and `nz-routes` functions, applies vehicle
  consumption, returns the structured payload + a plain-language
  summary.
- `app/toro/route/page.tsx` + `RoutePlanner.tsx` — live preview UI
  with four preset NZ routes (school run, supermarket, weekend trip),
  four vehicle profiles (91, 95, diesel, EV).
- Wired in `supabase/config.toml` with `verify_jwt = true`.

**Data sources (today).**

| Source | What | Status | Cost |
|---|---|---|---|
| **MBIE Weekly Fuel Price Monitoring** | National-average retail prices for 91 / 95 / diesel + EV residential overnight tariff | Live — scraped weekly from `mbie.govt.nz/.../weekly-fuel-price-monitoring/` with last-known-good fallback | Free, public, no API key |
| **MapBox Directions API** | NZ road routing, traffic-aware durations, polyline geometry | Live — gated by `MAPBOX_ACCESS_TOKEN` secret, falls back to haversine × 1.35 road factor | 100k free / month |
| **Station-level prices** | "Cheapest nearby" detection | **Estimated** — uses brand-typical spread bands (Gull / Waitomo discount, Z / BP / Mobil premium) around MBIE average | Free, illustrative only |

**Data partnerships to unlock station-live pricing.**

1. **Gaspy** (community price feed) — biggest single dataset of
   per-station prices in NZ. No public API today; access via partnership
   only. The pitch is reciprocal: Tōro surfaces Gaspy as the source,
   Gaspy gets every Tōro user as a contributor. **Action:** reach
   to founders at Gaspy NZ Ltd.
2. **Direct retailer feeds** — Z Energy, BP, Mobil, Gull, Waitomo
   each have internal feeds. At Operator scale (one tradie family),
   not viable; at Pae / Crown scale (MSD foster-care fleet
   management), entirely viable. **Action:** scope a Pae-class
   contract.
3. **PriceWatch / petrolprices.co.nz scrape** — public site, scrape
   feasible but fragile and rate-limited. Acceptable bridge until 1 or
   2 lands. **Action:** spec a fortnightly scrape job with caching.
4. **MBIE retail price quarterly survey** — disaggregated by region.
   Less granular than per-station, more granular than national average.
   **Action:** add as a fallback below Gaspy.

**Future wiring.**
- **NZTA live traffic.** Free, public, congestion data for major
  routes. Pipe into the routing request so "school run leaves at 8:10
  not 8:00" gets a real ETA delta.
- **Weather adjustment.** `nz-weather` already exists; +12 minutes in
  rain on Cobham Drive is a real thing. Apply a known-routes uplift
  table.
- **EV chargers.** PlugShare and ChargeNet both have data feeds at
  varying access tiers. EV families need this badly.

**Cost envelope (per tenant).**

| Item | Per query | Monthly @ 60 trips/tenant |
|---|---|---|
| MapBox routing | $0.005 USD | $0.30 USD (~$0.50 NZD) |
| MBIE scrape | 0 | 0 |
| Edge compute | <$0.001 | <$0.10 |
| **Total** | — | **~$0.60 NZD / tenant / month** |

Generous margin against Tōro consumer pricing.

---

## A.2 — Pātaka Kai · Meal planner and shop optimiser

**What it does.** Reads what's in the fridge (photo or manual list),
checks **PaknSave / Countdown / New World** specials, plans the week's
meals around what's on sale and what the kids will actually eat,
generates the shopping list split by store for cheapest total.

**Data sources.**

| Source | Notes |
|---|---|
| **Foodstuffs (PaknSave / New World) Trading API** | Partial public access; retailer-by-retailer terms. Reliable via direct relationship — Foodstuffs has innovation team contact. |
| **Woolworths NZ (Countdown) public catalogue feeds** | RSS-style weekly specials feed; not authenticated, scrapable for catalogue data. |
| **GrocerCheck NZ** | Community-built price comparison; possible aggregator partner. |
| **Image classification (fridge photo)** | Anthropic Claude vision or Google Gemini Flash. Local-only inference also feasible (Apple Vision framework on iPhone) for privacy-first option. |
| **Te reo + tikanga kai overlay** | Iwi-authored kai library (Matariki kai, hāngī, manaakitanga of visitors). Must be partnership-led. |

**Evidence pack.** Weekly meal plan + reconciled shopping receipt
(via Akahu open-banking transaction match) becomes a sealed pack:
*Pātaka Kai · Wiki o Mei 11*.

**Surprise moment.** First Sunday of school holidays — Pātaka auto-
adjusts to lunch-at-home for five days and pings the household.

---

## A.3 — Wā Kuihi · Personalised homework companion

**What it does.** Per-child study plan aligned to **Te Marautanga o
Aotearoa** or the **NZ Curriculum**. Voice-mode for tamariki under 10.
Sunday-evening parent brief: *"this week Aroha is working on fractions;
here's where she's stuck."*

**Data sources.**

| Source | Notes |
|---|---|
| **NZC + TMoA** | Published, free, well-structured. The curriculum maps to year levels and achievement standards cleanly. |
| **Khan Academy NZ alignment** | KA has open content with NZ-curriculum tagging. |
| **The child's own work** | Photos of homework, worked examples, teacher comments — held in the tenant's IKB. |
| **Schoolbox / Hero / Edge LMS feeds** | Many NZ schools publish parent-facing feeds via these LMSes. Read-only. |

**Privacy posture.** Children under 16 are not direct users. The
parent (the named operator) is the user; the AI never speaks to the
child without a parent in the loop. This is hard-coded in the system
prompt.

**Surprise moment.** Two weeks before an NCEA internal — auto-generated
revision plan, calibrated to where the child has been struggling.

---

## A.4 — Hauora Whānau · Household wellness cadence

**What it does.** Coordinates GP visits, vaccinations, dental,
optometry across the household. Plays nicely with **My Health Account**
(Te Whatu Ora's citizen portal). Surfaces overdue appointments before
the school medical form is due.

**Data sources.**

| Source | Notes |
|---|---|
| **My Health Account (Te Whatu Ora)** | Citizen-side, RealMe-authenticated. Read-only access via the consumer's own log-in — the agent reads with explicit consent each session. |
| **NZ Immunisation Schedule (MoH)** | Public, well-structured. Age-by-age recommended immunisations. |
| **Plunket WellChild milestones** | Public schedules through to age 5. |
| **Practice management system feeds** | Where the family GP uses Medtech / MyPractice, parent-facing portals exist; OAuth-ish read-only access feasible. |

**Sensitive data.** Health data is SENSITIVE-classified under the
**Health Information Privacy Code 2020**; Kahu's tier-gate enforces
that this data never crosses tenant boundary or leaves NZ.

**Surprise moment.** A WellChild Plunket check is due in three weeks;
the slot at the nearest clinic on the day that works for the parent
is auto-suggested.

---

## A.5 — Pūtea Whānau · Household finance coach

**What it does.** Continuous financial-life coaching for the whole
household. WFF reconciliation, KiwiSaver projection, debt trajectory,
insurance-gap scan. Monthly Financial-Life statement as a sealed pack.

**Data sources.**

| Source | Notes |
|---|---|
| **Akahu Open Finance** | NZ's open-banking provider. Read-only bank feeds across every major NZ bank. Consent expires every 90 days; explicit re-consent required. **The single biggest unlock for Tōro finance.** |
| **IRD MyIR API** | Official, scoped, OAuth-style consent. WFF, child support, IR3 status. |
| **MSD MyMSD feed** | Benefit status, applications in progress. |
| **MAS / Cigna / Tower / nib insurance feeds** | Insurance-specific; partnership-led. |
| **KiwiSaver provider APIs** | All major providers (ANZ, ASB, Booster, Fisher Funds, Generate, etc.) expose member portals; the AI reads where the household has consented. |

**Evidence pack.** *Tūāpapa Pūtea · Monthly Financial-Life Statement* —
already specced as one of the six hybrid-services archetypes.

**Surprise moment.** Tax position swung > $2k over the quarter; the
agent drafts the IR3 amendment, queues for parent approval.

---

## A.6 — Manaaki Tāone · Community connector

**What it does.** Finds the local stuff that's hard to discover —
kai-share, te reo classes, kura kaupapa, library events, free
school-holiday programmes — near you, cross-referenced against your
calendar, the weather, and what your kids actually like.

**Data sources.**

| Source | Notes |
|---|---|
| **Auckland Transport events feed** | Public, RSS + JSON. |
| **Wellington City Council / Christchurch City Council** | Similar feeds. |
| **Eventfinda NZ API** | Partial public access. |
| **RNZ event listings** | Cultural / arts events. |
| **Toi Māori Aotearoa + iwi-authored event registers** | Partnership-led; not aggregated anywhere public. |
| **Library events** | Auckland Libraries, Wellington City Libraries, etc. all publish JSON event feeds. |

**Surprise moment.** Te Wiki o Te Reo Māori is two weeks out; the
agent surfaces three local activities the whānau hasn't attended
before, ranked by what the kids picked last year.

---

## A.7 — Whakapapa Keeper · Family memory

**What it does.** Helps gather, store, and pass on whakapapa.
Birthday and anniversary reminders. **Bedtime story mode** reads
ancestor stories aloud to the kids (voice via ElevenLabs or local
TTS) — only stories the whānau has uploaded and consented to share.

**Data sources.**

| Source | Notes |
|---|---|
| **Whānau-uploaded content** | Stories, photos, names. The whānau owns it; never used to train models. |
| **Papers Past (National Library)** | Public archive of NZ newspapers — for the "great-great-grandfather mentioned in the 1925 *Auckland Star*" moments. |
| **Te Ara — Encyclopaedia of New Zealand** | Iwi histories, regional history. |
| **iwi.nz / mihi tools** | Partnership-led; some iwi maintain registers. |

**Privacy posture.** Children's data is sacred. The whakapapa is
stored end-to-end encrypted; only the family can ever decrypt it.
This is one of two Tōro features that demands a **single-tenant
encrypted vault** rather than the shared Postgres.

**Surprise moment.** Matariki — the agent assembles the year's
photos and surfaces them as a family scrapbook for printing.

---

## A.8 — Tōkihi · Calendar conductor

**What it does.** The smart family calendar. Two parents, three kids,
four schools, six clubs. Detects clashes and pings the person whose
turn it actually is. Auto-blocks NZ school terms and public holidays.

**Data sources.**

| Source | Notes |
|---|---|
| **Google Calendar API** | OAuth-scoped, read/write. |
| **Apple iCloud Calendar (CalDAV)** | Read-only via CalDAV — works with personal Apple IDs. |
| **Outlook / Microsoft 365** | OAuth-scoped. Many NZ workplaces use this. |
| **MoE term-date publications** | Public, all four terms for every year. |
| **Public Holidays NZ** | `date.nager.at` or `publicholidays.co.nz` — free, JSON. |

**Surprise moment.** Two parents both have a 6pm work thing on
Thursday — the agent picks up the conflict at 7am Thursday morning
and asks who's covering the kids before lunch happens.

---

## A.9 — Whakaata Whānau · The Sunday brief

**What it does.** One restrained note at 7pm Sunday: three things the
household needs to know for the week. Who's on the school run, who's
paying for what, what the weather looks like, what's in the fridge.

**Data sources.** Composes from all of A.1–A.8 + `nz-weather`.

**Surprise moment.** The whole feature *is* a surprise moment. This
is the weekly arrival the family looks forward to.

---

## Build order

In ranked priority (highest user-felt-value per engineering hour):

1. **A.1 Tōro Route** — shipped in this branch.
2. **A.8 Tōkihi (calendar)** — three weeks, mostly OAuth wiring. The
   calendar conductor is the gateway agent the family actually opens
   first.
3. **A.5 Pūtea Whānau (finance)** — already mostly built; needs
   Akahu consent flow + UI.
4. **A.9 Whakaata Whānau (Sunday brief)** — composes A.1/A.5/A.8 +
   weather. Two weeks once 2/3 land.
5. **A.2 Pātaka Kai (meal + shop)** — gated by Foodstuffs +
   Woolworths partnership conversations.
6. **A.4 Hauora Whānau** — gated by My Health Account consent flow.
7. **A.3 Wā Kuihi (homework)** — gated by school LMS conversations
   that take time.
8. **A.6 Manaaki Tāone (community)** — small, ship anytime.
9. **A.7 Whakapapa Keeper** — needs the encrypted vault first.

---

## The big unlocks worth pursuing separately

Three integrations move the needle disproportionately for Tōro and
deserve their own partnership conversations:

1. **Akahu Open Finance.** The single unlock for finance, debt,
   insurance, KiwiSaver. NZ-built, sovereignty-aligned, founder-led.
   Should be a 30-minute call.
2. **Gaspy.** The single unlock for live-station fuel prices.
   Reciprocal pitch — they get every Tōro user as a contributor.
3. **My Health Account (Te Whatu Ora).** Health is the most
   information-dense, emotionally-charged household domain. This is
   a Pae-class conversation (voyage-government-navigators.md), not
   a Tōro-class one — but Tōro inherits when Pae lands it.

These are the three doors. If they open, Tōro becomes the
indispensable family OS rather than a useful set of widgets.
