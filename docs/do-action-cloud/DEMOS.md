# Demos

**Status:** Demo scripts for Assembl / DO / Pursuit — for staging / mock adapters first  
**Locale:** NZ English

Each demo must exercise the Action Contract lifecycle and emit a **Receipt** for consequential steps. Do not present mocks as production NZ integrations.

---

## 1. Car service booking (flagship)

**Services:** Quote · Book · Permit · Wait · Verify · Receipt · (optional Call)  
**Risk class:** medium

### Story

User asks agent to book a warrant of fitness / service. Agent uses DO — not raw browse.

### Steps

1. `discover` / `inspect` `book.car_service`  
2. `quote` available slots (dry-run)  
3. `prepare` with rego, workshop_id, slot_id → `args_hash`  
4. `permit` TTL 15m, max_uses 1  
5. `execute` via demo workshop adapter  
6. `wait` if confirmation is async (SMS)  
7. `verify` booking_exists  
8. `receipt` → show to user / CRM handoff  

### Success

- Hash mismatch execute fails  
- Double submit with same idempotency key is safe  
- Cancel path uses `undo` within policy window  

---

## 2. Pursuit tender demo

**Services:** Evidence · Forms · Permit · Human · Receipt · Agentize (if no API)  
**Vertical:** Pursuit  
**Risk class:** high

### Story

Find a GETS (or mock) opportunity → assemble response pack → human approve → submit under permit → receipt.

### Steps

1. Search / shortlist (Pursuit UX)  
2. Assemble documents → `Evidence` pack  
3. `DO Human` approval with deadline  
4. `prepare` + `permit` (high; human required)  
5. `execute` submit (API or Agentize)  
6. `verify` + `receipt`  

### Success

- No submit without Human + Permit  
- Evidence digests on receipt  
- Mark GETS connectivity **mock** until verified  

---

## 3. Sponsored Journey — grocery / loyalty

**Owner:** Assembl Sponsored Journeys  
**Services:** Quote · Rewards · Permit · Receipt · Account/CRM handoff  

### Story

Branded agent understands “need dinner tonight” → assembles useful basket/next step → genuine loyalty offer → approved add-to-order / redeem → commerce handoff → receipt.

### Rules

- Sponsorship labelled  
- Unpaid path remains available  
- Action only under Permit  
- Not built on OpenAI Ads API  

### Success

- Sponsor report driven by receipts, not chat logs alone  

**Prototype:** `/do/sponsored` + `/api/do/sponsored` (demo stubs; not live loyalty).

### Working DEMO (fuel / loyalty — bp Road-Ready)

Interactive walkthrough lives on the existing Task DO Maker partner skin — **do not** add a parallel `/demos/bp-*` route:

```
/studio/do-maker?mode=partner&partner=bp&template=sponsored-agent&preview=1
```

Spine: pump wait → branded bp agent → intent → assemble → genuine offer → DO Permit → DEMO action → CRM stub → receipt. See `docs/STUDIO-TASK-DO-MAKER.md` and `lib/studio/bp-sponsored-journey.ts`. PREVIEW only — no live bp partnership.

---

## 4. DO Browser persistent job

**Services:** Wait · Agentize · Evidence · Human  
**Verdict context:** WATCH browser-native AI (`DO_BROWSER_RUNTIME.md`)

### Story

User starts “compare three insurers’ excess” as a **persistent DO job** that survives tab closes; context controls visible; model-neutral; finishes with artifact + optional Human.

### Success

- Job state in DO Wait, not only browser memory  
- Output is artifact/receipt-ready, not a chat dump  
- No hard dependency on Firefox Smart Window APIs  

**Prototype:** `/do/browser` + `/api/do/browser-runtime` + Chrome DO side panel “Persistent job” section.

---

## 5. NZ energy switch

**Services:** Quote · Account · Switch · Permit · Verify · Receipt · Human  
**Rail:** EA ICP (+ retailer adapter / mock)  

### Story

Resolve ICP → quote plans → prepare switch → Human confirm → Permit → execute → verify → receipt.

### Success

- Dry-run switch before live partner  
- Critical/high gates enforced  
- Endpoint verification notes attached to demo README  

---

## Demo hygiene

| Rule | Practice |
|------|----------|
| Labelling | Mock vs sandbox vs production clear in UI |
| PII | Use synthetic customers in public recordings |
| Claims | No “live Action Cloud” marketing from demos alone |
| VAR | Log verify outcomes for each demo run |

---

## Related

- `DO_ACTION_CLOUD.md`  
- `SPONSORED_AGENT_JOURNEYS.md`  
- `NZ_ACTION_CLOUD.md`  
- `IMPLEMENTATION_ROADMAP.md`  
