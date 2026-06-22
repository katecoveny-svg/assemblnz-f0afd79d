// Edge Function: record-view
// Logs an impression and credits the wallet (with basic fraud guards). Deploy with:
//   supabase functions deploy record-view
// Call: POST { user_id, host_id, campaign_id, context, viewed_seconds, clicked, device_hash }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const MIN_VIEW_SECONDS = 3;
const CREDIT_VIEW_CENTS = 1;
const CREDIT_CLICK_CENTS = 5;
const DAILY_CAP_CENTS = 200;

Deno.serve(async (req) => {
  try {
    const b = await req.json();
    const { user_id, host_id, campaign_id, context, viewed_seconds, clicked, device_hash } = b;

    if (!user_id) return json({ error: "no user" }, 400);

    // confirm the user opted in
    const { data: user } = await supabase
      .from("app_users").select("opted_in").eq("id", user_id).single();
    if (!user?.opted_in) return json({ credited: 0, reason: "not opted in" });

    // log the impression
    const { data: imp } = await supabase.from("impressions").insert({
      user_id, host_id, campaign_id, context,
      viewed_seconds, clicked: !!clicked, device_hash,
    }).select("id").single();

    // fraud guard 1: one credit per user+campaign per 60s
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count: recent } = await supabase
      .from("wallet_entries").select("id", { count: "exact", head: true })
      .eq("user_id", user_id).gte("created_at", since);
    if ((recent ?? 0) > 0) return json({ credited: 0, reason: "rate limited" });

    // fraud guard 2: daily cap
    const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
    const { data: today } = await supabase
      .from("wallet_entries").select("amount_cents")
      .eq("user_id", user_id).gte("created_at", dayStart.toISOString());
    const earnedToday = (today ?? []).reduce((s, r) => s + (r.amount_cents > 0 ? r.amount_cents : 0), 0);
    if (earnedToday >= DAILY_CAP_CENTS) return json({ credited: 0, reason: "daily cap" });

    // decide the credit
    let credit = 0;
    if (clicked) credit = CREDIT_CLICK_CENTS;
    else if ((viewed_seconds ?? 0) >= MIN_VIEW_SECONDS) credit = CREDIT_VIEW_CENTS;
    if (credit === 0) return json({ credited: 0, reason: "view too short" });

    await supabase.from("wallet_entries").insert({
      user_id, amount_cents: credit,
      reason: clicked ? "click" : "impression", ref_id: imp?.id,
    });

    return json({ credited: credit });
  } catch (e) {
    return json({ error: String(e) }, 400);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
