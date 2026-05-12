# agentmail-inbound

Tōro · Term Planner inbound email webhook. Receives forwarded school
communications via AgentMail (per-whānau forwarding address
`term-<whanau-id>@toro.nz`), parses them into typed actions, and stages
a draft in `public.toro_drafts` for the parent to review.

This is the **runtime-half** of the Term Planner agent registered by
Kaihanga on 2026-05-12 in `agent_prompts` (slug `term-planner`, pack
`toro`, status currently `scaffolded`). The agent flips to `active`
once this function is deployed end-to-end and the acceptance test
passes (see below).

## Pipeline

```
AgentMail relay
    │  HMAC-signed POST with email JSON + attachments
    ▼
agentmail-inbound (this fn)
    │  1. verify HMAC
    │  2. parse recipient → whanau_id → tenants row
    │  3. dedup on (whanau_id, agentmail_message_id)
    │  4. extract text: body + PDFs (unpdf) + images (Claude vision)
    │  5. NZ-PII redact cleartext body for storage
    │  6. notice-parser → ExtractedAction[] (calendar/payment/gear/
    │       permission/transition) via Claude Opus 4.7
    │  7. INSERT toro_drafts (status='pending_approval', source='agentmail')
    │  8. INSERT toro_draft_transitions (null → pending_approval)
    │  9. best-effort Mana Receipt via /functions/v1/mana
    ▼
Parent reviews + approves in /app/toro/inbox
```

## Hard rules in code

- **No auto-send.** `status='pending_approval'` is the only landing
  status. Enforced by `toro_drafts.toro_drafts_status_check` and the
  insert call in `index.ts`.
- **Per-source schema invariants** — when `source='agentmail'`,
  `source_metadata` MUST contain `whanau_id` and `agentmail_message_id`.
  Enforced by `toro_drafts.toro_drafts_source_invariants` (CHECK).
- **No kid data trains models** — rows with kid-named actions land
  under `retention_class='kids_data'`. The retention helper at
  `lib/toro/retention.ts` (separate PR) refuses to export those rows
  to model-training stores.
- **PII redaction at the boundary** — `incoming_body` is run through
  `_shared/nz-pii-redact.ts` before persisting. The structured
  `extracted_actions` retain payment account / phone / email fields
  ONLY where the action's contract needs them (e.g. payment.bank_account).

## Files

| Path | Role |
|---|---|
| `index.ts` | `Deno.serve` handler — HTTP wrapper, HMAC, orchestration |
| `lib.ts` | Pure helpers: `parseRecipient`, `renderDraftBody`, `guessSchool`, `clampConfidence` (imported by tests without spinning up the serve handler) |
| `__tests__/lib.test.ts` | Deno tests for pure helpers |
| `__tests__/fixture.test.ts` | Fixture-based shape test (acceptance harness, no LLM call) |
| `__tests__/fixtures/sacred-heart-term2-newsletter.txt` | Representative NZ school newsletter — used by fixture test |
| `../_shared/notice-parser.ts` | Schema-driven extractor + `validateAction` |
| `../_shared/nz-pii-redact.ts` | NZ-PII redaction (mobile, landline, IRD, email, bank account) |
| `../_shared/pdf-extract.ts` | unpdf text extraction + Claude vision fallback |

## Migration

Schema changes for this function live in:

```
supabase/migrations/20260513090000_toro_drafts_agentmail_inbound.sql
```

Adds: `source`, `source_metadata`, `retention_class`, `extracted_actions`,
per-source invariants, agentmail dedup index. Relaxes the `chatwoot_*`
NOT NULL constraints. Idempotent (safe to re-run).

## Env (set in Supabase project settings → Edge Functions → secrets)

| Name | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | auto-injected | edge runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | auto-injected | edge runtime |
| `AGENTMAIL_WEBHOOK_SECRET` | yes | HMAC secret AgentMail signs deliveries with. Fail-closed if missing. |
| `AGENTMAIL_DOMAIN` | no | Expected recipient domain. Default `toro.nz`. |
| `ANTHROPIC_API_KEY` | yes for parsing | used by `callLlm` (notice-parser) + `callClaudeVision` (image / scanned-PDF fallback). |

If `ANTHROPIC_API_KEY` is missing, the function still accepts the
inbound, but every draft lands with `parse_status='parse_failed'` and
the parent reviews the raw forwarded email.

## Deploy (do NOT auto-deploy from a PR)

```bash
supabase functions deploy agentmail-inbound --no-verify-jwt
```

`--no-verify-jwt` is required: AgentMail does NOT carry a Supabase JWT.
HMAC verification is the auth.

Webhook URL after deploy:

```
https://<project-ref>.functions.supabase.co/agentmail-inbound
```

Configure AgentMail to POST to this URL on every inbound message and
sign with the same secret you set in `AGENTMAIL_WEBHOOK_SECRET`.

## Acceptance test (from `outputs/CODE-BRIEF-TORO-LAUNCH-2026-05-12.md`)

> I forward a real Sacred Heart or Baradene newsletter PDF to
> `term-<my-whanau-id>@toro.nz`, the agent replies within 60 seconds
> with at least: calendar events, payment requests with amounts and
> due dates, gear list, permission slips.

### Manual run after deploy

1. Insert a test tenant (or use an existing one): note the `tenants.id`
   uuid or `tenants.slug`.
2. Configure your email forwarding to send to
   `term-<that-id-or-slug>@toro.nz` (the AgentMail relay handles MX).
3. Forward a real newsletter PDF.
4. Watch `supabase functions logs agentmail-inbound` for the
   `request_id`, then look up the row:
   ```sql
   select id, status, source, retention_class, draft_body,
          extracted_actions, source_metadata->>'parse_status' as parse_status
     from public.toro_drafts
    where source = 'agentmail'
      and source_metadata->>'whanau_id' = '<your-tenant-id>'
    order by created_at desc
    limit 1;
   ```
5. The draft should land in `/app/toro/inbox` for the whānau, status
   `pending_approval`, with at least one entry per action class.

### CI-friendly test loop

```bash
deno test --allow-read --allow-net \
  supabase/functions/agentmail-inbound/__tests__ \
  supabase/functions/_shared/__tests__/nz-pii-redact.test.ts \
  supabase/functions/_shared/__tests__/notice-parser.test.ts
```

(The fixture test reads a file → `--allow-read`. `--allow-net` is
needed only if you choose to wire a live LLM call in a future test.)

## Known gaps / TODOs

- **AgentMail config memory missing.** `reference_agentmail_config.md`
  isn't in Kate's memory dir as of 2026-05-13. The webhook secret +
  domain are read from env, but the relay-side configuration (MX
  records, forwarding rules) still needs to be captured in canon.
- **Kid attribution is best-effort.** Until Kid Money Phase 1 lands
  `toro_kid_profiles`, the parser doesn't have a per-whānau kid list
  to constrain `kid_name` attribution. The parser attributes by what
  the text says; whānau without a kids list see `kid_name=null` on
  ambiguous items.
- **Sensitive retention class.** Medical / counsellor letters should
  flag `retention_class='sensitive'` (whānau-only review). Routed
  through `'standard'` in v1 — needs a richer source classifier.
- **Mana Receipt is best-effort.** A failure to write the receipt
  logs but doesn't 5xx the webhook (AgentMail would retry and we'd
  insert a duplicate draft, defeating the dedup).
- **`unpdf` version pin** is `0.12.1` — confirm available on esm.sh
  at deploy time. The library is Deno-compatible and DOM-free, which
  is what makes it edge-safe.
