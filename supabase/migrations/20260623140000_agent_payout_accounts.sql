-- Stripe Connect payout accounts.
--
-- Backs per-agent revenue distribution: Dash publishers and (future) agent
-- creators connect a Stripe Express account so assembl can pay them out their
-- share. One Express account per user. The Stripe account id (acct_...) is the
-- join key the webhook uses to mirror onboarding + capability status back here.
--
-- Money movement itself is NOT stored here — this table only tracks the account
-- and its Stripe-reported capabilities (charges/payouts enabled, KYC done).
-- A payout ledger is a separate concern (see lib/dash/payouts.ts).
--
-- RLS: strictly owner-scoped. A user can only ever see or edit their own payout
-- account; the webhook writes via the service role (which bypasses RLS).

BEGIN;

CREATE TABLE IF NOT EXISTS public.agent_payout_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- Stripe Connect account id (acct_...). Unique — one per user.
  stripe_account_id text NOT NULL UNIQUE,
  account_type text NOT NULL DEFAULT 'express' CHECK (account_type IN ('express', 'standard', 'custom')),
  country text NOT NULL DEFAULT 'NZ',
  -- Stripe-reported capability flags, mirrored from account.updated webhooks.
  charges_enabled boolean NOT NULL DEFAULT false,
  payouts_enabled boolean NOT NULL DEFAULT false,
  details_submitted boolean NOT NULL DEFAULT false,
  -- Derived lifecycle status for the UI: pending → onboarding → active /
  -- restricted. Set by the webhook from the capability flags + requirements.
  onboarding_status text NOT NULL DEFAULT 'pending'
    CHECK (onboarding_status IN ('pending', 'onboarding', 'active', 'restricted')),
  -- Timestamp of the most recent paid payout (payout.paid webhook).
  last_payout_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- One payout account per user.
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS agent_payout_accounts_user_idx
  ON public.agent_payout_accounts (user_id);
CREATE INDEX IF NOT EXISTS agent_payout_accounts_stripe_idx
  ON public.agent_payout_accounts (stripe_account_id);

ALTER TABLE public.agent_payout_accounts ENABLE ROW LEVEL SECURITY;

-- Owner-scoped read. Writes happen via the service role (webhook + onboarding
-- server action), which bypasses RLS — so no INSERT/UPDATE policy is granted to
-- authenticated users (they must never set their own capability flags).
DROP POLICY IF EXISTS agent_payout_accounts_owner_select ON public.agent_payout_accounts;
CREATE POLICY agent_payout_accounts_owner_select ON public.agent_payout_accounts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

COMMIT;

-- Verification:
-- SELECT user_id, stripe_account_id, onboarding_status, payouts_enabled
--   FROM public.agent_payout_accounts;
-- A user can only ever read their own row (auth.uid()).
