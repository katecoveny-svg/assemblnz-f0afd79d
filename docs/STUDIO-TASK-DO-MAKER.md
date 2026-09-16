# Task DO Maker — Assembl Studio × Pursuit

**Route:** `/studio/do-maker`  
**Status:** shipping foundation  
**Related:** `docs/STUDIO.md`, `apps/do/shared/types.ts` (`AgentSpec`), `/pursuit`, `/do/office`

## Intent

Mint a **narrow, white-label task DO** from Assembl Studio — not a full family OS like Household Floor.

Pursuit finds the opportunity. Studio mints a partner-ready draft agent. DO Office / companions consume the same portable `AgentSpec`.

## Pursuit handoff

Keep Pursuit hub workspace launches as top-level navigations to the Sites origin (`lib/product-destinations.ts`). The assembl.co.nz overview at `/pursuit` deep-links into the maker with query context:

| Param | Purpose |
|---|---|
| `opportunity` | Short opportunity label from Pursuit |
| `partner` | Partner / client display context (also seeds brand name when `brand` is absent) |
| `task` | Task key / slug |
| `template` | Starter chip id (`research-brief`, `outreach-draft`, `meeting-follow-up`, `school-admin`, `wait-reward`) |
| `brand` | White-label display name |
| `accent` / `accent2` | Hex accent colours |
| `logo` | Optional logo URL |
| `promise` | Short partner promise |
| `title` / `job` / `instructions` | Task fields |
| `preview=1` | Shareable demo preview (branded widget stub only) |

Example:

`/studio/do-maker?opportunity=Service%20quote%20preparation&task=research-brief&template=research-brief&brand=Northside%20Joinery&accent=%2317384D`

Hub operators can append the same query string onto `https://assembl.co.nz/studio/do-maker` without changing Sites workspace origins.

## White-label fields

- Brand / display name
- Accent + secondary colour
- Optional logo URL
- Short promise
- Task title + one-line job
- Instructions / boundaries (defaults to **drafts-only send**)

Starter templates are NZ-friendly and generic — no partnership framing.

## Persistence honesty

| Surface | Behaviour |
|---|---|
| Browser draft | `localStorage` key `assembl:studio:task-do-draft:v1` |
| Share / preview URL | Query params encode maker state |
| Export | Downloads a valid `AgentSpec` JSON |
| DO Office handoff | `sessionStorage` key `assembl:do:task-do-handoff:v1` + `/do/office?from=task-do-maker` banner |
| Durable cloud save | Not claimed for anonymous use. Signed-in Builder jobs remain the durable Office path today. |

Do not present local/session drafts as connected partner APIs or completed Office saves.

## Output

`compileTaskDoSpec()` in `lib/studio/task-do-maker.ts` produces an `AgentSpec` with:

- drafts-only posture (`must_ask_before` / `never` enforced via `enforceApprovalPolicy`)
- `connector: 'hook-later'`
- `demo: true`, `status: 'needs_you'`
- Pursuit context folded into `brief`

## Product destinations

`PRODUCT_DESTINATIONS.agentStudio.taskDoMaker` → `/studio/do-maker`  
(Distinct from Creative Studio’s Sites `/agency` workspace.)
