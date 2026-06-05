-- Self-serve subscriptions — the conversion tier between free HAPAI and the
-- $5,000/mo kete pack. Per Claude Code work order (June 2026), P3.
--
-- One row per Stripe subscription, mirrored from Stripe by the webhook. The
-- requireTier() gate reads this table (service role) to decide workflow access.
-- Tier is derived from the Stripe price id by the webhook, never trusted from
-- the client. Draft-only posture is absolute on every tier (enforced in app
-- code, documented in lib/billing/tiers.ts) — paying never unlocks auto-lodging.

BEGIN;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('solo', 'team')),
  status text NOT NULL,                       -- Stripe subscription status
  stripe_customer_id text,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_tenant_idx ON public.subscriptions (tenant_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions (status);

-- updated_at touch trigger (reuse the project convention)
CREATE OR REPLACE FUNCTION public.subscriptions_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN new.updated_at := now(); RETURN new; END;
$$;

DROP TRIGGER IF EXISTS subscriptions_set_updated_at_trg ON public.subscriptions;
CREATE TRIGGER subscriptions_set_updated_at_trg
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.subscriptions_set_updated_at();

-- RLS: members of the tenant may read their own subscription; only the service
-- role (webhook + server gate) writes. No client-side writes — the client is
-- never trusted for entitlement.
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscriptions_select_members ON public.subscriptions;
CREATE POLICY subscriptions_select_members ON public.subscriptions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = subscriptions.tenant_id
        AND tm.user_id = auth.uid()
    )
  );

-- No INSERT/UPDATE/DELETE policy = writes are service-role only.

COMMIT;

-- Verification:
-- SELECT count(*) FROM subscriptions;
-- INSERT INTO subscriptions (tenant_id, tier, status, stripe_subscription_id)
--   VALUES ('<tenant-uuid>', 'solo', 'active', 'sub_test_123');
