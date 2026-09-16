# Task DO Maker — two modes, one shared core

**Canonical route:** `/studio/do-maker`  
**Partner alias:** `/do/maker/partner/[partnerSlug]` → redirects to canonical with `mode=partner`  
**Status:** shipping foundation  
**Related:** `docs/STUDIO.md`, `apps/do/shared/types.ts` (`AgentSpec`), `/pursuit`, `/do/office`

## Intent

Mint a **narrow, white-label task DO** — not a full family OS like Household Floor.

One shared maker core powers two entry experiences:

| Mode | Audience | Framing |
|---|---|---|
| **A · Pursuit / Studio** | Internal + pitch | Assembl Studio chrome; opportunity handoff from `/pursuit` |
| **B · Partner-facing** | Partner’s customers | Partner product name / colours primary; assembl credit minimal (`powered by assembl DO`) |

## Shared schema

White-label + task fields (maker state):

- `mode`: `pursuit` \| `partner`
- `partnerSlug` (optional): offline skin id (`bp`, `warehouse`)
- `brandName` / accents / optional `logoUrl` / promise
- `taskTitle`, `jobLine`, `instructions` / boundaries
- Pursuit context: `opportunity`, `partner` (free text), `task`

Compiled output is always a portable `AgentSpec` via `compileTaskDoSpec()` — drafts-only, `connector: 'hook-later'`, no scrape / live-API claims.

## Mode A — Pursuit / Studio

Deep-link from `/pursuit` (Sites hub origins unchanged):

```
/studio/do-maker?opportunity=Service%20quote%20preparation&task=research-brief&template=research-brief
```

| Param | Purpose |
|---|---|
| `opportunity` | Short opportunity label from Pursuit |
| `partner` | Partner / client display context (also seeds brand when `brand` absent) |
| `task` | Task key / slug |
| `template` | Starter chip (`research-brief`, `outreach-draft`, `meeting-follow-up`, `school-admin`, `wait-reward`) |
| `brand` / `accent` / `accent2` / `logo` / `promise` | White-label pitch fields |
| `title` / `job` / `instructions` | Task fields |
| `preview=1` | Shareable demo preview |

Default chips lean opportunity work: research, outreach, meeting follow-up, school admin, wait/reward.

## Mode B — Partner-facing white-label

Customer-facing maker for partners (bp Road-Ready, Warehouse, and similar rewarded-wait / task-utility shapes).

```
/studio/do-maker?mode=partner&partner=bp
/do/maker/partner/bp          # alias
/do/maker/partner/warehouse   # alias
```

### Offline demo skins

Config objects only — **not** live OAuth or partner APIs:

| Slug | Product | Default template | Rail |
|---|---|---|---|
| `bp` | bp Road-Ready | `sponsored-agent` | Sponsored agent · fuel loyalty |
| `warehouse` | The Warehouse | `task-utility` | Useful wait · Warehouse rewards |

Mode B chips: **sponsored agent**, **rewarded wait**, **task utility**, and shared **wait / reward** — drafts-only, no scrape claims, partner rail visible on the portable preview. Assembl attribution stays small in chrome and preview footer.

### bp Road-Ready · Sponsored Agent journey

Canonical walkthrough (no parallel `/demos/bp-*` route):

```
/studio/do-maker?mode=partner&partner=bp
/studio/do-maker?mode=partner&partner=bp&template=sponsored-agent&preview=1
/do/maker/partner/bp
```

Interactive spine inside the maker preview:

`loyalty moment → branded bp agent → intent → assemble useful next step → offer if genuine → DO Permit → DEMO action → CRM stub → receipt`

| Assembl vs ChatGPT Sponsored Agents | |
|---|---|
| Surface | Partner app / maker / DO — provider-neutral |
| Action | Completes a bounded job under **DO Permit** |
| Proof | Emits a **receipt** (sponsor reporting ≠ chat impressions) |
| Ads API | **Not** built on OpenAI Ads (none public); watch as future adapter only |

DEMO honesty: no live bp Rewards, fuel-board scrape, payment or CRM write. Unpaid path remains available (skip offer).

No Foodstuffs partnership framing.

## Persistence honesty

| Surface | Behaviour |
|---|---|
| Browser draft | `localStorage` key `assembl:studio:task-do-draft:v1` |
| Share / preview URL | Query params encode maker state (including `mode`) |
| Export | Downloads a valid `AgentSpec` JSON |
| DO Office handoff | `sessionStorage` + `/do/office?from=task-do-maker` banner |
| Durable cloud save | Not claimed for anonymous use. Signed-in Builder jobs remain the durable Office path today. |

## How to demo both modes

1. **Mode A:** open `/pursuit` → “Mint a task DO in Studio” → set a pitch brand → export / preview.
2. **Mode B:** open `/do/maker/partner/bp` or `/studio/do-maker?mode=partner&partner=bp` → bp Road-Ready sponsored-agent walkthrough (Permit + receipt) or switch to Warehouse for task-utility. Preview shows partner rail + `powered by assembl DO`.
3. Toggle Pursuit ↔ Partner inside the maker for a side-by-side pitch.
4. Share preview: `/studio/do-maker?mode=partner&partner=bp&template=sponsored-agent&preview=1`

## Product destinations

`PRODUCT_DESTINATIONS.agentStudio.taskDoMaker` → `/studio/do-maker`  
`PRODUCT_DESTINATIONS.agentStudio.partnerDoMaker` → `/do/maker/partner`  
(Distinct from Creative Studio’s Sites `/agency` workspace.)
