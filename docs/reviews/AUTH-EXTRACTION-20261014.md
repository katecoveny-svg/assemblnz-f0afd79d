# Local auth extraction — 14 October 2026

Base f62bf077ab399a9797fbefa276afc3e3ad20332b. Extracted current relevant behavior from 210563db; no old UI copied. Existing magic-first mode, duplicate-submit exclusion, rate cooldown, social providers and native return behavior remain.

Browser refresh reads a non-secret retention mirror on every cookie write and uses the existing 90-day/24-hour policy. Server and middleware derive that mirror from the canonical HttpOnly preference. Missing/invalid mirror fails short; production token/verifier writes are Secure; chunk deletions and PKCE lifetime remain intact. This changes browser retention, not Supabase server session duration or authorization.

Login responses are ignored after form identity/credentials/preference/mode changes, pending-window focus loss or unmount. Single-flight remains until the action settles. This is a UI response guard: it cannot cancel already dispatched authentication or undo server Set-Cookie. A concurrent sign-in in another tab can still race a pending server action; native/multi-tab session mutation needs independent integration review before claiming account-switch safety at the session layer. Tests prove stale UI success/error/redirect suppression only.

Validation: 30 focused tests across Supabase adapters/login/security; full typecheck; scoped ESLint; scripts/review-login-stale.cjs with fictional deferred actions (edited A→B email, mode switch, blur, unmount, current failure/cooldown). No live auth/provider calls or secrets. Supabase current SSR guide checked; installed API exports inspected by tests. Local only; publication and independent review pending.
