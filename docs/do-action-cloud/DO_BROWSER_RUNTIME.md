# DO Browser Runtime — Watch Brief

**Status:** Landscape watch — **no migrate target yet**  
**Verdict:** **WATCH**  
**Trigger event:** Firefox Smart Window + Mistral Small 4 beta (announced ~16 Sep 2026)  
**Locale:** NZ English

---

## What changed (~16 Sep 2026)

Public announcements (re-verify before citing externally) describe Firefox exploring a **Smart Window** experience with **Mistral Small 4** in beta, including roughly:

- Browser-native context awareness  
- Persistent task framing  
- Model-selectable behaviour  
- Privacy controls for what the model may see  

Implication: the **generic AI sidebar is becoming browser infrastructure**, not a differentiated product layer.

---

## What DO owns (above the browser)

DO does **not** race to become another sidebar. DO owns the layer **above** browser chrome:

| DO concern | Why it stays valuable |
|------------|------------------------|
| Persistent jobs across tabs/sites | Browser task ≠ durable Action Contract |
| Visible context controls | User/tenant sees what is locked into prepare/permit |
| Model-neutral execution | Any model may propose; DO authorises |
| Action + artifact, not chat | Receipts, evidence, bookings — not transcripts |
| Permit → do → verify | Browsers will not standardise enterprise authority |

**Agentize** may use browser automation as an *adapter*, never as the product core (see non-compete with Browserbase-class tools).

---

## Migrate target

**None yet.** Do not plan a hard dependency on Firefox Smart Window APIs until they are documented, stable, and ToS-clear.

Possible future adapter (**hypothesis**): detect in-browser agent context → map to DO Wait / Evidence / Human. Remains **WATCH**.

---

## Product posture

| Layer | Owner |
|-------|-------|
| Chat-in-browser | Browser vendors / model vendors |
| Commodity browse automation | Browserbase et al. |
| Governed actions + receipts | **DO** |
| Org readiness + journeys | **Assembl** |

### Prototype surfaces (Sep 2026)

| Surface | Path | Notes |
|---------|------|-------|
| Browser Runtime UI | `/do/browser` | Persistent job · context lock · permit · artifact |
| Demo API | `/api/do/browser-runtime` | In-process job store; stubs Permit/Receipt |
| Extension | `apps/do/extension` side panel | Seed job + lock page into open job (extends browser seat) |
| Shared model | `apps/do/shared/browser-runtime.ts` | Survives tab changes; model-neutral placeholder |

Does **not** claim Mozilla/Firefox Smart Window embed. Does **not** invent a second extension.

---

## Monitoring checklist

- Firefox Smart Window API / extension surfaces  
- Chromium / Edge agent features  
- Privacy defaults that block Agentize  
- Whether browsers emit signed “user intent” signals usable as permit inputs (**speculative**)

Classification for radar: **INFO** → **EXPERIMENT** only after a documented API appears.

---

## Related

- `DO_RADAR.md`  
- `DO_ACTION_CLOUD.md` (DO Agentize)  
- `DEMOS.md` (DO Browser persistent job)  
