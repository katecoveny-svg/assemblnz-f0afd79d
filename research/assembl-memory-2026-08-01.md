# assembl Memory Log
**Last updated:** 1 August 2026
**Session focus:** Strategy (targets, verticals, outreach) → demo fleet audit and repair → building the assembl visual + motion + 3D system → rolling it to 18 demos → NZ/AU evidence figures

*Companion file: `HANDOFF-2026-08-01.md` — read that first for the operational state.*

---

## 🔑 KEY DECISIONS

**DECISION: Materials map to verticals** — brass = retirement + insurance (proof, receipts, the thing kept); chrome = motor, aviation, construction, logistics (manufactured); ink = lending + energy (liquid, still resolving) — **WHY:** the object on a page should mean something about that trade, not be a generic shape. Kate approved.

**DECISION: Ink gets a paper ground, metals get the dark studio** — **WHY:** dark liquid ink rendered on a near-black box is invisible. Learned on Sharesies when the ledger form appeared as grey smears. Encoded as `GROUND` in roll-system.mjs.

**DECISION: The mosaic pattern is ~70% negative space, one voice + two accents** — brand colour carries the field, ink punctuates, brass appears ~2 tiles in 100 — **WHY:** the first build filled two-thirds of the field with four colours and read as a patchwork quilt.

**DECISION: The mosaic assembles and then STOPS** — one tile turns over every few seconds, nothing else — **WHY:** a pattern that keeps churning is decoration, and decoration breaks the design constitution §11.

**DECISION: The homepage gets refined, never redesigned** — its cinematic three.js scene stays; only the hero headline word-assembly was added — **WHY:** Kate's own design constitution says so for the live site, and the homepage already IS the standard.

**DECISION: No unsolicited concept pages from here** — concepts are demos attached to a named buyer, not deliverables — **WHY:** ~20 built, none converted; it positions assembl as a design studio (project fees) rather than a software company (recurring revenue).

**DECISION: Discovery is priced at $25–50k, not $5k** — **WHY:** below enterprise procurement's seriousness threshold; a cheap pilot raises suspicion rather than lowering risk.

**DECISION: Demo on our stack, deploy in theirs** — assembl runtime deployable into the customer's own cloud tenancy, no customer data egressing to assembl — **WHY:** no enterprise will let a solo NZ vendor hold their transaction data; this turns the biggest procurement weakness into the differentiator.

**DECISION: Nectar Money is target #1, Oceania #2** — **WHY:** Nectar is a warm intro with a wait-shaped product and the FMA regulatory handover as urgency; Oceania has $227m unsold stock, a brand-new CSMO role, and no agentic incumbent in the category.

---

## 🔧 TECHNICAL STATE

**The system** (`research/_generator/`): `assembl-system.css` (layout/scale), `assembl-motion.css` + `.js` (9 primitives), `assembl-cloud.js` (three.js r144, 5 materials × 14 forms), `assembl-mosaic.js` (generative, seeded), `roll-system.mjs` (idempotent applier). ✅ ALL VALIDATED.

**18 demos**: system applied locally — pinned assembly stage, brand mosaic, ANZ evidence band, closing beat, per-element motion (60–75 `data-m` per page). ⚠️ **NOT YET DEPLOYED** — one command pending in the handoff.

**The lab** — `assembling-lab.pages.dev` LIVE. The showcase Kate liked. ⚠️ Production branch is `assembling-lab`, not main.

**Homepage** — branch `claude/homepage-motion-system`, UNCOMMITTED. One change: hero headline assembles word by word (`AssembleType.tsx`). Build passes clean (canvas → macrons → brand-guard → next build).

**Agents** — all on `claude-opus-5` with keys bound across the fleet.

**`assembl-rhythm.css`** — EXISTS but NOT SHIPPED. It was the mistake (see corrections). Delete or rebuild per-page.

**Giltrap** — still blocked: signing queue shows "0 held", campaign board empty.

---

## ✏️ CORRECTIONS (highest value — these prevent repeats)

**WRONG: Put the demo mosaic on the homepage over Kate's cinematic scene → RIGHT:** the homepage needs nothing from the demo system; it already is the standard. Reverted. *"THIS IS NOT WHAT I MEANT."*

**WRONG: Forced every h2 across 18 pages to 68px `!important` at 17ch max-width (the rhythm layer) → RIGHT:** never apply a global type override to differently-designed pages. It produced thick, chunky headings breaking into three lines. *"this is horrid and thick type."*

**WRONG: Regex-patching live HTML with an injector → RIGHT:** edit source HTML at real anchors; make the applier idempotent. The injector caused duplicate sections after footers, dead listeners and a doubled brace.

**WRONG: Verifying fixes with grep → RIGHT:** if a change is visual it isn't done until it's been seen rendered. Every false "it's fixed" came from grep-verification.

**WRONG: Scratch card on the Ryman page → RIGHT:** the page's own copy says "there are no points and no scratch card anywhere on this page — you do not gamify a family deciding about their mother." Retirement pays out in minutes and straight answers.

**WRONG: Stock photography in demo heroes → RIGHT:** Kate wants motion/3D/illustration in place of photography unless it can be fine line drawings.

**WRONG: "monetised wait state" in customer-facing material → RIGHT:** "the rewarded wait." The value flows to the customer.

**WRONG: "One Rewards" as the Woolworths NZ programme name → RIGHT:** it's Kate's own concept name; the real brand is Everyday Rewards. Never propose renaming a two-year-old $400M brand investment.

**WRONG: Revenue-share pitch on Contact/Air NZ pages ("You keep 55%") → RIGHT:** removed — it sells the customer's patience back to the business. Also removed a fabricated tikanga governance sign-off (ref TIK-2026-07-21-C001) that never happened.

**WRONG: "assembling" as the brand in page chrome → RIGHT:** lowercase `assembl`, always.

**WRONG: Assumed Southbase was backed by "Chow" → RIGHT:** CEO Quin Henderson holds 57% after buying out Philip Carter and Ben Gough.

---

## 📚 LESSONS LEARNED

**LESSON: The recurring failure mode this session was applying a fix globally faster than it could be judged.** Four changes needed pulling back; all four were fleet-wide or production-wide moves made without one pair of eyes on one page first.

**LESSON: One page at a time, seen rendered, before anything rolls.** Kate's screenshots and screen recordings were the single most useful input all session — they showed exactly what she saw.

**LESSON: Kate spots the real fault, not just the symptom.** "The whole second half is flat text" → the `data-m` count was literally zero. "It's just patched" → it was a static band, not a moment. Take her diagnosis literally.

**LESSON: Check her own copy before adding a component.** The Ryman scratch card contradicted a promise printed on the same page. The page usually already states its own rules.

**LESSON: Kate's canon lives in `plugins/assembl-core/skills/assembl-design/SKILL.md`, `COPY.md` and `CLAUDE.md`.** Read them before visual or copy work. COPY.md strings must never be rewritten — propose, never substitute.

**LESSON: A Cloudflare Pages secret binds to a DEPLOYMENT, not a project.** Order is always set key → deploy. And four projects use their own name as the production branch (airnz, contact, concept, lab).

**LESSON: Her instinct on the loyalty data was right and cuts both ways** — Woolworths holds it, which makes them the prize and the hardest door; bp is the realistic first signature.

---

## ⏭️ NEXT STEPS

**TODO: Run the pending deploy command** (in HANDOFF-2026-08-01.md) — **PRIORITY: high** — it deploys the rhythm-layer revert; demos are currently in a state she disliked.

**TODO: Rebuild the six-waits section as one deliberate component** — **PRIORITY: high** — Kate: "no journey being assembled." Do it on one page, reviewed, before it goes anywhere else.

**TODO: Fix Giltrap's signing queue** (lot-read → draft → queue → guard → board) — **PRIORITY: high** — **BLOCKED BY:** nothing; Prompt 3 in `assembl-fix-prompts.md` is written.

**TODO: Call Nectar Money's owner** — **PRIORITY: high** — warm intro; scoped discovery at $25–50k; FMA handover (1 July 2026) is the urgency lever.

**TODO: Approach Stephen Lester, CSMO at Oceania Healthcare** — **PRIORITY: high** — ex-Ryman, owns the $227m unsold-stock problem. Send the Rosewell demonstrator, never a competitor's page.

**TODO: Coffee with Benny Huang** (Construction Technologies Director, Southbase Group; co-leads Preformance) — **PRIORITY: medium** — pitch Preformance as channel partner, not customer; one hop from Quin Henderson.

**TODO: Instrument the Aironaut or TOA wait as the published proof artefact** — **PRIORITY: high** — this is the reference every enterprise door asks for, and it beats a nineteenth demo.

**TODO: Decide on the homepage hero word-assembly** — **PRIORITY: low** — built on branch `claude/homepage-motion-system`, uncommitted, builds clean.

**TODO: Verify before any retirement send** — RV Amendment Bill introduction status at parliament.nz; the demos say "introduction imminent" (true as of 1 Aug).

**TODO: Re-source or drop the Tower "92 days to settle" figure** — **PRIORITY: medium** — could not verify; do not use in front of an insurer.

---

## Session History

### 1 August 2026 — Strategy, fleet repair, and the assembl visual/motion system
Deep research on agentic grocery/loyalty (Walmart's 3× conversion collapse and Sparky recovery; Woolworths' GECX build), then vertical-by-vertical culls: ~20 concepts → 8 keepers. Named send-list verified against live leadership pages. Fleet audit found the internal tier-card monetisation roadmap leaking on 14 live pages — purged. Built the visual system, then the motion system (9 primitives), then the 3D module (chrome/brass/ink × 14 industry forms) and the generative mosaic; rolled all of it to 18 demos with per-brand colours via an idempotent applier. Replaced four US statistics with four verified NZ/AU figures, set as a black evidence band with counting numerals. Reverted two over-reaches: the mosaic on the homepage and a global type-rhythm layer.
