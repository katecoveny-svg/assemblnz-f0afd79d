# How connectors flow into DO

**Status:** canonical wiring note (16 September 2026 NZ)  
**Stack:** Pipedream Connect only — no second OAuth for DO

Kate called this “Dreamtime”; in code and env it is **Pipedream**.

## Flow

1. **Pipedream project** — `PIPEDREAM_PROJECT_ID`, `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`, `PIPEDREAM_PROJECT_ENVIRONMENT`
2. **Connect apps** enabled in that project — Gmail uses custom OAuth app `DO_GMAIL_OAUTH_APP_ID` with `gmail.readonly`
3. **Vercel / `.env.local`** — server-only; never embed tokens in templates or AgentSpec
4. **DO declares connectors** — `requiredConnectors` on AgentSpec / Household Floor `connectors[]` (capability + app slug + required/optional + authority)
5. **User connects** — signed-in → `POST /api/do/connections` → Pipedream Connect link → grant stays on Pipedream
6. **Tool calls** — DO readers (e.g. `doGmailReader`) proxy through Pipedream for the `do:user:<uuid>` owner; drafts-only / approval for send

## UI states

| State | Meaning |
|---|---|
| Sign in to connect | No DO session |
| Setup needed | Pipedream / Gmail OAuth app env missing |
| Connect | App enabled; no healthy account |
| Connected | Healthy Pipedream account for this owner |
| Needs reconnect | Account present but not healthy |
| Status unknown | Pipedream list failed |

Helpers: `apps/do/shared/do-connectors.ts` · surfaces: `/do/connections`, Household Floor **Connectors** tab.

## Household Floor

Public template declares **optional Gmail** for school-mail context. No live tokens in the share pack. Family mail path remains drafts-only / review — never auto-send.

## Trial vs connectors

Anonymous network trial is **3 free tasks** (`reserveDoTrial`). **Signed-in DO owners bypass** that IP quota so demos and Gmail-connected flows are not blocked by `402 trial_exhausted` on the same network. Sign in at `/login?redirect=%2Fdo%2Fhousehold` (or `/do`) before prepare / family / vision / image / bills.

Anonymous visitors still share the 3-task network allowance.

## Related

- `docs/PIPEDREAM-CONNECT-SETUP.md`
- `docs/DO-FAMILY-GMAIL.md`
- `docs/do-templates/HOUSEHOLD-FLOOR.md`
