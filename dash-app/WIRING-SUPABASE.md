# Wiring the DashLoader stubs to real Supabase

**Goal:** switch `DashLoader.tsx` from demo mode to a live backend — fetch a real sponsored line, credit a real wallet. Hand this whole file to Claude alongside `components/DashLoader.tsx`.

> Plain English: right now the loader fakes the ad and the earnings. After this, it asks your Supabase "Brain" (the two Edge Functions) for a real ad and records real credits in the database.

---

## Step 0 — Prerequisites (once)
1. `supabase/schema.sql` has been run in your Supabase project.
2. The two Edge Functions are deployed:
   ```bash
   npx supabase functions deploy serve-slot
   npx supabase functions deploy record-view
   ```
3. `.env.local` has:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOURPROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
4. You have one `hosts` row; its `api_key` is your `DASH_HOST_KEY`.

Function URLs are: `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/serve-slot` and `.../record-view`.

---

## Step 1 — Add a tiny Dash API helper
Create `lib/dashApi.ts`:

```ts
const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const dashLive = !!(BASE && ANON); // false => demo mode

async function call(fn: string, body: unknown) {
  const res = await fetch(`${BASE}/functions/v1/${fn}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ANON}`, // anon key is fine; functions use service role internally
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function serveSlot(hostApiKey: string, context: string) {
  return call("serve-slot", { host_api_key: hostApiKey, context });
}

export function recordView(p: {
  user_id: string; host_id?: string; campaign_id?: string;
  context: string; viewed_seconds: number; clicked: boolean; device_hash?: string;
}) {
  return call("record-view", p);
}
```

---

## Step 2 — Make sure the user exists (app_users)
The wallet is keyed to a user row. On first load, upsert one for the logged-in person (in Assembl, reuse the Assembl user id).

Add to `lib/dashApi.ts` (uses the browser client from `lib/supabaseClient.ts`):
```ts
import { supabase } from "./supabaseClient";

export async function ensureUser(authId?: string): Promise<string | null> {
  if (!supabase) return null; // demo mode
  // try find existing
  const { data: found } = await supabase
    .from("app_users").select("id").eq("auth_id", authId ?? "").maybeSingle();
  if (found?.id) return found.id;
  // create
  const { data: created } = await supabase
    .from("app_users").insert({ auth_id: authId ?? null, opted_in: false })
    .select("id").single();
  return created?.id ?? null;
}
```
> Note: this needs an INSERT policy if RLS is on. For the pilot you can keep RLS off, or do the upsert inside a third Edge Function with the service role (safer). Start simple, harden before launch.

---

## Step 3 — Wire DashLoader
In `components/DashLoader.tsx`:

1. **Imports + props.** Add `userId` and `hostApiKey` props (the agent passes these):
```ts
import { serveSlot, recordView, dashLive } from "@/lib/dashApi";
// in the component signature:
//   userId?: string; hostApiKey?: string;
```

2. **Replace the demo ad** with a fetched one. At the top of `startWorking`, before the timer:
```ts
let adLine = `${DEMO_AD.brand} — ${DEMO_AD.line}`; // fallback
let campaignId: string | undefined;
if (dashLive && hostApiKey) {
  const slot = await serveSlot(hostApiKey, context);
  if (slot?.ad_line) { adLine = slot.ad_line; campaignId = slot.campaign_id; }
}
// store adLine + campaignId in state and render them instead of DEMO_AD
```
(Make `startWorking` async, and keep the demo fallback so it still works with no backend.)

3. **Replace the credit stub** at task completion (where `setPhase("done")` happens):
```ts
const viewedSeconds = 120 - eta; // or your real elapsed time
if (dashLive && userId && optedIn) {
  await recordView({
    user_id: userId,
    campaign_id: campaignId,
    context,
    viewed_seconds: viewedSeconds,
    clicked: false,
  });
  // optional: re-fetch balance from `wallet_balances` to show the real number
}
```

4. **Earnings display:** in demo mode keep the local counter; in live mode, trust `record-view`'s response (`{ credited }`) and/or read `wallet_balances` for the true total.

> Keep every change behind `if (dashLive)` so the component still runs in demo mode with no env vars. That way the marketing demo never breaks.

---

## Step 4 — Test
1. With `.env.local` set, run `npm run dev`, opt in, let a task finish.
2. In Supabase → Table editor, confirm an `impressions` row and a `wallet_entries` credit appeared.
3. Try to cheat: finish two tasks within a minute → second one should NOT credit (the 60s guard in `record-view`).
4. Query `wallet_balances` → it equals the sum of `wallet_entries`.

**Ask Claude to add a unit test** that inserts known ledger rows and asserts the summed balance — money logic must be exact.

---

## Step 5 — Before launch (not for the pilot)
- Turn on **RLS** (checklist task 1.3) and move the `ensureUser` upsert into a service-role Edge Function.
- Add `device_hash` (a simple fingerprint) and pass it to `record-view` for fraud scoring.
- Add redemption → reward partner (charity batch first), then Stripe cash tier with KYC + threshold.

*Pairs with `dash-build-checklist.md` (Phases 2–4) and `dash-assembl-agent-integration-brief.md`.*
