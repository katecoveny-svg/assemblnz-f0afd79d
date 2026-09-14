# DO Agent OS v0 (PREVIEW)

Working name: **DO**. Behaviour: **See something → ✦ make agent.**

Promise: **DO anything from where you already are.** Surface ≠ agent — the floating ✦ is one launch surface; the agent is the AgentSpec.

Isolated DEMO / PREVIEW inside the assembl monorepo. Does **not** change the live homepage (`/`, CinematicJourneyHome) or One NZ / Evidence / Operator journeys.

## How to try (fast path)

```bash
pnpm install
pnpm --filter @assembl/canvas build   # once, if needed
pnpm dev                              # http://localhost:3000/do
```

### Floating ✦ widget on `/do`

1. Open `http://localhost:3000/do`
2. Click the floating **✦** (bottom-right) — Grammarly-like compact sheet
3. Context chips show URL / title / selection
4. Pick a template from a lane, or type “make agent for this” → compile
5. Review AgentSpec card (**watches / when / does / asks first**)
6. Optional connector stub (SAP / email / calendar / Xero / Akahu) — default **Hook later**
7. **Activate** → lands in Working / Needs you with Evidence

### Mitre 10 · SAP pursuit DEMO

1. On `/do`, click **Mitre 10 · SAP pursuit DEMO**
2. Widget opens on template `mitre10-sap-rfp-brief` with fictional RFP + SAP landscape fixture context
3. Review the AgentSpec → **Activate**
4. Agent moves to **Needs you** with **DO Evidence** (draft from fixtures — nothing sent)
5. Approve (DEMO) records your yes; does not email/submit/write to SAP

Lane: `pursuit-mitre10-sap` also includes competitor watch, stakeholder map, proposal compare, next meeting pack.

### Chrome extension

1. `chrome://extensions` → Developer mode → **Load unpacked** → `apps/do/extension`
2. Open any http(s) page → floating **✦** opens an on-page compact sheet (same flow as `/do`)
3. Side panel remains available as a second surface
4. Set API base to `http://localhost:3000` if needed
5. Confirm boards on `/do`

## Architecture

```
context + intent → AgentSpec → tools → permissions → outcome
```

| Surface | Status |
|---------|--------|
| Chrome MV3 ✦ (on-page sheet) | live (MVP) |
| Web `/do` floating ✦ | live (MVP) |
| WhatsApp / SMS / Messenger | stubs only |

### Runtime routing (not a chatbot)

| Job class | Lane | Example |
|-----------|------|---------|
| Simple single-source | **local** Watch / primitive | power price change |
| Multi-source / compare / find | **Astra-class** (stub) | quote compare, GETS-like find |

## Launch template catalog

Data-driven registry in `apps/do/shared/templates.ts` — served by `GET /api/do/templates` (grouped by lane), used by `/do` + extension.

| Lane | Examples |
|------|----------|
| Mitre 10 · SAP pursuit | RFP brief, competitor watch, stakeholder map, proposal compare, meeting pack |
| Personal / Household | power price, plan compare, school notice, physio watch, tradie find |
| Bills / Money | recurring expense, invoice extract, quote compare |
| Work / Pursuit | GETS-like find, bid brief, competitor watch, meeting prep |
| Study / Family | tutor (hints not answers), newsletter → calendar, kids tomorrow |
| Retail / Ops | stock watch, supplier quotes, store notice |
| SME | Xero recurring (stub), customer follow-up (asks first) |

## API map

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/do/agents/compile` | NL + page → AgentSpec |
| `POST` | `/api/do/agents/:id/activate` | Activate (`{ connector? }`) |
| `POST` | `/api/do/agents/:id/tick` | Watch tick (`{ simulateChange? }`) |
| `POST` | `/api/do/agents/:id/approve` | Approve / decline |
| `GET`  | `/api/do/templates` | Catalog + groups + connector stubs + fixtures |
| `GET`  | `/api/do/agents?grouped=1` | Boards |
| `POST` | `/api/do/message` | Common surface ingress |
| `GET`  | `/api/do/surfaces` | Live + stub surfaces |

Primitives: `watch` | `find` | `extract` | `prepare` | `compare`.

## DEMO honesty

- PREVIEW / DEMO banners on every launch surface
- Mitre 10 / SAP pack uses **fictional** RFP and landscape fixtures — not a live Mitre 10 or SAP system
- Connector picker is stubs only; **Hook later** is the default
- Approve records your yes; does **not** buy/book/send/post/submit/pay/sign externally
- Local JSON (`apps/do/data/`) or in-memory — not multi-device
- Astra lane stubbed
- Homepage `/` untouched

## Brand

Plum `#240B21`, heather `#916A70`, paper `#FFFDFB`. Instrument Sans + IBM Plex Mono. No bot avatars, purple AI gradients, or chat-first DO UI.
