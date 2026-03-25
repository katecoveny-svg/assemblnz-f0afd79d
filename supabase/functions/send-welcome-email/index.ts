import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Accept webhook payload from auth.users insert trigger or direct call
    const payload = await req.json();
    const record = payload?.record || payload;
    const userEmail = record?.email;
    const userName = record?.raw_user_meta_data?.full_name || record?.full_name || "";

    if (!userEmail) {
      return new Response(JSON.stringify({ error: "No email provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const brevoKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoKey) {
      console.error("BREVO_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Notify Kate at assembl@assembl.co.nz about the new signup
    const notifyRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": brevoKey },
      body: JSON.stringify({
        sender: { name: "Assembl Platform", email: "noreply@assembl.co.nz" },
        to: [{ email: "assembl@assembl.co.nz", name: "Assembl Team" }],
        subject: `New Assembl Signup: ${userName || userEmail}`,
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#10B981;">New User Signup</h2>
            <p><strong>Name:</strong> ${userName || "Not provided"}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}</p>
          </div>
        `,
      }),
    });

    if (!notifyRes.ok) {
      const err = await notifyRes.text();
      console.error("Failed to send admin notification:", err);
    }

    // 2) Send welcome email to the new user
    const welcomeRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": brevoKey },
      body: JSON.stringify({
        sender: { name: "Kate from Assembl", email: "noreply@assembl.co.nz" },
        replyTo: { email: "assembl@assembl.co.nz", name: "Assembl Team" },
        to: [{ email: userEmail, name: userName || userEmail }],
        subject: "Welcome to Assembl — let's get started",
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#0A0A14;color:#E0E0E0;border-radius:12px;">
            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="color:#00E5A0;font-size:28px;margin:0;">Welcome to Assembl</h1>
              <p style="color:#B388FF;font-size:14px;margin-top:4px;">Your AI-powered business toolkit for Aotearoa</p>
            </div>

            <p style="font-size:15px;line-height:1.6;">
              ${userName ? `Kia ora ${userName},` : "Kia ora,"}
            </p>
            <p style="font-size:15px;line-height:1.6;">
              Thanks for joining Assembl. You now have access to 30+ specialist AI agents built specifically for New Zealand businesses.
            </p>

            <div style="background:#111;border:1px solid #00E5A020;border-radius:8px;padding:20px;margin:20px 0;">
              <h3 style="color:#00E5FF;font-size:16px;margin-top:0;">Quick Start Guide</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#00E5A0;font-weight:bold;width:30px;">1.</td>
                  <td style="padding:8px 0;font-size:14px;"><strong style="color:#fff;">Choose your agent</strong> — Browse agents by industry on the Agents page</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#00E5A0;font-weight:bold;">2.</td>
                  <td style="padding:8px 0;font-size:14px;"><strong style="color:#fff;">Start chatting</strong> — Ask questions, generate documents, get NZ-specific advice</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#00E5A0;font-weight:bold;">3.</td>
                  <td style="padding:8px 0;font-size:14px;"><strong style="color:#fff;">Use templates</strong> — One-click templates for common tasks (contracts, plans, returns)</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#00E5A0;font-weight:bold;">4.</td>
                  <td style="padding:8px 0;font-size:14px;"><strong style="color:#fff;">Train your agents</strong> — Add your business context so outputs are tailored to you</td>
                </tr>
              </table>
            </div>

            <div style="background:#111;border:1px solid #B388FF20;border-radius:8px;padding:20px;margin:20px 0;">
              <h3 style="color:#B388FF;font-size:16px;margin-top:0;">Key Features</h3>
              <ul style="padding-left:16px;margin:0;font-size:14px;line-height:2;">
                <li>NZ legislation-aware (Employment, Tax, H&S, Privacy, Building)</li>
                <li>Document generation with PDF export</li>
                <li>Voice chat with NZ accent options</li>
                <li>Content Hub for social media, ads, and campaigns</li>
                <li>SPARK — build mini web apps with AI</li>
              </ul>
            </div>

            <p style="font-size:14px;line-height:1.6;">
              Need help? Just reply to this email or chat with ECHO, our hero agent, anytime.
            </p>

            <div style="text-align:center;margin-top:24px;">
              <a href="https://assemblnz.lovable.app/agents" style="display:inline-block;background:linear-gradient(135deg,#10B981,#00E5FF);color:#0A0A14;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
                Explore Your Agents
              </a>
            </div>

            <p style="font-size:13px;color:#666;text-align:center;margin-top:30px;">
              Assembl — AI agents built for Aotearoa<br/>
              assembl.co.nz | assembl@assembl.co.nz
            </p>
          </div>
        `,
      }),
    });

    if (!welcomeRes.ok) {
      const err = await welcomeRes.text();
      console.error("Failed to send welcome email:", err);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Welcome email error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
