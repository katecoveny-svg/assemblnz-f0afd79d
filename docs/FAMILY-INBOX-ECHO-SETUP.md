# Family Inbox Sync — operator runbook

The always-on reader behind the **Family OS** demo (`/customers/family/ops`).

## What it does

`family-inbox-sync` is a scheduled Supabase edge function. Every **15 minutes** it:

1. Reads **new** family email — school newsletters, sports notices, bills, event invites.
2. For each new message, calls the Gemini gateway to **classify** it
   (`newsletter | sports | bill | event | school-admin | other`) and **extract** a
   `ParsedWeek` (events / tasks / pickups / shopping / approvals / memory).
3. Writes those as **proposed** `family_items` (`hub='demo'`, `source=inbox:<messageId>`)
   — the exact same rows the ops console's manual "parse a newsletter" flow produces.
4. Records a per-run summary in `family_inbox_runs`.

It is **draft-only**. It never replies, RSVPs, pays or sends anything. A named adult
approves every proposed item in the ops console before it becomes a real handoff.
`ACTION_DISPATCH_ENABLED` stays **off** — even the optional bill `email_draft` it may
file into `agent_action_requests` rests at `pending` and is never dispatched.

### Dedupe — fixes the "same message every day" bug

Before processing a message the function checks `public.family_inbox_seen` for the
provider message-id. If it's there, it **skips**; otherwise it records it. We never
rely on the unread flag alone — a message can be re-read across runs, or marked unread
again, and the old behaviour re-processed it into duplicate `family_items` every day.
With the seen-ledger, each message becomes family items **exactly once**.

## Dry mode (the default — writes nothing to prod)

Until an inbox provider + OAuth creds are set, the function runs in **DRY MODE**:

- It logs `[family-inbox-sync] no inbox creds — dry run`.
- It parses **one bundled sample newsletter** so the whole pipeline is exercised
  end-to-end and testable.
- It marks the run `dry_run=true`, reports what it *would* create, and **writes no
  proposed `family_items`**.

This is by design — **the cron can be live in prod and still touch nothing** until Kate
connects a real inbox. That keeps production clean while the plumbing is verified.

## Go-live — connecting a real inbox

### Which inbox?

The family's school pānui realistically land in **Kate's personal inbox,
`kateharland@outlook.co.nz` (Outlook)** — not the work address
`assembl@assembl.co.nz`. So the **Microsoft Graph / Outlook** provider is the primary
path for this demo. Gmail is fully supported too, for a Google-hosted address.

> **Reconciliation note:** `kateharland@outlook.co.nz` = personal / family (where the
> newsletters are). `assembl@assembl.co.nz` = work. Point the provider at the inbox that
> actually receives the school email — for the Family OS demo that's the **personal
> Outlook** one. Never assume the work address; it won't have the pānui.

### Option A — Outlook / Microsoft Graph (primary, personal address)

1. Register an app in **Entra ID (Azure AD)** with delegated **`Mail.Read`** +
   `offline_access` scopes and a redirect URI you control.
2. Authorise **as `kateharland@outlook.co.nz`** and capture the OAuth **refresh token**.
3. Set the function secrets:

   ```bash
   supabase secrets set \
     FAMILY_INBOX_PROVIDER=outlook \
     FAMILY_INBOX_MS_REFRESH_TOKEN=<refresh_token> \
     MS_OAUTH_CLIENT_ID=<app_client_id> \
     MS_OAUTH_CLIENT_SECRET=<app_client_secret> \
     --project-ref wurwcrgxjjwqdaxqceey
   ```

### Option B — Gmail (Google-hosted address)

1. Create an **OAuth client** in Google Cloud with the **`gmail.readonly`** scope.
2. Authorise the mailbox and capture the **refresh token**.
3. Set the function secrets:

   ```bash
   supabase secrets set \
     FAMILY_INBOX_PROVIDER=gmail \
     FAMILY_INBOX_GMAIL_REFRESH_TOKEN=<refresh_token> \
     GMAIL_OAUTH_CLIENT_ID=<client_id> \
     GMAIL_OAUTH_CLIENT_SECRET=<client_secret> \
     --project-ref wurwcrgxjjwqdaxqceey
   ```

### Shared secret (both options)

`GEMINI_API_KEY` must be set (it already is in prod — same key echo-respond uses). Without
it, messages are recorded as seen but not parsed.

Optional tuning secrets: `FAMILY_INBOX_HUB` (default `demo`), `FAMILY_INBOX_MAX` (max new
messages processed per run, default `10`).

### Deploy

```bash
supabase functions deploy family-inbox-sync --project-ref wurwcrgxjjwqdaxqceey
```

## The 15-minute schedule

The migration `20260714090000_family_inbox.sql` registers a **pg_cron** job
`family-inbox-sync-15min` (`*/15 * * * *`) that calls the repo's canonical
`public.invoke_edge_function('family-inbox-sync', …)` helper. That helper pulls the
project URL + service-role key from **Supabase Vault** (secret names `supabase_url` and
`service_role_key`). Those vault secrets already exist in prod (set for business-pulse /
morning-briefing), so the schedule goes live on its next tick.

We deliberately use the Vault helper, **not** the older
`current_setting('app.settings.*')` GUC pattern — those GUCs were never wired on this
project and inserted null URLs. If pg_cron isn't enabled, the migration logs a notice and
you schedule the job via the Supabase dashboard instead.

> Project ref for this (Sydney) prod project: **`wurwcrgxjjwqdaxqceey`**. If you're ever
> unsure of a URL, use the `<PROJECT_REF>` placeholder and confirm against
> `supabase/config.toml` (`project_id`) before running.

### Manual trigger / verification

`verify_jwt = false`, so you can trigger a run by hand with the service-role key:

```bash
curl -X POST \
  "https://wurwcrgxjjwqdaxqceey.supabase.co/functions/v1/family-inbox-sync" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

The JSON response reports `provider`, `dry_run`, `scanned`, `created_items`,
`categories`, and (in dry mode) `would_create`. Check `family_inbox_runs` for the
persisted summary and `audit_log` (`agent_code = 'family-inbox'`) for the audit trail.
