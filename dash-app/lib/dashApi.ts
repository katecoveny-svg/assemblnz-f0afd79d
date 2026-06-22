// Dash API helper — talks to the Supabase Edge Functions (serve-slot, record-view)
// and the app_users table. Falls back to DEMO MODE when env vars are absent,
// so the app always runs even with no backend.
import { supabase } from "./supabaseClient";

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** true when a real Supabase backend is configured */
export const dashLive = !!(BASE && ANON);

async function callFn(fn: string, body: unknown) {
  const res = await fetch(`${BASE}/functions/v1/${fn}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ANON}`, // anon key; the function uses the service role internally
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${fn} failed: ${res.status}`);
  return res.json();
}

export type Slot = { campaign_id?: string; ad_line?: string; reward_text?: string };

/** Get one sponsored line for a host's wait. */
export function serveSlot(hostApiKey: string, context: string): Promise<Slot> {
  return callFn("serve-slot", { host_api_key: hostApiKey, context });
}

/** Record a view/click and (if eligible) credit the wallet. Returns { credited }. */
export function recordView(p: {
  user_id: string;
  host_id?: string;
  campaign_id?: string;
  context: string;
  viewed_seconds: number;
  clicked: boolean;
  device_hash?: string;
}): Promise<{ credited: number; reason?: string }> {
  return callFn("record-view", p);
}

/** Find or create the app_users row for this person; returns its id (or null in demo mode). */
export async function ensureUser(authId?: string | null): Promise<string | null> {
  if (!supabase) return null; // demo mode
  if (authId) {
    const { data: found } = await supabase
      .from("app_users").select("id").eq("auth_id", authId).maybeSingle();
    if (found?.id) return found.id;
  }
  const { data: created, error } = await supabase
    .from("app_users").insert({ auth_id: authId ?? null, opted_in: false })
    .select("id").single();
  if (error) return null;
  return created?.id ?? null;
}

/** Set the opt-in flag on an app_users row. */
export async function setOptIn(userId: string, value: boolean) {
  if (!supabase) return;
  await supabase.from("app_users").update({ opted_in: value }).eq("id", userId);
}

/** Read the current wallet balance (cents) for a user. */
export async function getBalanceCents(userId: string): Promise<number> {
  if (!supabase) return 0;
  const { data } = await supabase
    .from("wallet_balances").select("balance_cents").eq("user_id", userId).maybeSingle();
  return data?.balance_cents ?? 0;
}
