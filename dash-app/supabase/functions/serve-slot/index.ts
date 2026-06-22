// Edge Function: serve-slot
// Returns one sponsored line for a host's wait. Deploy with:  supabase functions deploy serve-slot
// Call: POST { host_api_key, context }  ->  { campaign_id, ad_line, reward_text }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // server-side only
);

Deno.serve(async (req) => {
  try {
    const { host_api_key, context } = await req.json();

    // 1) validate the host
    const { data: host } = await supabase
      .from("hosts").select("id").eq("api_key", host_api_key).single();
    if (!host) return json({ error: "invalid host" }, 401);

    // 2) pick the highest-bidding active campaign
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, ad_line, reward_text")
      .eq("status", "active")
      .order("bid_cents", { ascending: false })
      .limit(1)
      .single();
    if (!campaign) return json({ error: "no campaign" }, 404);

    return json({
      campaign_id: campaign.id,
      ad_line: campaign.ad_line,
      reward_text: campaign.reward_text,
      context,
    });
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
