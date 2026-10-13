# Saved board local proof

Local Next.js development route `/do/saved`, Chromium, fictional input only. Screenshots are local ignored files; none uploaded.

- 24 focused Vitest cases passed (strict content, URL redaction/unsafe URL rejection, owner isolation, CAS race, delete tombstone, backend failure, image durability closed).
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

No production SQL, schema, security/config change, deployment or merge performed. SQL proposal has not been executed; fake-port unit tests do not establish database durability. Full production build deferred on the shared Mac; hosted/release build remains a gate. Initial full typecheck found only a missing local canvas `tsup` dependency; the workspace dependency link was then supplied and the full typecheck rerun passed (exit 0).
