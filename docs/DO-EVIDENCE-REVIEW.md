# Evidence review — bounded draft

13 October 2026. Base main: `a513dc1aa`. Branch: `feat/evidence-do-review-20261013`.

## Scope and authority

A shared Evidence capability for Pursuit → DO preparation and Meeting DO, with a synthetic review workspace at `/do/evidence`. This is an **unpublished, session-only preview**, not authenticated approval or durable storage. No external action, recording, message, submission, calendar insertion, model call, private record or live source ingestion is implemented. No production migration is needed or activated. The grant that prompted the concept is closed; the feature makes no grant claims.

The workspace uses the existing `DoProductFrame` and `DoEvidence` envelope. `pursuitProvenance` projects source metadata into Pursuit's existing `EvidenceSource` contract. Meeting DO links to the synthetic workspace without transferring notes. Agenda/ICS export uses the existing `meetingFollowthroughFromNotes` and `meetingReminderCalendar` helpers. It creates no task or calendar event. Session-only React state follows existing preparation previews; the server demo file store is deliberately unsuitable for real institution records and is not used.

## Review contract

- Permitted synthetic source snapshots include a source ID, immutable-style version ID, exact raw text (whitespace/newlines preserved), observed timestamp, expiry, labelled topic/value and fictional provenance URL.
- Ingestion retains history. Whitespace-normalised duplicate content is distinguished from changed text; both produce a new observation and invalidate review. This is deterministic comparison, not a claim of semantic model analysis.
- Stale, future, conflicting topic/value assertions and superseded citations block approval. The fixture controls make failure and reset/retry visible. There is no automatic conflict resolution.
- Quotations and facts require exact source support. Inferences, assumptions and proposed decisions remain explicitly labelled. Source instructions remain quoted data; there is no tool executor.
- Edits and evidence updates increment a revision and clear current review. Expected-revision checks reject stale mutations. Owner and named-reviewer checks apply to the synthetic contract; `authenticated` mode fails closed. These checks are **not a server authorization boundary**.
- Review receipts deep-copy all raw observed evidence versions (including superseded citations), the current-version IDs, brief, test reviewer action/time, decision status, separately confirmed commitments and unresolved commitments. Prior receipts survive subsequent edits in the current session. Files are versioned snapshots, not signed, cryptographically secured, tamper-proof or durable audit records.
- Meeting source context is separate from quoted discussion. Suggested owners/deadlines remain unresolved unless a human separately checks the explicit confirmation box. Receipt approval alone does not confirm commitments. ICS includes unresolved work for the next meeting.

## Review workflow

1. Load the research or meeting example. All institutional/person identities are fictional.
2. Inspect provenance and source history. Edit the labelled brief and proposed next action.
3. Record a test approval or decline; download the exact revision receipt.
4. Load a changed source. Observe invalidated review and outdated citations, then rebuild and review.
5. Try duplicates, stale/conflicting notices or hostile instructions. Reset to recover from the deliberate stale/conflict scenarios.
6. For meetings, review proposed owner/date separately and export unresolved work in an ICS agenda. Import remains the user's choice.

## Next useful step beyond fixtures

Agree one institution's low-stakes public research question, a named reviewer, two exact permitted source URLs, a freshness period and an evaluation set. Then implement a server-only adapter using the existing owner-scoped service/storage conventions: exact allowlisted HTTPS domains/paths, no redirects, public-IP DNS validation, bounded response size/time/content type, explicit fetch consent, and safe errors. Test SSRF, redirects, DNS/address changes, truncation and unavailable sources before connecting it. Carry exact bytes/version metadata into this same review contract.

Before real approvals: implement authenticated owner/reviewer admission at the server, atomic revision compare-and-swap, durable append-only receipt retention and RLS isolation in an isolated staging environment. Prove cross-account denial, logout, replay and concurrency. Do not enable production storage or private ingestion from this preview. The first live pilot should compare a public notice and prepare a human-reviewed internal brief, with no autonomous action.

## Proof

`apps/do/evidence/model.test.ts` tests provenance/receipt accuracy, version and revision conflicts, test owner/reviewer boundaries, production-mode rejection, hostile source content, stale/conflicting sources, evidence labels and meeting commitment confirmation. Existing meeting helper tests cover agenda and ICS mechanics.

`scripts/evidence-review-browser.cjs` exercises desktop and 375px review, receipt download, changed-source invalidation, stale/conflict blocking, decline/reset, hostile text rendering and unresolved meeting ICS. Browser API calls are aborted. Runtime proof and remaining check limitations are recorded in the draft PR.

Rollback: remove the Evidence route/module, synthetic Meeting DO link and registry row. No database or external state changes exist.


## Recovery verification checkpoint

The local draft survived the Mac restart. Refreshed `origin/main` remains `a513dc1aa22dad6d0cef1358b2e81f38e8caa77d`. Disk check shows 17 GiB free; no files were deleted by this recovery task.

- 21 focused tests passed (Evidence contract and existing Meeting follow-through helpers).
- Scoped ESLint, brand guard, macron check and diff whitespace check passed.
- Static independent review identified example-reset data loss and reused calendar event IDs. The fixes preserve receipt history, confirm replacement of edited drafts, allocate independent ICS event IDs, and clear declined confirmation selections.
- Desktop/375px browser verification and full typecheck/build remain pending. The previous attempt ended during the host disk/service failure; heavy runs are held until the UI owner confirms adequate capacity. This is a backup/review draft, not ship-ready proof.

Source-provenance follow-up: raw source validation no longer trims text. Only duplicate comparison normalises whitespace, and the status explicitly labels this. Equality tests cover leading/trailing spaces and newlines through storage, brief quotations and exported receipt JSON. The Evidence suite is included in DO core CI. Final runtime/build status is recorded on PR #1536 and supersedes the recovery checkpoint above.


## Browser and type verification

On the final application code: full TypeScript checking passes; 21 focused tests and scoped ESLint pass. The actual `/do/evidence` development route passed 1440px desktop and 375px mobile workflows with no page errors or horizontal overflow. Proof is committed under `output/playwright/evidence-review/`: screenshots, exact-source JSON receipts, separate-event ICS files and `results.json`. The browser script also verifies whitespace-preserving ordinary typing; it sets caret position explicitly to avoid platform-specific End-key behavior.

Independent visual review passed the bounded development preview: inherited DO frame, synthetic/test-only labels, mobile stacking and stale-source approval blocking. This is not native-device proof or a full accessibility audit (keyboard coverage is a smoke check).

One local production build was stopped after stalling without progress; no successful local production-build claim is made. The PR's exact-head hosted build/CI status is the production-build evidence. No second full local build, cleanup, merge or deployment command was run. Screenshot copies were explicitly requested for Library.
