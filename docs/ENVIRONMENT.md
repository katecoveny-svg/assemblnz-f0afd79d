# assembl environment and secrets

**Last refreshed:** 16 September 2026

This document describes the current environment-variable model for the main assembl repository. It is intentionally about **where configuration belongs** rather than copying secret values into docs.

The annotated variable inventory lives in [`.env.local.example`](../.env.local.example). Treat that file plus current code as the authoritative variable-name reference.

## rules

1. **Never commit real secrets.**
2. Do not use the tracked historical root `.env` as configuration truth.
3. Local main-app values belong in `.env.local` (git-ignored).
4. Production/preview main-app values belong in the Vercel project environment.
5. Supabase edge-function secrets belong in the Supabase project secret store.
6. Public/publishable browser configuration must be explicitly named and documented as public.
7. Service-role keys, provider keys, webhook secrets, signing secrets and private tokens are server-only.
8. Optional integrations should fail safely as documented; do not put placeholder secrets into production merely to silence an error.

The repository is public. Anything ever committed should be considered visible even if later deleted. If a committed value was actually secret, rotate it rather than assuming deletion makes it private again.

## local setup

Main web app:

```bash
pnpm install
cp .env.local.example .env.local
# fill only the values needed for your task, or pull the project's development
# environment through the approved deployment tooling.
pnpm --filter @assembl/canvas build
pnpm dev
```

`.env.local` is ignored by git. Do not add it with force flags.

The canonical live Supabase project reference and current variable names are documented in `.env.local.example`; do not copy credentials from old README snippets, historical runbooks or Git history.

## main Next.js / Vercel variables

Common categories currently include:

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL` — public project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable browser key
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only** privileged key

Authenticated/internal routes may require the first two. Server routes that perform privileged reads/writes may additionally require the service-role key.

### model providers

The repo supports several providers/routing paths. Depending on the feature, current variable names can include:

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY`
- `GROQ_API_KEY`
- `OLLAMA_BASE_URL`
- `AI_GATEWAY_API_KEY`

Do not assume every feature uses the same router. Inspect the relevant route/runtime before provisioning a credential.

**DO:** provider keys remain server-side. Browser/native launch surfaces should receive bounded results or short-lived constrained credentials where the upstream API explicitly supports that model, never the long-lived provider key.

### DO runtime

DO-related configuration is documented in `.env.local.example` and the relevant DO docs. `DO_RUNTIME` selects the configured runtime mode where supported; provider credentials determine which model adapters are available.

Any live/browser-issued token endpoint must be protected by the same-origin/session/rate controls appropriate to DO and should issue the narrowest usable credential.

**Gemini voice:** `DO_GEMINI_LIVE_ENABLED=true` enables the authenticated Gemini 3.8 voice surface when `GEMINI_API_KEY` (or `GOOGLE_GENERATIVE_AI_API_KEY`) is configured. `SUPABASE_SERVICE_ROLE_KEY` and the existing `agent_chat_sessions` unique identity indexes provide its persistent daily allowance. The browser receives one constrained ephemeral token for at most five minutes; never expose the provider key. Keep this flag off when provider access has not been configured. See `docs/reviews/2026-09-16-do-voice/README.md` for the connection and rollback checks.

### media / creative / voice

Optional features can use keys such as:

- `DEEPGRAM_API_KEY`
- `FAL_API_KEY`
- `ELEVENLABS_API_KEY`

and other provider-specific variables documented in `.env.local.example`.

These integrations should fail closed or degrade to a non-provider path according to the feature's product contract.

### email / agent identities

Agent email infrastructure can use configuration such as:

- `BREVO_API_KEY`
- `AGENTMAIL_WEBHOOK_SECRET`
- `AGENT_EMAIL_DOMAIN`
- `AGENT_EMAIL_OUTBOUND_TOKEN`
- `AGENT_EMAIL_ADMIN_TOKEN`

Agent identities/email addresses are product infrastructure, not hard-coded secrets. Inbound signatures and outbound/admin tokens are server-only.

### billing

Stripe configuration includes server-only and publishable values. Examples:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

Never expose the secret/webhook values to browser code.

## Supabase edge functions

`supabase/functions/*` run independently from the root Next.js runtime. Their provider/configuration values should be stored as Supabase project secrets and read server-side (`Deno.env.get(...)`).

Built-in Supabase values such as project URL/anon/service-role credentials are managed by the platform for edge-function execution; do not duplicate privileged values into frontend configuration.

When adding a new edge-function secret:

1. add it through the approved Supabase secret-management path;
2. reference it only from server/edge code;
3. document the variable name and purpose in `.env.local.example` or a scoped runbook where appropriate;
4. ensure logs and error responses never print the value;
5. add a presence-only health check only when it is useful and safe.

## sub-projects

The repository contains independent toolchains:

- `remotion/` — Bun
- `plugins/mcp-servers/*` — npm
- `supabase/functions/*` — Deno
- `apps/do/macos/` — native Swift development companion

A sub-project may have its own scoped example/config docs. Root secrets should not be copied into sub-project source files merely for convenience.

## current secret-hygiene cleanup

A historical root `.env` remains tracked from the repo's Lovable/Vite era even though `.gitignore` now ignores `.env*`. We are treating this as a separate security cleanup because blindly deleting configuration without verifying active deployment dependencies can create outages.

Cleanup sequence:

1. stop docs/agents from treating root `.env` as canonical — **done in current cleanup PR**;
2. inventory variable **names only** and active consumers without reproducing values;
3. verify required values exist in the correct Vercel/Supabase secret stores;
4. classify each historical tracked value as public configuration vs secret;
5. rotate any value that was truly secret;
6. remove the tracked `.env` from current source;
7. consider history rewriting only with a deliberate migration plan; rotation is still required for exposed secrets.

## adding a new variable

Before adding one:

- confirm an existing variable/provider configuration cannot be reused;
- decide whether it is public, server-only or edge-only;
- add an empty/commented example to `.env.local.example` if main-app developers need to know it exists;
- add the real value only to the appropriate secret store;
- ensure missing-variable behaviour is explicit and safe;
- update a scoped runbook when setup is non-obvious.

## never do this

- commit a provider API key
- paste a service-role key into client code
- send a long-lived model key to the browser because WebSocket code needs authentication
- read secrets from historical Git commits for convenience
- log secret values in CI, screenshots, PR comments or debugging output
- make a tracked `.env` the source of truth for an agent or build

For current repo/runtime setup, also read `AGENTS.md`, `.env.local.example`, and the relevant product/runbook before changing environment configuration.
