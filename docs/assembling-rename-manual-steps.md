# Assembling rename — manual steps for Kate

The `dash` sub-brand (formerly "Beat", PR #424) is now **Assembling** in code:
routes moved from `/dash` to `/assembling` with 301s, and all user-visible
"Dash" / "Dash by assembl" copy on the microsite, sponsored lines, sitemap and
waitlist emails now reads "Assembling" / "Assembling by assembl". The name
intentionally does double duty: it is both the wait-state ad network and the
branded "assembling..." loader state across assembl chat UIs.

The steps below cannot be done from the repo and need Kate (or a follow-up
decision).

## External steps

1. **Social handles.** No dash social handles are hardcoded in the repo, but
   any external accounts (X/Twitter, Instagram, LinkedIn, TikTok) registered as
   "dash" / "dashbyassembl" need renaming to the Assembling equivalents in each
   platform's settings.
2. **Vercel domain alias.** If `dash.assembl.co.nz` is aliased in Vercel, keep
   it live but repoint / redirect it to `assembl.co.nz/assembling` (the footer
   and investor one-pager now print `assembl.co.nz/assembling` as the address).
   Retire the alias once traffic dies down.
3. **Brevo.** Waitlist notification email subjects now say "Assembling — ...".
   If any Brevo templates, list names or automations mention "Dash", rename
   them in the Brevo dashboard.

## Deliberately NOT renamed (follow-up decisions)

- **`/api/dash/*` API routes and the SDK** (`packages/dash-sdk`,
  `@assembl/dash`). External consumers depend on the namespace; renaming the
  API/SDK is a separate, breaking decision. The SDK page still shows the
  `Dash.init()` / `Dash.show()` code and `docs.dash.assembl.co.nz` because that
  is the real, published API surface today.
- **`dash_*` database tables** (campaigns, impressions, payouts, waitlist).
  Renaming breaks the deployed schema, and there is a known unresolved `dash_*`
  schema fork — leave until that is resolved.
- **Customer pilots** using "Dash" as a partner-facing product name
  (Air NZ x Dash at `/customers/air-nz/dash`, Everyday Rewards x Dash at
  `/customers/everyday-rewards/dash`). Those are pilot-facing names; leave
  until Kate decides.
- **Internal identifiers**: the `.dash-kit` CSS scope, `--dash-*` tokens,
  `DashLoader` / `isDashMicrosite` and friends, `/dash/*` and `/images/dash/*`
  public asset paths, and the `docs/dash-*` design-handoff docs. Display-only
  rename was the brief; these carry no user-visible copy.
- The coin-catching mini-game on `/assembling/interactive` is now called
  "Coin Dash" (lowercase-d dash as in "to dash", not the old brand) so the
  copy still reads naturally.
