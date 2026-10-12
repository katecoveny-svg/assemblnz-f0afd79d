# DO authentication reliability review

Base: current `origin/main` 3b036cb97 (Gemini resampling PR1518), including Write/Talk PR1516. No microphone, native app, schema, RLS, memory or production settings changes.

## Verified defects and reused work

- `tuneAuthCookieOptions` overwrote Supabase's `maxAge=0` deletion with 90 days or 24 hours. This can retain empty/obsolete auth chunks through logout and token chunk rotation. Preserve deletion as issued; do not extend expiry.
- DO login rendered the form without validating an existing account session. A valid persistent cookie could therefore still lead to another sign-in request. Validate via server `getUser`; skip login only for a real, non-anonymous user without error.
- Middleware discarded auth cookie mutations when returning a new protected-route redirect. It also ignored Supabase SSR's refresh cache headers. Preserve deletion/refresh cookie updates and private cache headers on the returned response.
- Interrupted login requests had no recovery message or duplicate-submit guard. The reused form handles interruptions, send throttling and allows password selection after requesting an email link.

Auth-only changes reused from 2338edb552056ad4ba9b22c04c9063733c391cf6, an ancestor of `codex/do-auth-preparation-staging` at 51bc22da1. The separately reported `codex/do-auth-memory-reliability`/e3f1fddd3 was absent in both local object checks and remote branch fetch. No preparation/schema changes were imported.

The checkout's current main does not contain the knowledge registry, so the primary checkout's registry and its two listed updates were inspected. No relevant auth-specific `.agents/skills` was found.

## Persistence and boundaries

Auth uses Supabase SSR cookies, not localStorage/sessionStorage. localStorage `assembl-remember-device` remembers the checkbox; it is not a token. The existing HttpOnly preference controls server refresh cookie lifetime (90 days/24 hours). Browser SDK cookie writes currently use its default lifetime; this is an inconsistency requiring separate validation, not evidence of this user's loss of session. No broader persistence policy was introduced.

Cookies are host-scoped (no Domain widening). DO confirmation uses canonical www; admin auth uses demo. PKCE requires the initiating browser's verifier. Token-hash confirmation supports a different browser but signs in only that receiving browser. Safari, standalone PWA, Chrome, third-party iframe and native WKWebView storage must not be assumed shared. Third-party blocking/partitioning may prevent an embedded widget from seeing a first-party session.

Native companion uses `WKWebView(frame: .zero)`, with no nonpersistent data-store override found. External links open via NSWorkspace. An email link opened in Chrome cannot authenticate its separate WKWebView. The running installed native app was not quit, replaced or altered.

The Library screenshot was materialised using a current transfer and its local bytes verified: 198725-byte JPEG, 1206×1608. Pixels show the default DO form and checked remember option, but establish neither an actual credential rejection nor the owning browser/device. No secrets were copied.

## Password diagnosis limits

The toggle switches React form mode; the action calls `signInWithPassword`. Credential/provider failures use a generic message to avoid account enumeration. Email-link account creation does not create a password. Added clear existing-password guidance and interrupted-request feedback. The user's password presence and exact device failure remain unverified: no password, magic link, refresh token or private session was requested, read or entered. A authorised metadata-only check may report `has_password` as a boolean once the correct account is verified; never retrieve a hash.

## Provider preparation and secure setup

Google/Apple share the existing server Supabase PKCE callback and cookie policy. Only public `/auth/v1/settings` enabled booleans are inspected. Live canonical project check: Google disabled, Apple disabled, email enabled. A provider additionally requires its explicit `AUTH_GOOGLE_VERIFIED=1` or `AUTH_APPLE_VERIFIED=1` release gate before its button appears. Disabled/unknown/network-failed settings keep email/password available. Native-review pages and actions reject this web OAuth flow: Google OAuth must not run in an embedded WKWebView. No manual identity linking configuration was enabled and no identities were merged in app code.

Before enabling Google, the owner must approve: a web OAuth client, consent-screen branding/audience, only identity scopes (openid/email/profile), authorised origin `https://www.assembl.co.nz` (demo separately if desired), and redirect URI `https://wurwcrgxjjwqdaxqceey.supabase.co/auth/v1/callback`; securely enter its client ID/secret into Supabase and enable Google. Add exact app callback `https://www.assembl.co.nz/auth/callback` to the existing redirect allowlist if absent; no wildcards. Verify valid/error/cancelled callbacks before setting the release gate. Do not configure on the user's behalf without approval.

Before enabling Apple, the owner must approve: Sign in with Apple App ID/Services ID, associated web domain/return URL (same Supabase callback), Team ID/Key ID and securely managed signing key/client-secret JWT; renew the web client secret within Apple's maximum six-month lifetime. Securely enter credentials and enable Apple only after approval. Apple Hide My Email may yield a relay address different from the existing assembl account. Supabase's verified-email automatic linking does not guarantee that those two addresses resolve to the same account. Existing users should authenticate their current account before connecting another identity through an explicitly approved supported linking flow; no email-only merge or ownership transfer. A native system authentication session with secure app callback remains separate work.

Primary docs: [SSR session guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide), [Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple), [identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking).

## Verification

34 focused tests in 9 files pass with fictional sessions. Repository lint and changed-source ESLint pass. Typecheck passes with the complete existing staging dependencies. A clean Playwright browser switches from email-link to password form; 375×812 pixels were inspected and show the password field, remember checkbox and switch-back control without horizontal overflow. No credential entered and no actual signed-in close/reopen tested. Build status is recorded in the PR.

## Rollout acceptance

Do not merge/deploy until a preview is green and the relevant device scenario is established. Use user-operated sign-in: ordinary Safari close/reopen, reload, access-token refresh, logout/reopen, server revocation, callback interruption/missing verifier, expired/replayed email confirmation; standalone PWA and native companion separately. Record host/surface, whether the checkbox was selected and outcome only; never capture token/cookie values. Ensure the same existing account owns its previous work. Google/Apple require separate existing/new-account, cancellation and Apple relay checks after secure setup. No actual signed-in iPhone evidence was collected by this task.
