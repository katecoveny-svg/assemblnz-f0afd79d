# DO Agent OS v0 (PREVIEW)

Working name: **DO**. Behaviour: **See something → ✦ make agent.**

Promise: **DO anything from where you already are.** Surface ≠ agent — the floating ✦ is one launch surface; the agent is the portable **AgentSpec**.

Isolated DEMO / PREVIEW inside the assembl monorepo. Does **not** change the live homepage (`/`).

## What DO is (and is not)

| DO is | DO is not |
|-------|-----------|
| See something → ✦ make a **portable agent object** | ChatGPT / OpenAI consumer agent clone |
| **place / template / delete** AgentSpecs | Instinct-style messaging personal assistant |
| Home = **Wallet / Things cards** + Needs you | Chat threads as the home |
| Clear = vertical plain / **anti-slop** (secondary) | Grammarly grammar-first product |

Starter lessons kept: approval-gated consequential actions, ✦ make agent, AgentSpec watches/when/does/asks, plum side panel.

## How to try (fast path)

```bash
pnpm install
pnpm --filter @assembl/canvas build   # once, if needed
pnpm dev                              # http://localhost:3000/do
```

### Visual home (`/do`)

First viewport is **widgets**, not brochure copy:

1. Thin PREVIEW + runtime chips + differentiation lock chip
2. Giant living **✦** — primary make-agent control
3. **place · template · delete** verbs under the wordmark
4. Template pinboard + Mitre 10 · SAP DEMO tile
5. Wallet boards (Needs you / Working / Done)
6. DO Clear (secondary) + WhatsApp phone stub

## Agents SDK spine

Hard jobs / compile / Clear prefer **OpenAI Agents SDK** patterns:

- `agent` + `tools` + `guardrails` + **human-in-the-loop** (`needsApproval`) for consequential acts
- Sessions + handoffs (Compile · Clear · Astra specialists)
- Commercial default remains **Assembl-hosted**

| Condition | Spine |
|-----------|--------|
| `OPENAI_API_KEY` or `AI_GATEWAY_API_KEY` set | `@openai/agents` adapter (`apps/do/shared/spine/openai-adapter.ts`) |
| No OpenAI key (Assembl DEMO / Anthropic-only) | Thin TS orchestrator matching the same concepts (`apps/do/shared/spine/orchestrator.ts`) |

Adapter interface: `apps/do/shared/spine/types.ts` (`DoAgentsSpine`).  
Resolver: `resolveDoSpineAsync()` in `apps/do/shared/spine/index.ts`.  
Runtime entry: `apps/do/shared/runtime.ts` → compile / Clear / Astra.

This is **not** a fake SDK. When the package cannot run (no key), the orchestrator is the durable DO contract the SDK adapter implements.

```bash
# dependency (workspace root)
pnpm add -w @openai/agents
```

Env:

```bash
DO_RUNTIME=assembl   # default — Assembl hosts inference
# DO_RUNTIME=byo     # Enterprise BYO later
# OPENAI_API_KEY=…   # enables Agents SDK adapter (also used for byo)
# AI_GATEWAY_API_KEY=…
```

## Runtime — Assembl hosts the agent

| Plan posture | Runtime |
|--------------|---------|
| Personal / Pro | **Assembl-hosted** included (`DO_RUNTIME=assembl`) |
| Enterprise | BYO later (`DO_RUNTIME=byo` + OpenAI key) |

Without keys: chip **Assembl runtime · DEMO** — deterministic compile + Clear + HITL still wired.

## API map

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/do/agents/compile` | NL + page → AgentSpec (via spine) |
| `POST` | `/api/do/clear` | Clear rewrite + underline marks |
| `GET`  | `/api/do/runtime` | Assembl / BYO / DEMO + spine kind |
| `POST` | `/api/do/agents/:id/activate` | Activate |
| `POST` | `/api/do/agents/:id/tick` | Watch tick |
| `POST` | `/api/do/agents/:id/approve` | Approve / decline (HITL) |
| `DELETE` | `/api/do/agents/:id` | Delete |
| `GET`  | `/api/do/templates` | Catalog |
| `GET`  | `/api/do/agents?grouped=1` | Boards |

## DEMO honesty

- Thin PREVIEW + runtime chips
- Mitre / SAP fixtures are fictional
- Approve does not send/submit/pay externally
- Homepage `/` untouched

## Brand

Plum `#240B21`, heather `#916A70`, paper `#FFFDFB`. Instrument Sans + IBM Plex Mono. No bot avatars, purple AI gradients, or chat-first DO UI.
