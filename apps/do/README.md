# DO Agent OS v0 (PREVIEW)

Working name: **DO**. Behaviour: **See something → ✦ make agent.**

Isolated DEMO / PREVIEW inside the assembl monorepo. Does **not** change the live homepage (`/`, CinematicJourneyHome) or One NZ / Evidence / Operator journeys (soft PREVIEW link on `/journeys` only).

## Architecture

**Surface ≠ agent.** Chrome extension is ONE launch surface. Core spine is channel-agnostic:

```
context + intent → AgentSpec → tools → permissions → outcome
```

| Surface | Status |
|---------|--------|
| Chrome MV3 ✦ | live (MVP) |
| Web `/do` | live (MVP) |
| WhatsApp / SMS / Messenger | stubs only (`GET /api/do/surfaces`, `POST /api/do/message`) |

Common ingress: `POST /api/do/message` with `{ surface, brief, page? }`.

### Runtime routing (not a chatbot)

DO is **not** a chatbot or Astra wrapper.

| Job class | Lane | Example |
|-----------|------|---------|
| Simple single-source | **local** Watch / primitive | “did this power price change?” |
| Multi-source / compare / exception / computer-use | **Astra-class** behind an interface | quote compare, GETS-like find |

v0 Astra provider is a **stub** (`stubAstraProvider`) — DEMO honesty, no vendor secrets, no external model call. See `apps/do/shared/router.ts`.

### Patterns absorbed (selectively)

See `apps/do/NOTICE`:

1. **Watch engine** — hash/diff snapshots (patterns from changedetection.io, Apache-2.0)
2. **DO Evidence** — ArchiveBox-inspired receipt of what was seen + why (on outcome cards)
3. **Approval chain** — specialist → skeptic → decision → you — **only** for major pay/buy/sign/submit paths
4. Voicebox / SearXNG / LibreTranslate — **out of scope** this PREVIEW (later; AGPL must stay separately hosted if ever used)

## What ships

1. Chrome MV3 extension — floating ✦, side panel, page capture
2. Compile API + message ingress → AgentSpec JSON (local JSON / memory persist)
3. Hard approval policy — server-side; model never picks risk tier
4. `/do` home — **Needs you** / **Working** / **Done** + agent cards
5. DEMO templates (NZ-flavoured, fixtures honest) including **Power price Watch DEMO**
6. Watch tick + simulate-change + Evidence on completed / changed outcomes

## How to run locally

```bash
pnpm install
pnpm --filter @assembl/canvas build   # once, if needed
pnpm dev                              # http://localhost:3000/do
```

### Load unpacked extension

1. `chrome://extensions` → Developer mode → **Load unpacked** → `apps/do/extension`
2. Open any page → ✦ → `tell me if this changes` → compile → Activate
3. Confirm on `/do`

### Watch DEMO (fixture change)

1. On `/do`, click **Power price Watch DEMO**
2. **Activate** → Working (baseline snapshot)
3. **Simulate change** → Needs you + **DO Evidence** card (v1 → v2 hash diff)

## API map

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/do/agents/compile` | NL + page → AgentSpec |
| `POST` | `/api/do/message` | Common surface ingress |
| `GET`  | `/api/do/surfaces` | Live + stub surfaces |
| `GET`  | `/api/do/agents?grouped=1` | Boards |
| `POST` | `/api/do/agents/:id/activate` | Activate |
| `POST` | `/api/do/agents/:id/tick` | Watch tick (`{ simulateChange?: true }`) |
| `POST` | `/api/do/agents/:id/approve` | Approve / decline |
| `GET`  | `/api/do/templates` | DEMO templates + fixtures |

Primitives: `watch` | `find` | `extract` | `prepare` | `compare`.

## DEMO honesty

- PREVIEW / DEMO banners everywhere that matters
- Local JSON (`apps/do/data/`) or in-memory — not multi-device
- Approve records your yes; does **not** buy/book/send/post/submit/pay/sign externally
- Fixtures for GETS / kids / quotes / power-price — no locked-site scrapes
- Astra lane stubbed
- Out of scope: DO Store, OpenAI Pioneers drafting, Studio mega-pipeline, real Akahu/Xero OAuth, autonomous purchases

## Brand

Plum `#240B21`, heather `#916A70`, paper `#FFFDFB`. Instrument Sans + IBM Plex Mono. No bot avatars, purple AI gradients, or chat-first DO homepage.
