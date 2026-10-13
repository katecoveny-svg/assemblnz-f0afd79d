# DO task scenes and Ask DO launcher

UI-only review on `codex/do-task-art-launcher`, based on main `8d8512139`.

Uses the exact locked glass D via `GlassIdentity`, extends shared task ideas with original static SVG scenes, and aligns the hosted portable source with Write / Speak navigation. Groceries, messages, travel, school, daily briefing, bills, pets, car and home share paper, plum, rose and restrained reflective materials. Scene art is decorative; state and links stay HTML. SVG arrows replace text arrows in the scoped task/portable flow. About's duplicate portable mount is removed so the global Ask DO launcher has one owner.

Write opens/focuses the existing draft. Speak opens the existing full-window availability gate; it does not start audio or transfer draft text. Draft-loss confirmation, account invalidation, source review, capture sandbox and provider consent are unchanged. No installed extension/native update, permission change, production configuration, SQL or external action is included. No grocery model or homepage startup transition files changed.

## Evidence

- Local focused entry/portable/hydration tests: 3 files, 4 tests passed (including the portable contract subprocess).
- Changed-file ESLint, brand guard and macron guard passed.
- Actual `/about` panel reviewed at 390px and desktop 1440px; 375px overflow check passed; reduced-motion exercised. Original groceries/email/travel scenes and school/briefing rows inspected.
- Write focus, school starter population and declined draft-close preservation exercised. Speak destination inspected only: voice service is not established by UI proof.
- Local screenshots: `output/playwright/mobile-scenes.png`, `mobile-school-briefing.png`, `desktop-panel.png`.
- Local unsigned provider request correctly returns 401. `/do/widget` returns the existing workspace-verification failure when local session configuration is unavailable; no guard was bypassed. Hosted browser proof uses the actual signed-out public panel.
- Hosted workflow `do-task-art-review.yml` runs full typecheck, DO core/entry/personal tests, scoped lint, macron guard, guarded production build and browser proof at 375/390/1440px. Its `do-task-art-proof` artifact contains screenshots and a structured report.

Reversal: revert this PR. No migrations, stored-data changes or asset deletion.
