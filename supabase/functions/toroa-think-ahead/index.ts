import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * TŌRO THINK-AHEAD ENGINE
 * 
 * Scheduled proactive intelligence that runs every morning at 6:30am NZST.
 * Checks each active family's context and sends helpful SMS alerts:
 * - Traffic delays on school routes
 * - Weather warnings (rain, cold, heat)
 * - Upcoming calendar events today
 * - Homework deadlines
 * - Activity reminders
 * 
 * Invoked by pg_cron or manual trigger.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendSms(to: string, message: string): Promise<void> {
  const token = Deno.env.get("TNZ_AUTH_TOKEN");
  const base = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v2.02";
  const from = Deno.env.get("TNZ_FROM_NUMBER") || "TOROA";
  if (!token) return;
  try {
    await fetch(`${base}/send/sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${token}` },
      body: JSON.stringify({ MessageData: { Message: message, Destinations: [{ Recipient: to }], Reference: `toroa-think-${Date.now()}`, FromNumber: from } }),
    });
  } catch (e) { console.error("SMS send error:", e); }
}

async function wasAlertSentToday(sb: any, familyId: string, alertKey: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await sb
    .from("toroa_proactive_alerts")
    .select("id")
    .eq("family_id", familyId)
    .eq("alert_key", alertKey)
    .gte("sent_at", `${today}T00:00:00Z`)
    .limit(1);
  return (data?.length || 0) > 0;
}

async function logAlert(sb: any, familyId: string, alertType: string, alertKey: string, message: string): Promise<void> {
  await sb.from("toroa_proactive_alerts").insert({ family_id: familyId, alert_type: alertType, alert_key: alertKey, message });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const nzNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Pacific/Auckland" }));
  const dayOfWeek = nzNow.getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const todayStr = nzNow.toISOString().split("T")[0];
  
  // Only run proactive alerts on weekdays
  if (!isWeekday) {
    return new Response(JSON.stringify({ status: "weekend_skip", families: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Get all active families
    const { data: families } = await sb
      .from("toroa_families")
      .select("id, primary_phone, status")
      .in("status", ["active", "trial"]);

    if (!families || families.length === 0) {
      return new Response(JSON.stringify({ status: "no_families" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let alertsSent = 0;

    for (const family of families) {
      const alerts: string[] = [];

      // 1. Load family memory
      const { data: memories } = await sb
        .from("toroa_family_memory")
        .select("category, memory_key, memory_value")
        .eq("family_id", family.id)
        .limit(30);

      // 2. Load family locations
      const { data: locations } = await sb
        .from("toroa_family_locations")
        .select("label, address, lat, lon, location_type")
        .eq("family_id", family.id);

      // 3. Check weather
      const homeLoc = locations?.find((l: any) => l.location_type === "home");
      const lat = homeLoc?.lat || -36.85;
      const lon = homeLoc?.lon || 174.76;

      try {
        const weatherResp = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code&hourly=precipitation_probability&forecast_hours=12&timezone=Pacific/Auckland`
        );
        if (weatherResp.ok) {
          const weather = await weatherResp.json();
          const curr = weather.current;
          const hourlyPrecip = weather.hourly?.precipitation_probability || [];
          const maxPrecipProb = Math.max(...hourlyPrecip.slice(0, 6)); // next 6 hours
          
          if (curr.precipitation > 1) {
            const key = `rain-${todayStr}`;
            if (!await wasAlertSentToday(sb, family.id, key)) {
              alerts.push("🌧️ Rain this morning — don't forget jackets & umbrellas!");
              await logAlert(sb, family.id, "weather", key, "Rain alert");
            }
          } else if (maxPrecipProb > 60) {
            const key = `rain-likely-${todayStr}`;
            if (!await wasAlertSentToday(sb, family.id, key)) {
              alerts.push(`🌦️ ${maxPrecipProb}% chance of rain later — might want to pack an umbrella`);
              await logAlert(sb, family.id, "weather", key, "Rain probability alert");
            }
          }
          
          if (curr.temperature_2m < 8) {
            const key = `cold-${todayStr}`;
            if (!await wasAlertSentToday(sb, family.id, key)) {
              alerts.push(`🥶 Chilly morning (${curr.temperature_2m}°C) — warm layers for the kids!`);
              await logAlert(sb, family.id, "weather", key, "Cold alert");
            }
          }
          
          if (curr.temperature_2m > 26) {
            const key = `hot-${todayStr}`;
            if (!await wasAlertSentToday(sb, family.id, key)) {
              alerts.push(`☀️ Hot day ahead (${curr.temperature_2m}°C) — sunscreen, hats & water bottles!`);
              await logAlert(sb, family.id, "weather", key, "Heat alert");
            }
          }
        }
      } catch { /* non-critical */ }

      // 4. Check traffic (if Google Maps key available)
      const googleKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
      if (googleKey && homeLoc?.address) {
        const schoolLoc = locations?.find((l: any) => l.location_type === "school");
        if (schoolLoc?.address) {
          try {
            const params = new URLSearchParams({
              origin: homeLoc.address,
              destination: schoolLoc.address,
              departure_time: "now",
              key: googleKey,
            });
            const resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params}`);
            if (resp.ok) {
              const data = await resp.json();
              if (data.status === "OK" && data.routes?.[0]) {
                const leg = data.routes[0].legs[0];
                const normalMin = Math.round((leg.duration?.value || 0) / 60);
                const trafficMin = Math.round((leg.duration_in_traffic?.value || leg.duration?.value || 0) / 60);
                const delay = trafficMin - normalMin;
                if (delay > 10) {
                  const key = `traffic-school-${todayStr}`;
                  if (!await wasAlertSentToday(sb, family.id, key)) {
                    alerts.push(`🚗 Heads up! School run is ${trafficMin}min today (+${delay}min delay on ${data.routes[0].summary}). Leave ${delay}min earlier!`);
                    await logAlert(sb, family.id, "traffic", key, `${delay}min delay`);
                  }
                }
              }
            }
          } catch { /* non-critical */ }
        }
      }

      // 5. Check calendar events today
      const { data: events } = await sb
        .from("toroa_calendar")
        .select("title, event_time, location")
        .eq("family_id", family.id)
        .eq("event_date", todayStr);

      if (events && events.length > 0) {
        const key = `calendar-${todayStr}`;
        if (!await wasAlertSentToday(sb, family.id, key)) {
          const eventList = events.map((e: any) => `📌 ${e.title}${e.event_time ? ` at ${e.event_time}` : ""}${e.location ? ` (${e.location})` : ""}`).join("\n");
          alerts.push(`📅 Today's events:\n${eventList}`);
          await logAlert(sb, family.id, "calendar", key, `${events.length} events`);
        }
      }

      // 6. If we have alerts, compose and send a morning briefing via AI
      if (alerts.length > 0) {
        // Get child names for personalisation
        const childNames = (memories || [])
          .filter((m: any) => m.category === "children" && m.memory_key.includes("name"))
          .map((m: any) => m.memory_value?.text || "")
          .filter(Boolean);

        const childContext = childNames.length > 0 ? `Children: ${childNames.join(", ")}` : "";

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: `You are Tōro, writing a brief morning SMS briefing for a NZ family. Be warm, concise, and useful. Use te reo naturally. Max 400 chars. Start with "Mōrena! 🌅" ${childContext ? `Reference children by name: ${childContext}` : ""}. End with something encouraging.`
              },
              { role: "user", content: `Compile these alerts into one friendly morning briefing SMS:\n\n${alerts.join("\n")}` }
            ],
            max_tokens: 200,
          }),
        });

        if (aiResp.ok) {
          const result = await aiResp.json();
          const briefing = result.choices?.[0]?.message?.content || alerts.join(" | ");
          const finalMsg = briefing.length > 1500 ? briefing.substring(0, 1497) + "..." : briefing;
          await sendSms(family.primary_phone, finalMsg);
          alertsSent++;

          // Log as conversation
          await sb.from("toroa_conversations").insert({
            family_id: family.id,
            direction: "outgoing",
            phone: family.primary_phone,
            message: "[Proactive morning briefing]",
            intent: "proactive",
            response: finalMsg,
            tokens_used: result.usage?.total_tokens || 0,
          });
        }
      }

      // Small delay between families to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    }

    return new Response(
      JSON.stringify({ status: "complete", families_checked: families.length, alerts_sent: alertsSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("toroa-think-ahead error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
