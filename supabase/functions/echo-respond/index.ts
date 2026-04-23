import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resolveModel } from "../_shared/model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Echo Respond — Single entry point for ALL website enquiries.
 *
 * Hooked from:
 *  - ContactPage.tsx   (discovery-call form)
 *  - KiaOraPopup.tsx   (homepage popup)
 *  - BrandFooter.tsx   (newsletter signup)
 *  - any inbound channel that posts to /functions/v1/echo-respond
 *
 * Flow:
 *  1. Persist the enquiry to contact_submissions (idempotent — caller may have already done so)
 *  2. Generate a personalised Echo reply using assembl-grounded system prompt
 *  3. Email the reply to the visitor via Brevo
 *  4. Notify ADMIN_EMAIL with the lead + Echo's draft reply
 *  5. Audit the interaction
 *
 * Body: { name, email, business_name?, industry?, interest?, message, source? }
 */

const ECHO_ASSEMBL_SYSTEM_PROMPT = `You are ECHO — Assembl's platform concierge. You speak with the voice of Assembl, grounded in Aotearoa New Zealand.

ABOUT ASSEMBL
Assembl is the operating system for NZ business: 46 specialist AI agents organised into industry kete (baskets of knowledge):
- MANAAKI (Hospitality) — food safety, liquor, bookings, FCP
- WAIHANGA (Construction) — H&S, consents, progress claims, CCA 2002
- AUAHA (Creative) — brand, content, campaigns, social
- ARATAKI (Automotive) — WoF, RUC, fleet, EV, finance
- PIKAU (Freight & Customs) — HS codes, MPI, biosecurity, logistics
- TŌRO (Agriculture/Primary) — dairy, NAIT, FEP, livestock
- WHENUA (Property) — Healthy Homes, RTA, tenancy
- PAKIHI (Professional Services) — tax, AML, legal, billing
- TŌRO (Family) — household admin
Plus shared agents: AROHA (HR), Privacy, Te Reo Specialist, SHIELD (security).

Pricing (NZD, GST excl):
- Family/Tōro: $29/mo (waitlist)
- Operator: $290/mo
- Enterprise: $2,890/mo
- Outcome: bespoke

Compliance: All agents enforce NZ Privacy Act 2020, MBIE Responsible AI Guidance (Jul 2025), NZ Algorithm Charter. Draft-only — no autonomous actions.

VOICE
- Warm, direct, honest. Like a trusted Kiwi advisor — not corporate, not breathless tech-hype.
- Use NZ English (organise, recognised, programme, colour).
- Acknowledge by name. Reference their business and industry.
- Suggest the most relevant kete + 1-2 specific agents for their pain point.
- Always invite them to book a discovery call OR text the TNZ number.
- Sign off: "Ngā mihi, ECHO — your Assembl concierge"

EMAIL RULES
- Subject-worthy first line.
- 3-5 short paragraphs max.
- Plain text, no markdown.
- One clear next step.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "kia.ora@assembl.co.nz";

    const body = await req.json();
    const {
      name = "there",
      email,
      business_name = "",
      industry = "",
      interest = "",
      message = "",
      source = "website",
    } = body;

    if (!email || !message) {
      return new Response(
        JSON.stringify({ error: "email and message required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1. Persist to contact_submissions (best-effort; caller may have already done it)
    try {
      await sb.from("contact_submissions").insert({
        name,
        email,
        message: `[${source}] [${industry}] [${interest}] ${business_name ? business_name + " — " : ""}${message}`,
      });
    } catch (e) {
      console.log("[echo-respond] contact_submissions insert skipped:", e);
    }

    // 2. Generate Echo reply
    let echoReply = `Kia ora ${name},\n\nThanks for reaching out — your enquiry's landed and I'll be in touch shortly.\n\nIn the meantime, have a look around assembl.co.nz or text us on +64 21 538 962.\n\nNgā mihi,\nECHO — your Assembl concierge`;

    if (LOVABLE_API_KEY) {
      try {
        const userPrompt = `New website enquiry:
- Name: ${name}
- Business: ${business_name || "(not provided)"}
- Email: ${email}
- Industry: ${industry || "(not specified)"}
- Interest: ${interest || "(not specified)"}
- Source: ${source}
- Message: ${message}

Write a warm, personalised email reply (plain text). Acknowledge their business by name. Suggest the most relevant Assembl kete + 1-2 specific agents. Invite them to either book a discovery call (assembl.co.nz/contact) or text +64 21 538 962. Sign off with "Ngā mihi, ECHO — your Assembl concierge".`;

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: ECHO_ASSEMBL_SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 800,
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          const draft = aiData.choices?.[0]?.message?.content?.trim();
          if (draft) echoReply = draft;
        } else {
          console.error("[echo-respond] AI gateway error:", aiResp.status, await aiResp.text());
        }
      } catch (aiErr) {
        console.error("[echo-respond] AI error:", aiErr);
      }
    }

    // 3. Email reply to visitor via Brevo
    let visitorSent = false;
    if (BREVO_API_KEY) {
      try {
        const visitorResp = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": BREVO_API_KEY,
          },
          body: JSON.stringify({
            sender: { name: "ECHO — Assembl", email: "kia.ora@assembl.co.nz" },
            to: [{ email, name }],
            subject: `Kia ora ${name} — your Assembl enquiry`,
            textContent: echoReply,
            replyTo: { email: ADMIN_EMAIL, name: "Assembl" },
          }),
        });
        visitorSent = visitorResp.ok;
        if (!visitorResp.ok) console.error("[echo-respond] Brevo visitor send failed:", await visitorResp.text());
      } catch (e) {
        console.error("[echo-respond] Brevo visitor error:", e);
      }

      // 4. Internal notification to admin with the lead + Echo's draft
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": BREVO_API_KEY,
          },
          body: JSON.stringify({
            sender: { name: "Assembl ECHO", email: "noreply@assembl.co.nz" },
            to: [{ email: ADMIN_EMAIL }],
            subject: `🌿 New ${source} lead: ${name}${business_name ? ` (${business_name})` : ""}`,
            textContent: `New enquiry:

Name: ${name}
Email: ${email}
Business: ${business_name || "—"}
Industry: ${industry || "—"}
Interest: ${interest || "—"}
Source: ${source}

Their message:
${message}

──────────────
ECHO sent this auto-reply:
──────────────
${echoReply}`,
          }),
        });
      } catch (e) {
        console.error("[echo-respond] Brevo admin error:", e);
      }
    } else {
      console.warn("[echo-respond] BREVO_API_KEY not set — skipping email send");
    }

    // 5. Audit
    try {
      await sb.from("audit_log").insert({
        agent_code: "echo",
        agent_name: "ECHO",
        model_used: "google/gemini-2.5-flash",
        user_id: "00000000-0000-0000-0000-000000000000",
        request_summary: `[WEBSITE ENQUIRY ${source}] ${name} <${email}> (${industry || "?"}/${interest || "?"})`,
        response_summary: echoReply.substring(0, 300),
        compliance_passed: true,
        data_classification: "INTERNAL",
      });
    } catch (e) {
      console.error("[echo-respond] audit error:", e);
    }

    return new Response(
      JSON.stringify({ ok: true, replied: visitorSent, draft: echoReply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[echo-respond] error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
