# Saved board local proof

Local Next.js development route `/do/saved`, Chromium, fictional input only. Screenshots are local ignored files; none uploaded.

- 41 focused Vitest cases passed (strict content, URL redaction/unsafe URL rejection, owner isolation, CAS race, delete tombstone, backend failure, image durability closed).
- Scoped ESLint passed; brand guard and macron guard passed.
- Actual route returned HTTP 200. Browser reported zero console errors after fresh load; development font/resource preload warnings remain.
- Browser flow passed: add fictional note → review exact text and query/fragment-free URL → Add disabled until local consent → add → multi-word search → detail → task draft contains source ID/revision and original sanitized URL → Escape → remove.
- Explicit local image selection passed: existing fictional WebP decoded/resized, reviewed and added. No external requests during flow, no image bytes in task draft. No actual clipboard read, page capture, provider, upload or private file was used.
- 375 × 812 viewport: no horizontal page overflow; detail dialog fits and scrolls. Desktop at 1440 × 1050 inspected. Keyboard Escape closes dialog. Physical phone/Mac companion and Safari not tested.

Local evidence under `output/playwright/`:

- `saved-desktop.png`
- `saved-review-desktop.png`
- `saved-task-desktop.png`
- `saved-phone.png`
- `saved-detail-phone.png`

No production SQL, schema, security/config change, deployment or merge performed. Production SQL has not been applied. The proposal was executed only in isolated embedded PostgreSQL; hosted Supabase activation and independent-session concurrency still need proof. Full production build deferred on the shared Mac; hosted/release build remains a gate. Initial full typecheck found only a missing local canvas `tsup` dependency; the workspace dependency link was then supplied and the full typecheck rerun passed (exit 0).

## Follow-up review corrections

- `/do/saved` added to the shared focused-route list, removing the sibling dock/launcher that bypassed its navigation loss guard. The reviewed navigation test cancels Today and confirms the fictional addition remains.
- SQL now explicitly validates `kind` as a JSON string; null/missing/extra fields are exercised against embedded PostgreSQL.
- Disabled server API and cookie-scoped adapter have 17 additional synthetic HTTP integration cases (41 total focused tests).
- `node scripts/test-do-saved-sql.cjs`: 35 checks pass on a disposable local PGlite PostgreSQL database, including a new-instance reopen. No hosted SQL or real auth used.
- Decoder memory claim corrected: compressed input/accepted dimensions are bounded; peak decode memory is not guaranteed.
- Initial preview cancellation was explicitly performed by this agent through Vercel cancellation API for dpl_6w1PrW5qL1uoE3fv7CaPxSisZdxy; the returned state was CANCELED. It was not build-success evidence. Parent subsequently clarified normal PR preview verification is authorised.

## Ambiguous write acknowledgement

Only the default-disabled pre-storage path says nothing was saved online. A storage/returned-record failure after a save or removal returns 503 with `outcome: unknown` and the verified workspace, stable item ID, action and expected revision. A write may already have committed. Reconcile with GET for that same ID/account and compare the persisted revision and content/tombstone; preserve the original intent until resolved. Never generate a new ID for retry, infer success from a conflict, or treat an empty read as a verified replay receipt. If the owner changes, the read fails, or a newer revision exists, keep the outcome unresolved for review. No automatic retries or UI activation are introduced.

Homepage CI investigation: exact-head first attempt timed out in `review-do-unified.cjs:241` during dynamic reduced-motion switching. The same transition passes locally on candidate 214b440b1 and unchanged base 57b174df2, with readiness removed, canvas display none and Motion reduced label. Homepage renderer, assets and test have no diff against base. This does not establish a pre-existing failure; same-head hosted rerun was requested. Terminal results are tracked in the PR body.
