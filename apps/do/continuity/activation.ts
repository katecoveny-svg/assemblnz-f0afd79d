/** Durable cross-device tasks are switched on per deployment, never by default.
 * The schema ships in supabase/migrations/20261013091000_do_continuity.sql; proofs in
 * scripts/test-do-continuity-pglite.cjs. Each owner still has to turn sync on for
 * themselves through do_continuity_access, so the flag alone stores nothing. */
export function continuityDurableActive(): boolean {
  return process.env.DO_CONTINUITY_DURABLE_ENABLED === 'true';
}
