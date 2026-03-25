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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { submissionId } = await req.json();
    if (!submissionId) {
      return new Response(JSON.stringify({ error: "submissionId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the submission
    const { data: submission, error: fetchErr } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchErr || !submission) {
      return new Response(JSON.stringify({ error: "Submission not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Score lead using Lovable AI Gateway (Gemini)
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    let score = 50;
    let reasoning = "Default score - AI unavailable";
    let leadStatus = "warm";

    if (lovableApiKey) {
      const aiRes = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a lead qualification AI for Assembl, a New Zealand AI platform for business.
Score this contact form submission 1-100 based on:
- Message clarity and specificity (higher = more qualified)
- Company/business indicators (mentions of business name, team size, industry)
- Urgency signals (timeline mentions, "need", "asap", "looking to implement")
- Industry match (hospitality, trades, property, automotive, nonprofit = higher)
- Budget indicators (mentions of pricing, plans, enterprise)
- Decision-maker signals (CEO, founder, manager titles)

Respond ONLY with valid JSON: {"score": NUMBER, "reasoning": "brief explanation", "status": "hot|warm|cold"}
hot = score > 70, warm = 50-70, cold = < 50`,
            },
            {
              role: "user",
              content: `Name: ${submission.name}\nEmail: ${submission.email}\nMessage: ${submission.message}`,
            },
          ],
          temperature: 0.3,
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const content = aiData.choices?.[0]?.message?.content || "";
        try {
          const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          score = Math.min(100, Math.max(1, parsed.score || 50));
          reasoning = parsed.reasoning || "AI scored";
          leadStatus = parsed.status || (score > 70 ? "hot" : score > 50 ? "warm" : "cold");
        } catch {
          console.error("Failed to parse AI response:", content);
        }
      }
    }

    // Update submission with score
    await supabase.from("contact_submissions").update({
      lead_score: score,
      lead_status: leadStatus,
    }).eq("id", submissionId);

    // Log activity
    await supabase.from("lead_activity").insert({
      submission_id: submissionId,
      activity_type: "scored",
      details: reasoning,
      metadata: { score, status: leadStatus },
    });

    // Hot lead: send personalised follow-up
    if (score > 70) {
      const brevoKey = Deno.env.get("BREVO_API_KEY");
      if (brevoKey) {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": brevoKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: { name: "Kate from Assembl", email: "assembl@assembl.co.nz" },
            to: [{ email: submission.email, name: submission.name }],
            replyTo: { email: "assembl@assembl.co.nz", name: "Kate - Assembl" },
            subject: `Thanks for reaching out, ${submission.name.split(" ")[0]}`,
            htmlContent: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
<h2 style="color:#00E5A0">Kia ora ${submission.name.split(" ")[0]},</h2>
<p>Thanks for getting in touch with Assembl. Your message stood out and I wanted to personally follow up.</p>
<p>Based on what you've shared, I think our AI agents could make a real difference for your business. I'd love to have a quick chat about your needs.</p>
<p>Would you be available for a 15-minute call this week? Just reply to this email and we can lock in a time.</p>
<p>In the meantime, feel free to explore our agents at <a href="https://assemblnz.lovable.app" style="color:#00E5A0">assemblnz.lovable.app</a></p>
<p>Cheers,<br/>Kate<br/>Founder, Assembl</p>
</div>`,
          }),
        });

        await supabase.from("lead_activity").insert({
          submission_id: submissionId,
          activity_type: "follow_up_sent",
          details: "Hot lead - personalised follow-up email sent",
        });

        await supabase.from("contact_submissions").update({
          follow_up_sent: true,
        }).eq("id", submissionId);
      }
    }

    // Warm lead: log nurture action
    if (score > 50 && score <= 70) {
      await supabase.from("lead_activity").insert({
        submission_id: submissionId,
        activity_type: "nurture_queued",
        details: "Warm lead - added to nurture sequence",
      });
    }

    return new Response(JSON.stringify({ score, status: leadStatus, reasoning }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Qualify lead error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
