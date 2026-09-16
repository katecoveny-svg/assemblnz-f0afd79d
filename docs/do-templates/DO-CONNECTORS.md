# How connectors flow into DO

**Status:** canonical wiring note (16 September 2026 NZ)  
**Stack:** Pipedream Connect only — no second OAuth for DO  
Kate said “Dreamtime” → treat as **Pipedream**.

## Flow

1. **Pipedream project** — `PIPEDREAM_PROJECT_ID`, `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`, `PIPEDREAM_PROJECT_ENVIRONMENT`
2. **Connect apps** enabled in that project — Gmail uses custom OAuth app `DO_GMAIL_OAUTH_APP_ID` with `gmail.readonly`
3. **Vercel / `.env.local`** — server-only; never embed tokens in templates or AgentSpec
4. **DO declares connectors** — `requiredConnectors` / Household Floor `connectors[]` (capability + app slug + required/optional + authority)
5. **User connects** — signed-in → `POST /api/do/connections` → Pipedream Connect link → grant stays on Pipedream
6. **Mapped action** — `PIPEDREAM_ACTION_MAP` / `runConnectorAction` with real component ids; drafts-only / approval for send & posts

## DO connector pack (shipped)

Must-have: Gmail · Google Calendar · Google Sheets · Google Drive · Slack · HubSpot (+ Salesforce / Outlook already mapped)

Nice-to-have: Notion · Todoist · Linear · Stripe (invoice read) · Dropbox list

See `apps/do/shared/do-connector-pack.ts` and `lib/connectors/pipedream.ts` (`PIPEDREAM_ACTION_MAP`).

## UI states

| State | Meaning |
|---|---|
| Sign in to connect | No DO session |
| Setup needed | Pipedream / Gmail OAuth app env missing |
| Connect | App enabled; no healthy account |
| Connected | Healthy Pipedream account for this owner |
| Needs reconnect | Account present but not healthy |
| Status unknown | Pipedream list failed |

Surfaces: `/do/connections`, Household Floor **Connectors** tab, Builder allowance chip.

## Trial model (product rule)

| Caller | Prepare / vision / image / bills / family |
|---|---|
| **Anonymous / public sandbox** | `DO_TRIAL_LIMIT` free tasks per network IP (default **3**) |
| **Signed-in Assembl DO owner** (`doOwner`) | **Unlimited** — `reserveDoTrial` bypassed |

UI: exhausted anon sees sign-in CTA + enquire. Signed-in chip: “Signed in · unlimited prepare”.

### Ops mid-demo reset (optional)

Identity is `do-network:` + HMAC(IP, service role) — raw IP is not stored.

```sql
-- After computing anon_id for the demo network (or listing recent do-trial-* rows):
DELETE FROM agent_chat_sessions
WHERE agent_slug LIKE 'do-trial-%'
  AND anon_id = 'do-network:<hmac-hex>';
```

Prefer **sign-in** over deleting trial rows when possible.

## Household Floor

Public template lists **optional Gmail + Google Calendar** — no live tokens. Drafts-only; never auto-send.

## Related

- `docs/PIPEDREAM-CONNECT-SETUP.md`
- `docs/DO-FAMILY-GMAIL.md`
- `docs/do-templates/HOUSEHOLD-FLOOR.md`
- `docs/reviews/2026-09-16-household-floor-do.md`
