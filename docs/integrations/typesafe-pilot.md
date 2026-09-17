# TypeSafe × Pursuit × DO × Studio

Status: **review-branch pilot, not a production integration claim**. Prepared 18 September 2026.

## What this implements

A narrow, runnable vertical slice: approved pasted page context → TypeSafe selects a draft handler and independently checks an optional claim → Assembl assembles a source-linked draft → the person reviews, downloads or carries the context to another pilot surface.

Routes on the deployment containing this branch:

- `/pursuit/typesafe` — source-to-opportunity draft.
- `/do/typesafe` — same-context task selection and draft preparation.
- `/creative-studio/typesafe` — proposed storyboard/handoff and proof export.
- `/api/do/decision` — authenticated, owner-allowlisted server endpoint.

The noindex page shell and fictional rehearsal do not require authentication. **Only live API access is restricted.** No client material is embedded in the shell. Nothing is added to public navigation, and existing landing pages and redirects remain unchanged.

This creates the shared `lib/typesafe/` decision capability and uses existing DO `planTools`, `enforceApprovalPolicy`, owner authentication, body-size controls and request limiting. A returned DO tool plan is a proposal, not an executed tool call. A lane referring to an Astra stub remains a stub.

It does **not** modify the separately hosted ChatGPT Pursuit hub, intercept every existing DO workflow, install an extension, capture other tabs, run agents in the background, write durable Pursuit/Office records, send messages or publish Studio assets. Those integrations are follow-on work, not implied by these pages.

## Installation diagnosis

The requested npx installation was retried using one method:

```bash
npx --yes skills add typesafe-ai/skills --skill typesafe-ai --agent codex --yes
```

This ChatGPT execution environment failed resolving `registry.npmjs.org` with `EAI_AGAIN`; `git ls-remote` also failed resolving `github.com`. In contrast, the authorised GitHub connector could read this repository and create the review branch. This is evidence of an execution-environment DNS problem, not a repository permission failure or a diagnosed GitHub-wide outage.

The user reports the skill installed through Grok bot. This work reads and follows the TypeSafe skill and current API docs directly. It does not claim the npx install succeeded in ChatGPT or that the user's Grok installation changed.

Skill: https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md

## Enable a live preview securely

Set these **server-only** environment variables on the correct Vercel project's Preview environment, scoped to this branch where supported. Never use a `NEXT_PUBLIC_` prefix and never commit or paste a credential into chat, source, logs, a browser field or a proof packet.

```dotenv
TYPESAFE_API_KEY=<enter the early-access key directly in the hosting secret field>
TYPESAFE_ENABLED=true
TYPESAFE_PILOT_USER_IDS=<the signed-in user's UUID>
TYPESAFE_MODEL=jev-1.13.0
TYPESAFE_REVIEW_THRESHOLD=0.75
```

The versioned model ID is `jev-1.13.0`, not the display label "Jev 1.13". The threshold is **provisional and uncalibrated**. Confidence is not correctness or authority.

Deploy the review branch as a preview. Sign in through `/login?redirect=%2Fdo%2Ftypesafe`. The pilot's live setup panel displays the authenticated user's own UUID; use it in the allowlist. Empty allowlists fail closed. Ensure the preview hostname is permitted by the existing Supabase authentication configuration. Apply the environment settings to a fresh preview deployment before testing.

The secret and provider call remain server-side. Every live submission requires explicit consent to send the visible bounded context to TypeSafe. Source URLs are labels only and are never fetched; embedded username/password, query and fragment are removed. Redact credentials and confidential information from the pasted text manually before consenting.

Confirm applicable TypeSafe data handling/retention terms before testing confidential client material. No zero-retention assumption is made.

## Demonstration: a useful assistant while a customer waits

The included retailer is fictional; it is not a named customer or a claim of a signed pilot.

1. Open `/pursuit/typesafe` and run **Rehearse the example**. The source describes repeated order-status enquiries during click-and-collect preparation. The supplied claim says the pilot already increased conversion by 30%, while the source supplies no trial measurements.
2. Inspect the prepared draft. The fixed rehearsal selects a brief and marks the uplift claim as unsupported by the supplied evidence. There are no invented model scores, calls, timings or token counts.
3. Open DO, then Studio. The same fictional example illustrates a draft opportunity and proposed storyboard. External actions are unavailable. Downloads are local files, not saves to client records.
4. Once the server is configured, choose **Use live TypeSafe**, review the input and consent, then run. The actual model may select a different permitted handler, ask for clarification, or decline the available handlers. The scripted rehearsal result is **not** an expected guaranteed model output.
5. Inspect the returned model ID, answer distribution, token usage and measured provider-call duration. Task selection and claim support are separate questions in one request. A low-confidence route stops draft preparation; an uncertain claim remains unsubstantiated.
6. Carry the context to DO or Studio. The context is held in this browser tab's session storage, removed when read on the next surface, and requires fresh consent for a fresh provider evaluation. A handoff is not durable persistence.
7. Review the draft and download the private proof packet. The packet omits source text and draft content but includes a state hash, decisions and trace. A hash is a correlation aid, not a digital signature or independent proof of correctness. No automatic email or external share occurs.

Use your own live run as a qualitative walkthrough for TypeSafe. Do not present the fixture as a live result or the private trace as a public performance benchmark. Check permission before publishing vendor comparisons or performance results.

## Implementation boundaries

- Fixed HTTPS endpoint: `https://api.typesafe.ai/v1/systemone`.
- Two independent `choice` questions: next draft task; optional claim/source entailment.
- Only predefined handlers; source content cannot add tools or permissions.
- One bounded retry on 429/529, with delay and per-attempt timeout. No silent mock fallback.
- Response schema, probability keys/sums, winning choice and token counters validated.
- Missing credentials, disabled flag, foreign origin, anonymous/unlisted user, missing consent and invalid payload fail before provider access.
- The request cap reuses the existing **per-process** six-per-minute limiter. It is a backstop, not a distributed quota or spending guarantee. Keep the live pilot allowlist small; add durable metering before wider rollout.
- No telemetry or source is logged by these modules. The trace exists in the response/browser only; `persisted: false` is deliberate. Hosting/provider-level logs and retention are separate concerns.
- Draft assembly is deterministic code, not Jev-generated prose. Extraction copies candidate source lines; it does not certify their accuracy. Studio prepares a textual storyboard/handoff, not a rendered video/site.
- A model result cannot grant permission. All artifacts require human review, and this pilot has no external-action executor at all.

## Verification and release gates

Executed in the isolated working environment:

```bash
node --test scripts/check-typesafe-pilot.cjs
# 36 passed, 0 failed

tsc --strict --target es2022 --module commonjs --lib es2022,dom \
  --outDir .test-build lib/typesafe/core.ts lib/typesafe/transport.ts lib/typesafe/fixtures.ts
```

The local guard tests used verified source-function copies of the existing DO helpers because terminal DNS prevented cloning the full repository. The committed test script loads those helpers directly from the real checkout. It stubs the authentication boundary and provider response, **not** the new decision or transport code. It never contacts TypeSafe.

A Vitest wrapper at `lib/typesafe/pilot-contract.test.ts` includes this suite in the repository tests. Before merge, run in the full checkout:

```bash
pnpm install
pnpm --filter @assembl/canvas build
pnpm typecheck
pnpm test lib/typesafe/pilot-contract.test.ts
pnpm lint:all
pnpm lint:macrons
node scripts/brand-guard.mjs
pnpm build
```

Also prove the real preview at desktop and 375px, including auth redirects, button/keyboard interaction, consent reset on edits and handoff, unsupported requests, provider failure and a real key-backed evaluation. Full-app build, actual React/Next runtime, live authentication and actual TypeSafe responses are release gates until demonstrated; pure TypeScript checks are not substitutes.

Rollback: set `TYPESAFE_ENABLED=false` and remove pilot allowlist access, then revert the added routes/modules if needed. No database migration or external side effect needs reversing.

## Primary documentation consulted

- https://docs.typesafe.ai/api
- https://docs.typesafe.ai/models
- https://docs.typesafe.ai/primitives/choice
- https://docs.typesafe.ai/cookbooks/function_calling
- https://docs.typesafe.ai/cookbooks/citation_check
- `AGENTS.md`, `START_HERE.md`, `config/context-manifest.json`, `docs/context/CURRENT.md`, `docs/context/README.md`, `docs/factory/PRIMITIVES.md`, `DESIGN.md`, existing DO owner/router/policy/http sources and `middleware.ts`.
