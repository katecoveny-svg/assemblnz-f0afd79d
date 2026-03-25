import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EASYPOST_KEY = Deno.env.get("EASYPOST_API_KEY");
const BASE_URL = "https://api.easypost.com/v2";

interface FreightRequest {
  action: "track" | "create_tracker" | "get_rates" | "eta";
  tracking_code?: string;
  carrier?: string;
  shipment_id?: string;
}

async function easyPostFetch(path: string, method = "GET", body?: any): Promise<any> {
  const resp = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${EASYPOST_KEY}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return resp.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!EASYPOST_KEY) {
      return new Response(JSON.stringify({
        error: "EASYPOST_API_KEY not configured",
        setup: "Add EASYPOST_API_KEY from easypost.com to enable shipment tracking.",
        demo: {
          tracking_code: "DEMO-1234567890",
          carrier: "USPS",
          status: "in_transit",
          eta: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
          events: [
            { timestamp: new Date().toISOString(), description: "Package in transit", location: "Auckland, NZ" },
            { timestamp: new Date(Date.now() - 86400000).toISOString(), description: "Package picked up", location: "Wellington, NZ" },
          ],
        },
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, tracking_code, carrier, shipment_id }: FreightRequest = await req.json();
    let result: any = {};

    switch (action) {
      case "track":
      case "create_tracker":
        if (!tracking_code) {
          result = { error: "tracking_code required" };
        } else {
          result = await easyPostFetch("/trackers", "POST", {
            tracker: { tracking_code, carrier: carrier || undefined },
          });
        }
        break;

      case "eta":
        if (!tracking_code) {
          result = { error: "tracking_code required" };
        } else {
          result = await easyPostFetch("/trackers", "POST", {
            tracker: { tracking_code, carrier: carrier || undefined },
          });
          if (result.est_delivery_date) {
            result.eta_summary = `Estimated delivery: ${result.est_delivery_date}`;
          }
        }
        break;

      default:
        result = { error: `Unknown action: ${action}`, available_actions: ["track", "create_tracker", "eta"] };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("iot-freight-tracking error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
