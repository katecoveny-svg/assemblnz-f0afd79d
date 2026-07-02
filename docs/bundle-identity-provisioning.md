# Bundle identity provisioning — Phase 3 (per-bundle phone + email)

Status: **code + DB shipped, draft-only enforced. Channel provisioning is pending
the portal steps below** — no working TNZ/Brevo credential is reachable from the
build environment (see "why nothing was auto-provisioned").

## The six identities

Kate's marketing names, mapped to the nearest live V4 bundle and the agent that
answers (`lib/identity/registry.ts`, seeded into `public.bundle_identity` by
migration `20260703113000_bundle_identity.sql`):

| Identity | Email (seeded) | Phone | chat_slug (bundle) | Lead agent | Answers today | live |
|---|---|---|---|---|---|---|
| Communication | communication@assembl.co.nz | — pending TNZ portal step | ensemble (creative) | creative-director* | **auaha** | false |
| Trust | trust@assembl.co.nz | — pending TNZ portal step | counsel (legal) | solicitor* | **hoko-cga** | false |
| Workflow | workflow@assembl.co.nz | — pending TNZ portal step | assembler (construction) | foreman* | **kaupapa** | false |
| Insights | insights@assembl.co.nz | — pending TNZ portal step | practice (health) | duty-doctor* | **quill** | false |
| Operations | operations@assembl.co.nz | — pending TNZ portal step | forge (automotive) | **arataki** | arataki | false |
| Knowledge | knowledge@assembl.co.nz | — pending TNZ portal step | kaitiaki (animal) | **keeper** | keeper | false |

\* provisional lead slug from `lib/marketplace/bundles.ts` — not yet a registered
MarketplaceAgent, so inbound routes to the nearest registered agent in that
bundle's family until the thin lead agents ship. When a lead slug becomes
registered, it wins automatically (`resolveRoutingAgent`).

Mapping rationale: Communication = the creative/comms shop (Ensemble); Trust =
legal + compliance (Counsel — matches the Mana Receipts trust story); Workflow =
programme/contract/consent pipelines (Assembler); Insights = clinical + document
intelligence (Practice); Operations = the service-manager bundle (Forge);
Knowledge = the deepest cite-only knowledge corpus on the shelf (Kaitiaki).
Hearth (consumer/family) and Visa (standalone pack) sit outside the six
business-facing marketing identities.

## Hard send gate (do not weaken)

`SEND_MODE=draft` is the enforced default. A real SMS/email leaves
`lib/identity/send.ts` **only** when BOTH hold:

1. env `SEND_MODE=live` on the deployment, AND
2. `bundle_identity.live = true` for that bundle (Kate flips it in /admin).

Until then every inbound message produces: an `inbound` log row, a `pending`
row in `content_approvals` (surface `bundle-identity:<slug>`, kind
`sms-reply` / `email-reply`) visible in **/admin/approvals**, and an
`outbound-draft` log row. Flipping to live later is env + toggle — no code.

## Webhook URLs (paste into provider dashboards)

Set `IDENTITY_WEBHOOK_SECRET` in Vercel first (any long random string), then:

- TNZ inbound SMS: `https://assembl.co.nz/api/identity/sms?secret=<IDENTITY_WEBHOOK_SECRET>`
- Brevo inbound parse: `https://assembl.co.nz/api/identity/email?secret=<IDENTITY_WEBHOOK_SECRET>`

Both routes answer `GET` with `{status:'ready'}` for provider URL validation and
reject any `POST` without the secret (fail-closed if the env is unset).

## Env vars required in Vercel

| Var | Purpose | State |
|---|---|---|
| `IDENTITY_WEBHOOK_SECRET` | webhook auth (above) | **to set** |
| `SEND_MODE` | leave unset or `draft`; `live` only at go-live | default draft |
| `TNZ_AUTH_TOKEN` | TNZ v3 Bearer (Dashboard → Users → user → API tab → Copy) | **to set** (exists as a Supabase edge-function secret, but Vercel needs its own copy) |
| `BREVO_API_KEY` | Brevo API (existing key — "Authorised IPs" must stay OFF) | **to set in Vercel** |
| `ANTHROPIC_API_KEY` (+ fallbacks) | reply generation via lib/ai ladder | already used by chat |
| `SUPABASE_SERVICE_ROLE_KEY` / `NEXT_PUBLIC_SUPABASE_URL` | logging + approvals | already set |

## Why nothing was auto-provisioned (2026-07-02)

Real API provisioning for Communication was attempted and stopped honestly:

- No `.env.local` exists in the repo and no Vercel CLI is installed on this
  machine, so no plaintext provider credentials are available locally.
- The Supabase management API (`GET /v1/projects/…/secrets`) returns **SHA-256
  digests, not plaintext** — `BREVO_API_KEY` and `TNZ_AUTH_TOKEN` came back as
  64-hex hashes (Brevo rejected it with `Key not found`, confirming it is not
  the real key). Credentials therefore cannot be recovered from Supabase.
- Per the Phase 3 rule — do NOT guess portal-only steps — everything below is
  written as an exact click-path instead, and `bundle_identity.phone` stays
  `null` (never seed a number that doesn't exist).

Verified along the way: `assembl.co.nz` MX → `smtp.google.com` (Google
Workspace), which shapes the email design below.

## TNZ — Communication's number (portal / support step)

TNZ's v3 API (`https://api.tnz.co.nz/api/v3.00`) sends and polls messages; it
has **no self-serve number-purchase endpoint**. Dedicated inbound long codes are
provisioned by the TNZ team:

1. Log in at the TNZ dashboard (Account **606498**, company "Assembl").
2. Copy the API token: **Dashboard → Users → select user → API tab → Copy** —
   put it in Vercel as `TNZ_AUTH_TOKEN`.
3. Email TNZ support (or use dashboard live chat) from the account owner
   address: *"Please provision one dedicated NZ virtual mobile (long code) for
   inbound+outbound SMS on account 606498, name it `assembl-communication`,
   and set its inbound/reply routing to webhook:
   `https://assembl.co.nz/api/identity/sms?secret=<IDENTITY_WEBHOOK_SECRET>`
   (POST, JSON)."*
4. When TNZ confirms the number, update the row (in /admin or SQL):
   `update bundle_identity set phone = '+64…' where bundle_slug = 'communication';`
5. Repeat per bundle when the others go live (one number each keeps routing
   trivial — the webhook routes on the **receiving** number).
6. Send a test text to the number → draft reply appears in /admin/approvals.
   Nothing is texted back while `live=false` / `SEND_MODE` unset.

Note: the existing 8 TNZ edge functions (tnz-send etc.) share the account's
current `TNZ_FROM_NUMBER`. Do not reuse that number for Communication — it
would collide with the existing reply routing.

## Brevo — Communication's email (portal + DNS steps)

`assembl.co.nz` mail is Google Workspace, so the root MX **must not** change.
Two halves:

**A. The public address (Google Admin — 5 min)**
1. admin.google.com → Directory → Users → (Kate's user) → Alternate email
   addresses → add `communication@assembl.co.nz` (or create a Group with that
   address if others should see it). Repeat for the other five when ready.

**B. Inbound parsing (Brevo + DNS)**
1. Pick a dedicated inbound subdomain: `reply.assembl.co.nz` (root MX stays
   Google). At the DNS host add:
   - `reply.assembl.co.nz  MX 10 inbound1.sendinblue.com.`
   - `reply.assembl.co.nz  MX 20 inbound2.sendinblue.com.`
2. Brevo dashboard → Senders, Domains & Dedicated IPs → Domains → add/verify
   `reply.assembl.co.nz`.
3. Create the inbound webhook (API, one curl — needs the real `BREVO_API_KEY`;
   IP allowlist must remain OFF on that key):
   ```
   curl -X POST https://api.brevo.com/v3/webhooks \
     -H "api-key: $BREVO_API_KEY" -H "Content-Type: application/json" \
     -d '{"type":"inbound","events":["inboundEmailProcessed"],
          "url":"https://assembl.co.nz/api/identity/email?secret=<IDENTITY_WEBHOOK_SECRET>",
          "domain":"reply.assembl.co.nz",
          "description":"bundle identity inbound"}'
   ```
4. In Google Admin (or Gmail settings for the alias), forward
   `communication@assembl.co.nz` → `communication@reply.assembl.co.nz`.
   The webhook routes on the **original** `To:` header, which Brevo preserves
   in the parsed payload, so the public address stays `@assembl.co.nz`.
5. Sender for eventual live replies: Brevo → Senders → Add sender →
   `communication@assembl.co.nz`. If the `assembl.co.nz` domain is
   authenticated (DKIM) in Brevo this activates without a verification email;
   otherwise Brevo emails a verification link to that address (fine — it is an
   @assembl.co.nz mailbox and lands with Kate via the alias).
6. Email the address → draft reply appears in /admin/approvals. Nothing is
   emailed back while `live=false`.

## Telegram — per-bundle evaluation (no bots created yet)

- **Communication (ensemble):** low fit. NZ creative/marketing clients live in
  email, Instagram DMs and Slack; Telegram adoption in NZ agencies is thin.
  Skip for now — revisit only if an offshore client segment appears.
- **Trust (counsel):** poor fit. Legal enquiries want a written, discoverable
  channel with a clear privacy story; Telegram's consumer-chat framing
  undercuts the trust positioning and adds a records-management headache. Skip.
- **Workflow (assembler):** moderate fit. Site crews use WhatsApp far more than
  Telegram in NZ construction, but subbie networks with overseas crews
  (Filipino, South African) do use Telegram groups. Park it; WhatsApp via TNZ
  is the better second channel here.
- **Insights (practice):** poor fit. Health data over Telegram is a Privacy Act
  / HIPC 2020 problem before it is a product feature — no PHI should transit a
  consumer chat app without a BAA-equivalent story. Skip.
- **Operations (forge):** **best candidate.** Freight, customs and vehicle-import
  networks (the Pīkau/Gateway audience) genuinely run on Telegram groups —
  offshore agents, shipping brokers and JDM importers coordinate there. If we
  pilot one bot, it is `@assembl_operations_bot` fronting Forge.
- **Knowledge (kaitiaki):** niche fit. Conservation field teams and
  international wildlife-vet networks use Telegram for patchy-signal group
  chats, but the NZ zoo/vet audience is email-first. Second in line after
  Operations, not before.

Recommendation: provision zero bots now; revisit `@assembl_operations_bot`
once Operations' SMS+email loop has real traffic. The schema
(`telegram_handle`, channel `telegram` in the messages log) is already in
place, so adding a bot is a webhook route + one column update.

## How Kate tests it (today, pre-portal)

Until a number/inbound-parse exists, simulate a message with curl:

```
curl -X POST "https://assembl.co.nz/api/identity/email?secret=<IDENTITY_WEBHOOK_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"From":{"Address":"kate@example.com"},
       "To":[{"Address":"knowledge@assembl.co.nz"}],
       "Subject":"Can Keeper help a daycare?",
       "RawTextBody":"Hi — do you cover doggy daycare onboarding packs?"}]}'
```

Then open **/admin/approvals** — a pending `email-reply` for
`bundle-identity:knowledge` is sitting there, drafted by Keeper, unsent.
The full thread is in `bundle_identity_messages`. Same for SMS via
`/api/identity/sms` with `{"From":"+64211234567","To":"<the TNZ number>","MessageText":"…"}`
once a number exists.
