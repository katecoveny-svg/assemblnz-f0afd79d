# xero-sync-happy-tails

Xero integration for the **Happy Tails × Keeper** pilot. Pulls Happy Tails
invoices, matches lines to the booking roster, and drafts next month's invoice as
a **Xero DRAFT** for Liana to review and Issue.

> **Safety:** this function never issues or sends an invoice — drafts only. It
> never returns or writes Xero data outside the Happy Tails tenant.

## How it fits together

| Piece | Path | Role |
|---|---|---|
| Edge function | `supabase/functions/xero-sync-happy-tails/index.ts` | pulls invoices, drafts next month, refreshes tokens |
| OAuth callback | `app/api/xero/happy-tails/callback/route.ts` | exchanges the auth code, stores tokens on the tenant row |
| Invoice logic | `lib/xero/happy-tails.ts` | reconciliation + draft-invoice builder + INV-3031 mock |
| Token storage | `tenant_customers.xero_tokens` (jsonb) | encrypted at rest via Supabase Vault where available |

The existing repo Xero stack (`xero-oauth-start`, `xero-oauth-callback`,
`xero-connector`, `xero-sync`) handles the generic multi-tenant flow. This
function is the Happy-Tails-scoped wrapper so the pilot demo is self-contained.

## Environment variables (set in Vercel + Supabase — never paste secrets)

```
XERO_CLIENT_ID        # OAuth 2.0 app client id (PKCE for prod)
XERO_CLIENT_SECRET    # OAuth 2.0 app client secret
XERO_TENANT_ID        # Happy Tails' Xero organisation id
XERO_REDIRECT_URI     # https://<preview-or-domain>/api/xero/happy-tails/callback
```

If any are missing the pilot runs in **mocked mode** on the real INV-3031 numbers
(4 daycare + 5 overnight small-pup = NZ$665), so the demo still reconciles
end-to-end. Check status with `{ "action": "status" }`.

## Actions

```jsonc
{ "action": "status" }            // report live | mocked + which env vars are missing
{ "action": "list_invoices" }     // list Happy Tails ACCREC invoices (or the mock)
{ "action": "create_next_draft" } // create next month's invoice as a Xero DRAFT (never issued)
```

## Deploy

```bash
supabase functions deploy xero-sync-happy-tails
# then set the four XERO_* secrets in the Supabase dashboard
```

## Go-live checklist

1. Create a Xero OAuth 2.0 app; add the redirect URI above.
2. If Kate doesn't yet have Xero API access for Happy Tails, stay in mocked mode
   until Liana connects Happy Tails' own Xero during onboarding.
3. Set the four `XERO_*` env vars in Vercel (Next side) + Supabase (edge fn side).
4. Apply migration `20260701140000_happy_tails_tenant.sql` so `tenant_customers`
   exists for token storage.
