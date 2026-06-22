-- ============================================================
-- dash– earner wallet: balance view + atomic reward redemption
-- ------------------------------------------------------------
-- Additive only. Builds on dash_payout_ledger (party_type='earner')
-- and dash_payouts from 20260619034901_dash_schema.sql.
--
-- The consumer ("earner") balance is the running sum of their ledger
-- (credits earned from waits, minus debits from redemptions). Redeeming
-- sends the balance to a REWARD — Airpoints / KiwiSaver / Prezzy or a
-- charity donation — never a cash-out.
-- ============================================================

-- Running balance per earner (credits − debits).
CREATE OR REPLACE VIEW public.dash_earner_balances AS
SELECT
  party_id AS earner_id,
  COALESCE(SUM(CASE WHEN direction = 'credit' THEN amount_nzd ELSE -amount_nzd END), 0)::numeric(12,2)
    AS balance_nzd
FROM public.dash_payout_ledger
WHERE party_type = 'earner'
GROUP BY party_id;

-- Atomic redemption: validate threshold + balance, then write the payout
-- row and the matching debit ledger row together. A per-earner advisory
-- lock (held for the transaction) serialises concurrent redeems so a
-- balance can never be double-spent.
CREATE OR REPLACE FUNCTION public.dash_redeem_earner(
  p_party_id          text,
  p_amount            numeric,
  p_destination_kind  text,  -- 'self' (reward) | 'charity' (donation)
  p_destination       text   -- 'airpoints' | 'kiwisaver' | 'prezzy' | charity slug
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_threshold CONSTANT numeric(12,2) := 5.00;  -- NZ$5 minimum
  v_balance   numeric(12,2);
  v_method    text;
  v_payout_id uuid;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'redeem amount must be positive';
  END IF;
  IF p_amount < v_threshold THEN
    RAISE EXCEPTION 'minimum redemption is %', v_threshold;
  END IF;
  IF p_destination_kind NOT IN ('self', 'charity') THEN
    RAISE EXCEPTION 'invalid destination kind: %', p_destination_kind;
  END IF;

  -- Serialise redemptions for this earner within the transaction.
  PERFORM pg_advisory_xact_lock(hashtext('dash_earner:' || p_party_id));

  SELECT COALESCE(SUM(CASE WHEN direction = 'credit' THEN amount_nzd ELSE -amount_nzd END), 0)
    INTO v_balance
    FROM public.dash_payout_ledger
   WHERE party_type = 'earner' AND party_id = p_party_id;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient balance: % < %', v_balance, p_amount;
  END IF;

  v_method := CASE WHEN p_destination_kind = 'charity' THEN 'donation' ELSE 'stripe_connect' END;

  INSERT INTO public.dash_payouts
    (party_type, party_id, amount_nzd, method, destination, threshold_nzd, status)
  VALUES
    ('earner', p_party_id, p_amount, v_method, p_destination, v_threshold, 'pending')
  RETURNING id INTO v_payout_id;

  INSERT INTO public.dash_payout_ledger
    (party_type, party_id, direction, amount_nzd, reason, payout_id)
  VALUES
    ('earner', p_party_id, 'debit', p_amount, 'redemption:' || p_destination, v_payout_id);

  RETURN v_payout_id;
END;
$$;

COMMENT ON FUNCTION public.dash_redeem_earner(text, numeric, text, text)
  IS 'Atomically redeem an earner balance to a reward/charity. Advisory-locked per earner; min NZ$5.';
