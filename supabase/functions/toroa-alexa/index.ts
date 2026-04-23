import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resolveModel } from "../_shared/model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* ══════════════════════════════════════════════════════════
   TŌRO ALEXA SKILL — Smart Home Bridge
   Handles Alexa Smart Home Skill API v3 directives
   and custom skill intents for family queries via voice.
   ══════════════════════════════════════════════════════════ */

interface AlexaDirective {
  directive?: {
    header?: { namespace: string; name: string; payloadVersion: string; messageId: string; correlationToken?: string };
    endpoint?: { endpointId: string; cookie?: Record<string, string>; scope?: { type: string; token: string } };
    payload?: any;
  };
  request?: { type: string; intent?: { name: string; slots?: Record<string, { value: string }> }; locale?: string };
  session?: { user?: { accessToken?: string }; sessionId?: string };
  version?: string;
}

function makeAlexaResponse(speech: string, shouldEnd = true) {
  return {
    version: "1.0",
    response: {
      outputSpeech: { type: "PlainText", text: speech },
      shouldEndSession: shouldEnd,
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  try {
    const body: AlexaDirective = await req.json();

    // ── Smart Home Skill API v3 (Discovery, Control) ──
    if (body.directive?.header) {
      const { namespace, name } = body.directive.header;

      // Discovery — tell Alexa what devices this family has
      if (namespace === "Alexa.Discovery" && name === "Discover") {
        return new Response(JSON.stringify({
          event: {
            header: { ...body.directive.header, name: "Discover.Response" },
            payload: {
              endpoints: [
                {
                  endpointId: "toroa-family-assistant",
                  manufacturerName: "Assembl",
                  friendlyName: "Tōro",
                  description: "Tōro Family AI Navigator",
                  displayCategories: ["OTHER"],
                  capabilities: [
                    { type: "AlexaInterface", interface: "Alexa", version: "3" },
                    { type: "AlexaInterface", interface: "Alexa.SceneController", version: "3", supportsDeactivation: false },
                  ],
                },
              ],
            },
          },
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Scene activation — trigger Tōro routines via Alexa
      if (namespace === "Alexa.SceneController" && name === "Activate") {
        const endpointId = body.directive.endpoint?.endpointId || "";
        const routine = endpointId.replace("toroa-routine-", "");

        // Look up family from Alexa access token
        const token = body.directive.endpoint?.scope?.token || "";
        const { data: link } = await sb
          .from("toroa_smart_home_links")
          .select("family_id")
          .eq("alexa_token", token)
          .single();

        if (link) {
          // Log the scene activation
          await sb.from("toroa_smart_home_events").insert({
            family_id: link.family_id,
            platform: "alexa",
            event_type: "scene_activate",
            device_id: endpointId,
            action: routine,
          });
        }

        return new Response(JSON.stringify({
          event: {
            header: {
              ...body.directive.header,
              name: "ActivationStarted",
              namespace: "Alexa.SceneController",
            },
            payload: { cause: { type: "VOICE_INTERACTION" }, timestamp: new Date().toISOString() },
          },
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ── Custom Skill Intents (voice queries through Tōro) ──
    if (body.request) {
      const { type } = body.request;

      if (type === "LaunchRequest") {
        return new Response(JSON.stringify(
          makeAlexaResponse("Kia ora! I'm Tōro, your family navigator. Ask me about your schedule, traffic to school, what's for dinner, or anything your whānau needs.", false)
        ), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (type === "IntentRequest" && body.request.intent) {
        const intentName = body.request.intent.name;
        const slots = body.request.intent.slots || {};

        // Map Alexa intents to Tōro queries
        let query = "";
        switch (intentName) {
          case "FamilyScheduleIntent":
            query = "What's on our calendar today?";
            break;
          case "TrafficIntent":
            query = `What's the traffic like to ${slots.destination?.value || "school"}?`;
            break;
          case "MealPlanIntent":
            query = `What should we have for ${slots.meal?.value || "dinner"} tonight?`;
            break;
          case "PackingIntent":
            query = `What does ${slots.child?.value || "the kids"} need to pack for ${slots.activity?.value || "school"}?`;
            break;
          case "SmartHomeIntent":
            query = `${slots.action?.value || "turn on"} the ${slots.device?.value || "lights"}`;
            break;
          case "AMAZON.HelpIntent":
            return new Response(JSON.stringify(
              makeAlexaResponse("I can help with your family schedule, traffic to school, meal planning, packing lists, and smart home controls. Just ask!")
            ), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          case "AMAZON.StopIntent":
          case "AMAZON.CancelIntent":
            return new Response(JSON.stringify(
              makeAlexaResponse("Ka kite anō! See you later, whānau.")
            ), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          default:
            query = Object.values(slots).map(s => s.value).filter(Boolean).join(" ") || "hello";
        }

        // Find family by Alexa session token
        const accessToken = body.session?.user?.accessToken || "";
        let familyId: string | null = null;
        if (accessToken) {
          const { data: link } = await sb
            .from("toroa_smart_home_links")
            .select("family_id")
            .eq("alexa_token", accessToken)
            .single();
          familyId = link?.family_id || null;
        }

        // Call AI with family context
        if (LOVABLE_API_KEY && familyId) {
          const [memResult, calResult] = await Promise.all([
            sb.from("toroa_family_memory").select("*").eq("family_id", familyId),
            sb.from("toroa_calendar").select("title, event_date, event_time")
              .eq("family_id", familyId)
              .gte("event_date", new Date().toISOString().split("T")[0])
              .order("event_date", { ascending: true }).limit(5),
          ]);

          const memorySnippet = (memResult.data || [])
            .map((m: any) => `${m.memory_key}: ${typeof m.memory_value === "object" ? JSON.stringify(m.memory_value) : m.memory_value}`)
            .join("; ");

          const calSnippet = (calResult.data || [])
            .map((e: any) => `${e.title} on ${e.event_date}${e.event_time ? " at " + e.event_time : ""}`)
            .join("; ");

          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: await resolveModel("toroa", sb),
              messages: [
                { role: "system", content: `You are Tōro on Alexa — a warm Kiwi family AI. Keep responses under 200 chars for voice. Use NZ English. Family context: ${memorySnippet}. Upcoming: ${calSnippet}.` },
                { role: "user", content: query },
              ],
              max_tokens: 150,
            }),
          });

          if (aiResp.ok) {
            const result = await aiResp.json();
            const speech = result.choices?.[0]?.message?.content || "Sorry, I couldn't catch that. Try again?";
            return new Response(JSON.stringify(makeAlexaResponse(speech)), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        // Fallback without family context
        return new Response(JSON.stringify(
          makeAlexaResponse("Kia ora! Link your Tōro account at assembl.co.nz/toroa/alexa to get personalised family updates.")
        ), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (type === "SessionEndedRequest") {
        return new Response(JSON.stringify({ version: "1.0", response: {} }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify(makeAlexaResponse("Sorry, I didn't understand that.")), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("toroa-alexa error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
