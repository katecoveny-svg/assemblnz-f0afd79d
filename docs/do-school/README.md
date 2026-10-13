# School change briefing — closed pilot foundation

## Scope and authority

Extends `/do/family`, selected-sender `familyRequest`, HouseholdPerson's type contract and FamilyStatus review vocabulary. No new brand or DO shell. Uses exact evidence extraction and prepare/review conventions; does not import any household default roster. Only fictional sources and children are shipped. Separate checkout `codex/school-family-briefing`, base `2063e007cc0afbae62af2185b52989ffb74b641d`.

Inspected root AGENTS, START_HERE, context manifest/router/current state, assembl context, Factory/PRIMITIVES, DO-FAMILY-GMAIL, household SCHOOL seat and design canon. `.agents/skills/impeccable` launcher was unavailable; read existing PRODUCT/DESIGN and refinement guidance directly. PR #1525 and #1527 file inventories were checked; no overlap with this slice. No merge/deployment, account grant, credential transfer, provider activation, inbox content read or production schema change.

## Capability matrix

| Capability | Evidence/status | Limit |
|---|---|---|
| Synthetic notices → PDF text → previous/current comparison → reviewed/dismissed proposal | Working mounted `/do/family` preview, `/api/do/family/school-preview`; actual local fixture PDF bytes | Explicit six-column timetable rows only, not general prose or scanned-PDF comprehension |
| Selected senders and 7/14/30-day lookback | Reuses Family DO validation; current sources filtered by received time, historical baseline retained separately | Preview accepts two fictional senders only; live forwarding by a different sender is excluded |
| Date/time/location and cancellation comparison | Exact row/page/source links, old values retained, changed fields exposed | Exact school/title/audience matching; equivalent NZ date formats compare equal; older notices cannot roll back a newer baseline; renamed or ambiguous events need manual reconciliation |
| Duplicates and conflicts | Identical rows collapse across forwarded copies; incompatible versions block review | No latest-message-wins rule; adult/school resolution required |
| NZ dates / Pacific/Auckland | Explicit year, day/month and month-name dates; Intl verifies summer/winter offsets, rejects nonexistent/repeated times | Unsupported/uncertain wording blocks action; no guessed duration or reminder time |
| Multiple children/schools | Explicit school IDs and confirmed audiences; no options/transport inference | Type reuse only; never imports the legacy personal defaults or infers class membership |
| Existing Gmail integration | Existing family reader and owner checks inspected; `pilot-server.ts` dependency retained with unconditional rejection | School ingestion NOT wired live; no route, cron or caller flag can enable it |
| Existing reasoning integration | Existing digest uses `organiseFamilyMail` → `runDoTextReasoning`, named OpenAI GPT-6 Astra + TypeSafe consent | Comparison invokes neither provider; arbitrary notice interpretation needs separately approved work |
| Private state | Pure engine rejects mixed-owner inputs; owner/revision-bound review; preview transient and fictional only | No durable private school store. Live pilot CLOSED pending real two-account isolation, revocation and retention/deletion proof |
| Reminders/calendar | Review cards propose update/cancel/create, retain baseline and record draft decisions | No calendar lookup, writes, scheduled reminders, notifications, ICS import or automatic overwrite |
| Failure/staleness | Incomplete/unavailable evidence, missing dates, DST ambiguity and stale checks block approval; failed prepare clears result | Baseline freshness must be independently rechecked in any future live adapter |

## Connection inspection (13 October 2026 UTC)

Read-only anonymous GET `https://www.assembl.co.nz/api/do/family/connection` returned:

```json
{"configured":true,"signedIn":false,"connected":false}
```

This is configuration evidence, **not Kate's account status**. No cookies, credentials or inbox contents were read. Chat/dot Gmail access grants DO nothing.

`lib/connectors/pipedream.ts` uses `DO_GMAIL_OAUTH_APP_ID`, an owner key derived from authenticated Supabase identity (`do:user:<uuid>`), a healthy Gmail account, and GET-only Gmail message proxy. Scope is configured in the custom OAuth app, not verified by this code or status response. `docs/DO-FAMILY-GMAIL.md` requires `https://www.googleapis.com/auth/gmail.readonly` plus necessary identity scopes. Granted scopes, exact Google account and attachment coverage are **unverified**. Existing Family DO reads at most 20 messages, up to 4,000 text characters each, marks truncation/pagination and skips attachments. The school PDF helper reads explicitly supplied local bytes only (2 MiB, 20 pages, 16,000 characters/page); no mailbox attachment fetch was added.

## Exact private-pilot steps and consent

The following are prerequisites, not permissions already granted by volunteering to test:

1. **DO identity and Gmail connection:** Kate signs into her own DO account. In DO's connection flow, independently verify the intended Google account, named Assembl/Pipedream OAuth client, `gmail.readonly` and only necessary identity scopes. Review Google's displayed access before granting it. Do not reuse dot-chat credentials/grants. Verify connected owner, expiry and disconnect without exposing tokens. Operators must confirm the custom app's actual scopes; configuration/healthy status alone is insufficient.
2. **Bounded source approval:** choose explicit school sender addresses, a 7/14/30-day lookback, exact child-to-school/audience mappings and any specific PDF attachments. Show selected source IDs, subject/received dates, excerpts/pages, truncation and omissions for review. Missing class/options/transport must be asked or left unknown. No whole-inbox scanning or inferred forwarding trust.
3. **Data-processing approval before any model request:** disclose the exact email excerpts/PDF page text, child identifiers and household facts to be sent, purpose and named recipients. The existing digest recipients are **OpenAI (GPT-6 Astra)** and **TypeSafe**, with **Pipedream** handling Gmail access and Assembl hosting the application. State each recipient's verified retention, location/subprocessors and deletion controls; these were not established in this code inspection and must not be invented. Kate must separately approve that exact processing. Generic Gmail access or “I will test” is not consent to send children's data to these or any other vendors. The deterministic comparison itself needs no model. No silent fallback vendor is allowed.
4. **Private history approval and isolation:** show what source-backed events/quotations and child mappings will be saved, the verified account, purpose, exact retention duration and delete/revoke controls. Do not choose a retention duration silently. Obtain approval for the reviewed isolated storage setup and prove two accounts, sign-out/session expiry, stale response suppression, CAS/revision conflicts, deletion, restoration and storage failure. PR #1527 browser-draft work is a separate prerequisite, not evidence that school persistence is verified. No production migration in this PR.
5. **Separate action permission:** after old/new values and source links are reviewed, identify the exact calendar/account/event ID, desired date/time/location, duration, reminder offset, notification recipients and cancellation semantics. Obtain action-specific approval and verify a receipt. Until such adapter and permissions exist, review remains a draft decision. No background reads, scheduler, writes or external notification is enabled here.

Stop the pilot if any gate fails. Do not use private data as a fixture, screenshot, log or model test. No external provider call is needed to reproduce this PR.

## Validation and reproduction

- `node --import tsx scripts/generate-school-fixtures.ts` regenerates six fictional PDF notices.
- `pnpm exec vitest run apps/do/school apps/do/services/family.test.ts apps/do/services/family-server.test.ts apps/do/services/gmail-ownership.test.ts app/api/do/family`.
- `pnpm exec eslint apps/do/school app/do/family/SchoolBriefing.tsx app/do/family/FamilyDo.tsx app/api/do/family/school-preview scripts/generate-school-fixtures.ts --max-warnings=0`.
- Build canvas before typecheck/build. Browser: `/do/family`, confirm fictional audiences, compare, review/decline, change inputs (clears review), exercise all failure scenarios, clear/reload, 375px and desktop.

Verified locally: 50 focused tests passed with `--maxWorkers=1 --testTimeout=30000`; `pnpm typecheck`, scoped ESLint, brand and macron guards passed. A concurrent default-timeout run hit three timeouts while the full build was compiling; the constrained rerun passed. Browser tests passed desktop/375px, actual PDF links, review/decline, input invalidation, all six scenarios, clear/reload, visible keyboard focus and reduced motion. Final browser console had no errors and one existing companion iframe warning. The existing fixed companion/shortcut controls overlay part of the long mobile capture; shared shell changes remain with PR1525's owner.

Screenshots: `output/playwright/do-school/{desktop,mobile,conflict-mobile}.png`; browser observations: `results.json`. Combined proof was saved privately in Library as `school-briefing-browser-proof.png` (fictional data only). `pnpm build` passed, including the synthetic route. Repository-wide `pnpm lint:all` failed with 1,169 errors and 242 warnings outside the changed files; none of the changed school files appeared in its report. Scoped lint passed. The complete repository lint baseline is not clean. Draft PR: https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1528. Do not infer live pilot readiness from unit tests or screenshots.

## Rollback and follow-up

Remove the `SchoolBriefing` import/mount and synthetic route to hide the feature; existing Gmail digest is untouched. No schema/storage rollback is needed. General notice interpretation, live PDF ingestion, persistent baseline history and calendar execution remain separate approved slices. The reusable asset is the conservative evidence comparison/review contract and its synthetic edge-case tests.
