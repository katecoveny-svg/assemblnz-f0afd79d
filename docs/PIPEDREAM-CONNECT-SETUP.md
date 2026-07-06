# Pipedream Connect — setup (10 minutes, Kate)

The connector layer's first provider (PR 4, per docs/CONNECTOR-BAKEOFF-2026-07-05.md).
Everything ships env-gated: until these vars exist, the code answers
"not configured" honestly and nothing pretends to work.

## 1 · Create the Pipedream project

1. Sign up / sign in at pipedream.com (free dev tier is fine for the spike).
2. Create a **project** (e.g. `assembl-pilots`) → note the **project ID** (`proj_…`).
3. Project → **Connect** → create an **OAuth client** → note client ID + secret.

> ⚠️ **`proj_…` vs `o_…`:** Pipedream shows two similar-looking IDs. The
> **workspace/org ID** (`o_…`, workspace settings) is NOT the project ID —
> the Connect API answers 404 "route not found" if you use it. Only the
> `proj_…` ID from the project's settings works (ours: the `assembl-pilots`
> project). This cost a setup round-trip on 2026-07-05; don't repeat it.

## 2 · Env vars (Vercel, assembl-web project — mark all sensitive)

Vercel refuses the sensitive flag on the **development** scope — store each
var twice: sensitive for production + preview, standard for development.

```
PIPEDREAM_CLIENT_ID=…
PIPEDREAM_CLIENT_SECRET=…
PIPEDREAM_PROJECT_ID=proj_…
PIPEDREAM_PROJECT_ENVIRONMENT=development   # switch to production later
```

Redeploy (any merge does it).

## 3 · Connect a pilot customer's tool

Signed in as operator, open:

```
https://demo.assembl.co.nz/admin/connectors
```

Type the pilot's id (`tenant:happytails` is pre-seeded in the table), pick
an app if you want Pipedream's hosted page pre-filtered, and hit
**mint link**. Copy the link from the modal — or **queue email draft**,
which files a Brevo draft into /admin/approvals (draft-mode always; nothing
sends until you approve, and dispatch stays behind ACTION_DISPATCH_ENABLED).

Send the link to the pilot customer — they connect their Google/HubSpot
account on Pipedream's hosted page; we never see credentials. The table
then shows what's connected under each id, and **revoke** severs the grant
instantly. Every mint and revoke writes a mana receipt (issuer
`action-path`).

Convention: `agent:<slug>` for the agent that will use the account
(matches what the chat tool files automatically); `tenant:<slug>` if a
whole workspace shares one connection later. Known pilot ids live in
`lib/connectors/pilots.ts` — add a line there to pin a new pilot to the
table before they've connected anything.

(The raw JSON endpoint `/api/admin/connect-link?external_user_id=…` still
works for curl debugging; the page is the day-to-day surface.)

## 4 · How an action flows end to end

1. Customer, in chat: "add this to my leads sheet" → agent calls
   `requestBusinessAction` → row lands **pending** in `agent_action_requests`.
2. You, on /admin/approvals: read the exact data, approve or reject.
3. Dispatch runs only when BOTH are true: `ACTION_DISPATCH_ENABLED=true`
   AND Pipedream is configured. Otherwise your yes is recorded and nothing
   moves — flip the flag when a pilot is ready for real writes.
4. Every stage writes a mana receipt (issuer `action-path`).

## Mapped actions (the spike, deliberately tiny)

| assembl action | app | Pipedream component |
| --- | --- | --- |
| add_sheet_row | google_sheets | `google_sheets-add-single-row` |
| create_lead | hubspot | `hubspot-create-or-update-contact` |

Anything else fails with "app not yet mapped" — extend
`PIPEDREAM_ACTION_MAP` in `lib/connectors/pipedream.ts` one line at a time.

## Notes

- Component IDs above are Pipedream's published action slugs; verify them
  against the Connect dashboard on first run in development — if one has
  drifted, the dispatch result records the exact API error on the request
  row and nothing retries silently.
- Privacy: add the connected app to the pilot's IPP 3A disclosure before
  flipping dispatch on (data flows through Pipedream, US-hosted). The
  onshore-only alternative stays the approved-webhook → self-hosted n8n
  path — zero extra code, per the bake-off.
