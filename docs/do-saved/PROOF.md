# Saved board local proof

Local Next.js development route `/do/saved`, Chromium, fictional input only. Screenshots are local ignored files; none uploaded.

- 37 focused Vitest cases passed (strict content, URL redaction/unsafe URL rejection, owner isolation, CAS race, delete tombstone, backend failure, image durability closed).
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
- Disabled server API and cookie-scoped adapter have 13 additional synthetic HTTP integration cases (37 total focused tests).
- `node scripts/test-do-saved-sql.cjs`: 35 checks pass on a disposable local PGlite PostgreSQL database, including a new-instance reopen. No hosted SQL or real auth used.
- Decoder memory claim corrected: compressed input/accepted dimensions are bounded; peak decode memory is not guaranteed.
- Initial preview cancellation was explicitly performed by this agent through Vercel cancellation API for dpl_6w1PrW5qL1uoE3fv7CaPxSisZdxy; the returned state was CANCELED. It was not build-success evidence. Parent subsequently clarified normal PR preview verification is authorised.
