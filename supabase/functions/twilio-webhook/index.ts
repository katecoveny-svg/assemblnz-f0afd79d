import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "assembl@assembl.co.nz";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = String(value);
      }
    } else {
      body = await req.json();
    }

    const callSid = body.CallSid || body.call_sid || "";
    const callerNumber = body.From || body.from || "Unknown";
    const callStatus = body.CallStatus || body.call_status || "";
    const action = body.action || "";

    // Handle lead qualification submission from ElevenLabs webhook
    if (action === "qualify_lead") {
      const leadData = {
        name: body.caller_name || "Unknown Caller",
        email: body.caller_email || `phone-lead-${Date.now()}@assembl.co.nz`,
        message: `Phone Lead via ECHO Voice Assistant\n\nCaller: ${body.caller_name || "Unknown"}\nCompany: ${body.caller_company || "Not provided"}\nPhone: ${callerNumber}\nNeed: ${body.caller_need || "Not specified"}\nBudget: ${body.caller_budget || "Not discussed"}\nTimeline: ${body.caller_timeline || "Not discussed"}\nBANT Score: ${body.bant_score || "N/A"}/100\nCall Summary: ${body.call_summary || "No summary available"}`,
        lead_score: parseInt(body.bant_score || "50"),
        lead_status: parseInt(body.bant_score || "50") >= 80 ? "qualified" : "new",
      };

      await sb.from("contact_submissions").insert(leadData);

      // Send notification email via Brevo
      const brevoKey = Deno.env.get("BREVO_API_KEY");
      if (brevoKey) {
        try {
          await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": brevoKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sender: { name: "Assembl ECHO", email: "noreply@assembl.co.nz" },
              to: [{ email: ADMIN_EMAIL }],
              subject: `🔥 New Phone Lead: ${body.caller_name || "Unknown"} (BANT: ${body.bant_score || "N/A"}/100)`,
              htmlContent: `
                <h2>New Phone Lead Captured by ECHO</h2>
                <table style="border-collapse:collapse;width:100%">
                  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${body.caller_name || "Unknown"}</td></tr>
                  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Company</td><td style="padding:8px;border:1px solid #ddd">${body.caller_company || "Not provided"}</td></tr>
                  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${callerNumber}</td></tr>
                  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Need</td><td style="padding:8px;border:1px solid #ddd">${body.caller_need || "Not specified"}</td></tr>
                  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Budget</td><td style="padding:8px;border:1px solid #ddd">${body.caller_budget || "Not discussed"}</td></tr>
                  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Timeline</td><td style="padding:8px;border:1px solid #ddd">${body.caller_timeline || "Not discussed"}</td></tr>
                  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">BANT Score</td><td style="padding:8px;border:1px solid #ddd;font-size:18px;font-weight:bold;color:${parseInt(body.bant_score || "50") >= 80 ? "#00FF88" : "#FFB800"}">${body.bant_score || "N/A"}/100</td></tr>
                  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Summary</td><td style="padding:8px;border:1px solid #ddd">${body.call_summary || "No summary"}</td></tr>
                </table>
                <p style="margin-top:16px;color:#666">Captured by ECHO Voice Assistant • assembl.co.nz</p>
              `,
            }),
          });
        } catch (emailErr) {
          console.error("Email notification error:", emailErr);
        }
      }

      return new Response(JSON.stringify({ success: true, lead_status: leadData.lead_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle incoming Twilio call — return TwiML to connect to ElevenLabs or provide greeting
    if (callStatus === "ringing" || !action) {
      // Generate ElevenLabs conversation token for the call
      let elevenLabsToken = null;
      if (ELEVENLABS_API_KEY) {
        try {
          // Use a dedicated ECHO voice agent ID if configured
          const echoVoiceAgentId = Deno.env.get("ELEVENLABS_ECHO_AGENT_ID");
          if (echoVoiceAgentId) {
            const tokenResp = await fetch(
              `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${echoVoiceAgentId}`,
              { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
            );
            if (tokenResp.ok) {
              const tokenData = await tokenResp.json();
              elevenLabsToken = tokenData.token;
            }
          }
        } catch (e) {
          console.error("ElevenLabs token error:", e);
        }
      }

      // Log the incoming call
      await sb.from("contact_submissions").insert({
        name: `Phone Call from ${callerNumber}`,
        email: `call-${callSid}@phone.assembl.co.nz`,
        message: `Incoming call from ${callerNumber}. Call SID: ${callSid}. Status: ${callStatus}`,
        lead_status: "new",
        lead_score: 30,
      });

      // Return TwiML response
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy" language="en-NZ">Kia ora, thanks for calling Assembl. I'm Echo, your business intelligence assistant. How can I help you today?</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="${supabaseUrl}/functions/v1/twilio-webhook?action=gather_response">
    <Say voice="Polly.Amy">Please tell me your name, your company, and what you're looking for, and I'll connect you with the right specialist.</Say>
  </Gather>
  <Say voice="Polly.Amy">I didn't catch that. Please call back or email us at assembl@assembl.co.nz. Goodbye.</Say>
</Response>`;

      return new Response(twiml, {
        headers: { ...corsHeaders, "Content-Type": "text/xml" },
      });
    }

    // Handle speech gathering result
    if (action === "gather_response") {
      const speechResult = body.SpeechResult || body.speech_result || "";

      // Use AI to extract lead qualification from speech
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY && speechResult) {
        try {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content: `Extract lead qualification data from this phone call transcript. Return JSON only:
{
  "caller_name": "string or null",
  "caller_company": "string or null",
  "caller_need": "string or null",
  "caller_budget": "string or null",
  "caller_timeline": "string or null",
  "bant_score": number 1-100,
  "call_summary": "one sentence summary"
}
Score BANT: Budget (25pts if mentioned), Authority (25pts if decision maker), Need (25pts if clear need), Timeline (25pts if urgent/defined).`,
                },
                { role: "user", content: speechResult },
              ],
              max_tokens: 500,
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const aiContent = aiData.choices?.[0]?.message?.content || "";
            let parsed: any = {};
            try {
              const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
            } catch {}

            // Save qualified lead
            await sb.from("contact_submissions").insert({
              name: parsed.caller_name || `Caller ${callerNumber}`,
              email: `phone-${Date.now()}@phone.assembl.co.nz`,
              message: `Phone Lead (ECHO Voice)\nPhone: ${callerNumber}\nCompany: ${parsed.caller_company || "Unknown"}\nNeed: ${parsed.caller_need || speechResult}\nBudget: ${parsed.caller_budget || "Not discussed"}\nTimeline: ${parsed.caller_timeline || "Not discussed"}\nBANT: ${parsed.bant_score || 30}/100\nSummary: ${parsed.call_summary || speechResult}`,
              lead_score: parsed.bant_score || 30,
              lead_status: (parsed.bant_score || 30) >= 80 ? "qualified" : "new",
            });

            // Send notification
            const brevoKey = Deno.env.get("BREVO_API_KEY");
            if (brevoKey) {
              await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: { "api-key": brevoKey, "Content-Type": "application/json" },
                body: JSON.stringify({
                  sender: { name: "Assembl ECHO", email: "noreply@assembl.co.nz" },
                  to: [{ email: ADMIN_EMAIL }],
                  subject: `📞 Phone Lead: ${parsed.caller_name || callerNumber} (BANT: ${parsed.bant_score || "N/A"}/100)`,
                  htmlContent: `<h2>Phone Lead from ${parsed.caller_name || callerNumber}</h2><p>Company: ${parsed.caller_company || "Unknown"}</p><p>Need: ${parsed.caller_need || speechResult}</p><p>BANT: ${parsed.bant_score || 30}/100</p><p>Summary: ${parsed.call_summary || speechResult}</p>`,
                }),
              });
            }
          }
        } catch (aiErr) {
          console.error("AI qualification error:", aiErr);
        }
      }

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy">Thank you. I've captured your details and our team will be in touch shortly. Is there anything else I can help with?</Say>
  <Gather input="speech" timeout="3" speechTimeout="auto" action="${supabaseUrl}/functions/v1/twilio-webhook?action=gather_response">
  </Gather>
  <Say voice="Polly.Amy">Thank you for calling Assembl. Have a great day. Goodbye.</Say>
  <Hangup/>
</Response>`;

      return new Response(twiml, {
        headers: { ...corsHeaders, "Content-Type": "text/xml" },
      });
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Twilio webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
