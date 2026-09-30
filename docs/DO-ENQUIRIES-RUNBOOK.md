# DO Enquiries: private external-workflow pilot

This extends existing Supabase sign-in, owner checks, Brevo email transport,
the Personal DO scheduler, and the MCP permission model. The standalone plugin
analytics business remains separate. This is not a general email relay.

## User flow

1. Open `/do/enquiries` from DO navigation and sign in with a verified founder mailbox.
2. Add a real enquiry or submit an authenticated `new_enquiry` event.
3. Review the starter reply, edit it, save, and inspect the recipient and full text.
4. Check the explicit confirmation and press **Approve & send email**.
5. Inspect the receipt and evidence. `sent` means Brevo accepted the request and
   returned a message ID. It does not mean inbox delivery, answered or booked.
6. Record a reply/booking with a reference, or connect an authenticated source
   system to report it. These records retain `owner_recorded` or `connected_system`
   provenance; they are not represented as independently verified email delivery.

Email uses the existing `front@assembl.co.nz` sender and email template. The
exact stored draft revision is approved. The human has no send button until the
draft is saved. The API claims it atomically before invoking the provider.
Ambiguous results and crashed sends never retry automatically. Reconcile them
against Brevo's transactional log using recipient, time, subject and message ID.
Automated receipt reconciliation and safe retry after operator reconciliation
are future work; this release deliberately has no resend endpoint.

The starter response is a deterministic template, not a claim that a model has
understood or solved the customer's enquiry. Edit it before sending.

## Deployment and worker

Apply the existing `20260821143000_mcp_oauth_memberships.sql` migration if absent,
then `20260930160837_do_enquiry_execution.sql` and
`20260930165658_do_enquiry_followup_outcomes.sql`, before deploying this code.
New tables use RLS. Browser roles cannot write approval state, invoke mutation
RPCs or read webhook hashes. Service-role operations bind the verified owner.

Required deployment settings are the existing Supabase URL/publishable key,
service-role key, `BREVO_API_KEY` and `CRON_SECRET`. The sender must be authorised
in Brevo. `DO_ENQUIRY_SEND_DISABLED=true` disables sends before claiming a job.
No public customer may send through the assembl domain; the pilot is restricted
to the existing verified founder mailbox allowlist.

The existing hourly `/api/do/personal/cron` now prepares due enquiry follow-ups
as well as Personal DO work. It still requires a timing-safe match against
`Authorization: Bearer <CRON_SECRET>`. It must never be made public to fix a 401.
Diagnostic codes distinguish `cron_secret_missing` and `cron_bearer_mismatch`;
neither logs the secret. Heartbeat is written after successful work.

To repair a missing/mismatched deployment credential:

1. In the linked Vercel project's **Production** environment, set a strong
   `CRON_SECRET` without quotes or whitespace. Use the same existing value if
   other configured cron callers depend on it; coordinate any rotation.
2. Redeploy Production; changing an environment value does not repair an old deployment.
3. Trigger the configured job through Vercel, or make one authorised request with
   that bearer token. Do not put the token in logs, source, URLs or screenshots.
4. Verify HTTP 200, bounded counts, and a recent `do_personal_worker.last_seen_at`.
5. Verify the next scheduled invocation too. A manual response alone does not
   establish that scheduling is working.

Owners can use **Check for due follow-ups now** while scheduling is unverified.
That action is owner-scoped, prepares drafts only, and does not fabricate a cron
heartbeat. One follow-up is prepared three days after provider acceptance when
no reply/booking is recorded. Each requires fresh approval. Recording an outcome
cancels a still-pending follow-up; parent-first locking prevents a stale approval
from racing ahead of an already-recorded outcome. A send already claimed before
an outcome arrives cannot be recalled.

## Event connection

Create the per-owner event key on the signed-in page. It is shown once, stored
only as a SHA-256 digest, can be replaced, and can be revoked. Use it from a
trusted backend, never embedded in a public browser form. Rotating invalidates
the old key. This API does not subscribe to a customer's inbox automatically.

`POST https://www.assembl.co.nz/api/do/enquiries/events`

Headers: `Content-Type: application/json`, `Authorization: Bearer <event-key>`.

```json
{
  "event": "new_enquiry",
  "requestId": "7f1c66bc-b8fc-419a-98f8-c0a99fb54c10",
  "name": "Fictional customer",
  "email": "customer@example.invalid",
  "message": "Can you help us prepare enquiry replies?"
}
```

Reuse a source UUID for retrying the same event. Changed input with the same key
is rejected; new events get new IDs. Intake is capped at 100 new jobs per owner
per day. The response supplies the job ID. To report an outcome:

```json
{
  "event": "booked",
  "id": "<job UUID from intake>",
  "evidence": "Booking system reference and date"
}
```

`answered` uses the same shape. Outcomes require an accepted send and do not
duplicate counts on retries. There is no webhook event for approval or send.
The funnel covers the latest 200 jobs and excludes child follow-ups, with that
window stated in the UI and plugin result.
Replies and bookings recorded against a follow-up also update the original
enquiry atomically, so the outcome counts once in that original enquiry's funnel.

## Authenticated plugin

The portable package is `plugins/assembl-enquiries/`. The actual hosted MCP
endpoint is `/api/mcp`, served by the main Next.js deployment, not a second
unprovisioned server. It uses the pinned MCP 2.0 SDK with stateless compatibility
for earlier clients. The older Assembl OS MCP server remains intact.

Tools: `list_enquiries`, `get_enquiry_evidence`, `prepare_enquiry_reply`.
No approve/send tool is exposed. Tool results include the human approval URL.
Every tool invocation is audited without tokens, message bodies or email addresses.
Private records and evidence are scoped by the verified token owner, not model input.

1. On `/do/enquiries`, enable enquiry plugin access. Revoke it there independently
   of other Assembl MCP access. A scoped membership is required on every request.
2. Enable/configure the Supabase OAuth server and supported client registration
   for this project if not already active. Keep the existing `/oauth/consent` flow.
3. Register the MCP endpoint as an authenticated connection in ChatGPT developer
   mode, complete Assembl sign-in and OAuth consent, and test with the pilot owner.
4. Inspect status/evidence and create a proposed reply. Open its link and approve
   on Assembl. A second account must be unable to read or approve that job.
5. Package/publish only after OAuth and the signed-in flow are proven. The portable
   manifest is not evidence of directory publication or a connected ChatGPT account.

Protected resource metadata is at
`/.well-known/oauth-protected-resource/api/mcp`. Identity is existing Supabase
OAuth; Sign in with ChatGPT is a separate registration, not a replacement invented
inside this build. Event triggers here are backend webhooks plus the scheduler;
ChatGPT MCP event subscriptions and push notifications are not implemented.

## Verification and boundaries

Run focused Vitest tests, typecheck, lint, production build and the rollback-only
`scripts/test-do-enquiry-database.sql`. Browser proof uses fictional fixtures and
must be labelled as such. Never send to a customer to test this feature without
approval of the particular recipient and message.

Rollback the application to the previous deployment and set the send kill switch.
The additive tables can remain, preserving receipts. Do not delete production
job history during an application rollback.
