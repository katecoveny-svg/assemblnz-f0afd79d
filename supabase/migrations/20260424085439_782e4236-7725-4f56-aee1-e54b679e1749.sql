-- Create purchase approvals table for parent-controlled spending requests
CREATE TABLE IF NOT EXISTS public.toroa_purchase_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  child_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  jar text NOT NULL DEFAULT 'spend',
  description text NOT NULL,
  item_url text,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by uuid,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_toroa_purchase_approvals_family ON public.toroa_purchase_approvals(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_purchase_approvals_child ON public.toroa_purchase_approvals(child_id);
CREATE INDEX IF NOT EXISTS idx_toroa_purchase_approvals_status ON public.toroa_purchase_approvals(status);

ALTER TABLE public.toroa_purchase_approvals ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.validate_toroa_purchase_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status NOT IN ('pending','approved','rejected','cancelled') THEN
    RAISE EXCEPTION 'status must be pending, approved, rejected, or cancelled';
  END IF;
  IF NEW.jar NOT IN ('save','spend','give') THEN
    RAISE EXCEPTION 'jar must be save, spend, or give';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_toroa_purchase_status ON public.toroa_purchase_approvals;
CREATE TRIGGER trg_validate_toroa_purchase_status
BEFORE INSERT OR UPDATE ON public.toroa_purchase_approvals
FOR EACH ROW EXECUTE FUNCTION public.validate_toroa_purchase_status();

DROP TRIGGER IF EXISTS trg_toroa_purchase_approvals_updated_at ON public.toroa_purchase_approvals;
CREATE TRIGGER trg_toroa_purchase_approvals_updated_at
BEFORE UPDATE ON public.toroa_purchase_approvals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Family-member RLS policies for the four money tables (read + write for whānau)
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'toroa_child_pocket_money',
    'toroa_chore_assignments',
    'toroa_money_transactions',
    'toroa_savings_goals',
    'toroa_purchase_approvals'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS family_members_select ON public.%I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS family_members_insert ON public.%I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS family_members_update ON public.%I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS family_members_delete ON public.%I', tbl);

    EXECUTE format($p$CREATE POLICY family_members_select ON public.%I FOR SELECT TO authenticated USING (public.is_family_member(auth.uid(), family_id))$p$, tbl);
    EXECUTE format($p$CREATE POLICY family_members_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_family_member(auth.uid(), family_id))$p$, tbl);
    EXECUTE format($p$CREATE POLICY family_members_update ON public.%I FOR UPDATE TO authenticated USING (public.is_family_member(auth.uid(), family_id)) WITH CHECK (public.is_family_member(auth.uid(), family_id))$p$, tbl);
    EXECUTE format($p$CREATE POLICY family_members_delete ON public.%I FOR DELETE TO authenticated USING (public.is_family_member(auth.uid(), family_id))$p$, tbl);
  END LOOP;
END $$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_toroa_chore_assignments_child ON public.toroa_chore_assignments(child_id);
CREATE INDEX IF NOT EXISTS idx_toroa_chore_assignments_family_status ON public.toroa_chore_assignments(family_id, status);
CREATE INDEX IF NOT EXISTS idx_toroa_money_transactions_child ON public.toroa_money_transactions(child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_toroa_savings_goals_child ON public.toroa_savings_goals(child_id);
CREATE INDEX IF NOT EXISTS idx_toroa_child_pocket_money_family ON public.toroa_child_pocket_money(family_id);

-- updated_at triggers where missing
DROP TRIGGER IF EXISTS trg_toroa_child_pocket_money_updated_at ON public.toroa_child_pocket_money;
CREATE TRIGGER trg_toroa_child_pocket_money_updated_at
BEFORE UPDATE ON public.toroa_child_pocket_money
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();