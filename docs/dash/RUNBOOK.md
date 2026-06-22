# Dash — go-live runbook

Everything Dash needs to run in production, and how to verify it. Code + DB are
done; what remains is environment configuration (secrets), which can only be set
in the Vercel / Supabase dashboards.

Project refs: **Vercel** `assemblnz-f0afd79d` · **Supabase** `wurwcrgxjjwqdaxqceey`.

## 1. Environment variables (Vercel → Settings → Environment Variables)

| Var | Used by | Needed for | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | all Supabase calls | everything | almost certainly already set (rest of app uses it) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client/server auth | everything | ditto |
| `SUPABASE_SERVICE_ROLE_KEY` | `/api/dash/*` (service client) | **wallet live mode**, impressions, payouts | server-only; never expose to client |
| `CRON_SECRET` | `/api/dash/payouts/run` | scheduled payouts | Vercel cron sends `Authorization: Bearer $CRON_SECRET`; route also accepts `DASH_PAYOUTS_RUN_TOKEN` |
| `STRIPE_SECRET_KEY` (+ webhook secret) | `/api/dash/connect/*`, `/api/dash/payout/settle` | **cash** payouts via Stripe Connect | not needed for non-cash rewards (charity / KiwiSaver / Airpoints) |

If `SUPABASE_SERVICE_ROLE_KEY` is missing, `/api/dash/wallet` returns
`{ live: false }` and the wallet page shows a demo balance — that's the safe
fallback, not an error.

## 2. Database (Supabase) — already applied ✅

Applied to `wurwcrgxjjwqdaxqceey` this round:

- `20260622030000_dash_earner_wallet` — `dash_earner_balances` view + `dash_redeem_earner()` RPC
- `20260622040000_dash_earner_wallet_harden` — service-role-only lockdown

Core Dash schema (`dash_publishers`, `dash_charities`, `dash_payout_ledger`,
`dash_payouts`, `dash_impressions`, `dash_campaigns`/`advertisers`/`creatives`,
`dash_consents`, `dash_connect_accounts`, `dash_waitlist`) was already live and
`dash_charities` is seeded (SPCA, Trees That Count, Foodbank NZ).

Verify the wallet objects:

```sql
select count(*) from public.dash_earner_balances;          -- view exists
select proname from pg_proc where proname='dash_redeem_earner';  -- 1 row
```

## 3. Scheduled jobs

`vercel.json` already registers a cron on `/api/dash/payouts/run`. It only runs
once `CRON_SECRET` is set. No other scheduler needed.

## 4. Go-live checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` set on `assemblnz-f0afd79d` (Production)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set
- [ ] `CRON_SECRET` set (enables the payouts cron)
- [ ] (cash only) `STRIPE_SECRET_KEY` + Stripe webhook configured
- [ ] Hit `/dash/wallet` while signed in → balance reads live (not "Demo balance")
- [ ] `get_advisors(security)` shows no new ERROR on `dash_*`

## 5. How the money path works (reference)

1. An agent/host calls the SDK → `/api/dash/serve` returns a sponsored line + reward.
2. Genuine view time → `/api/dash/impression` accrues a credit to the earner's
   `dash_payout_ledger` (party_type `earner`).
3. `dash_earner_balances` sums credits − debits per earner.
4. `/api/dash/wallet` (service role, earner id from session) reads the balance
   and calls `dash_redeem_earner()` to redeem to a reward/charity (min NZ$5,
   advisory-locked, writes a `dash_payouts` row + debit ledger row atomically).
5. `/api/dash/payouts/run` (cron) settles pending payouts.

Non-cash rewards work today; cash payouts switch on with Stripe keys.
