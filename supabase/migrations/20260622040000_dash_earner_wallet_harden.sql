-- ============================================================
-- dash– earner wallet: lock the surface to service-role only
-- ------------------------------------------------------------
-- Follows 20260622030000_dash_earner_wallet.sql. The wallet API always uses
-- the service-role client and derives the earner id from the signed-in session,
-- so anon/authenticated need no direct access — and must NOT have it:
--   * dash_earner_balances is SECURITY DEFINER; without this it would expose
--     every earner's balance to anyone with SELECT.
--   * dash_redeem_earner takes p_party_id as an argument, so a direct caller
--     could otherwise redeem someone else's balance.
-- Resolves the `security_definer_view` + `*_security_definer_function_executable`
-- advisor findings.
-- ============================================================

ALTER VIEW public.dash_earner_balances SET (security_invoker = true);
REVOKE ALL ON public.dash_earner_balances FROM anon, authenticated;
GRANT SELECT ON public.dash_earner_balances TO service_role;

REVOKE EXECUTE ON FUNCTION public.dash_redeem_earner(text, numeric, text, text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.dash_redeem_earner(text, numeric, text, text) TO service_role;
