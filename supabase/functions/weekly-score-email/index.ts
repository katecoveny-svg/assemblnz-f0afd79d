import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const brevoKey = Deno.env.get("BREVO_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all users with profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name");

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let sentCount = 0;

    for (const profile of profiles) {
      // Get user email from auth
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
      if (!user?.email) continue;

      // Calculate score components
      const { count: complianceCount } = await supabase
        .from("user_compliance_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("status", "completed");

      const { count: totalCompliance } = await supabase
        .from("user_compliance_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);

      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);

      const { count: conversationsCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);

      const { count: outputsCount } = await supabase
        .from("exported_outputs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);

      // Calculate scores
      const complianceScore = totalCompliance && totalCompliance > 0
        ? Math.min(100, Math.round(((complianceCount || 0) / totalCompliance) * 100))
        : 50;
      const financialScore = Math.min(100, 40 + (outputsCount || 0) * 5);
      const teamScore = Math.min(100, 30 + (conversationsCount || 0) * 3);
      const marketingScore = Math.min(100, 25 + (outputsCount || 0) * 4);
      const operationsScore = Math.min(100, 35 + (conversationsCount || 0) * 2);
      const growthScore = Math.min(100, 20 + (leadsCount || 0) * 5);

      const overallScore = Math.round(
        complianceScore * 0.20 +
        financialScore * 0.20 +
        teamScore * 0.15 +
        marketingScore * 0.15 +
        operationsScore * 0.15 +
        growthScore * 0.15
      );

      const scoreColor = overallScore >= 71 ? "#00E5A0" : overallScore >= 41 ? "#F59E0B" : "#EF4444";
      const scoreLabel = overallScore >= 71 ? "Strong" : overallScore >= 41 ? "Growing" : "Needs Attention";

      // Top 3 improvement actions
      const categories = [
        { name: "Compliance", score: complianceScore, action: "Complete outstanding compliance tasks", agent: "ANCHOR" },
        { name: "Financial Health", score: financialScore, action: "Generate invoices and financial reports", agent: "LEDGER" },
        { name: "Team", score: teamScore, action: "Set up employee retention programmes", agent: "AROHA" },
        { name: "Marketing", score: marketingScore, action: "Create social media content and campaigns", agent: "PRISM" },
        { name: "Operations", score: operationsScore, action: "Streamline workflows with automation", agent: "AXIS" },
        { name: "Growth", score: growthScore, action: "Qualify and nurture more leads", agent: "FLUX" },
      ];

      const topActions = categories
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);

      const actionsHtml = topActions
        .map(a => `<tr><td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#94a3b8;font-size:13px;">${a.name}</td><td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;color:#e2e8f0;font-size:13px;">${a.action}</td><td style="padding:8px 12px;border-bottom:1px solid #1a1a2e;"><span style="background:linear-gradient(135deg,#00E5A0,#00D4AA);color:#0a0a1a;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;">Open ${a.agent}</span></td></tr>`)
        .join("");

      const categoryBars = categories
        .sort((a, b) => b.score - a.score)
        .map(c => {
          const barColor = c.score >= 71 ? "#00E5A0" : c.score >= 41 ? "#F59E0B" : "#EF4444";
          return `<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;margin-bottom:2px;"><span style="color:#94a3b8;font-size:12px;">${c.name}</span><span style="color:#e2e8f0;font-size:12px;font-weight:600;">${c.score}/100</span></div><div style="background:#1a1a2e;border-radius:4px;height:6px;overflow:hidden;"><div style="background:${barColor};height:100%;width:${c.score}%;border-radius:4px;"></div></div></div>`;
        })
        .join("");

      const userName = profile.full_name || "there";

      const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">

<!-- Header -->
<tr><td style="padding:24px 32px;border-bottom:1px solid rgba(0,229,160,0.15);">
<img src="https://assemblnz.lovable.app/lovable-uploads/assembl-logo.png" alt="Assembl" height="28" style="height:28px;" />
<span style="float:right;color:#64748b;font-size:12px;line-height:28px;">Weekly Business Score</span>
</td></tr>

<!-- Score Circle -->
<tr><td style="padding:40px 32px;text-align:center;">
<p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Kia ora ${userName}, here's your weekly score</p>
<div style="width:140px;height:140px;border-radius:50%;border:4px solid ${scoreColor};margin:0 auto 16px;display:flex;align-items:center;justify-content:center;background:rgba(0,229,160,0.05);">
<span style="font-size:48px;font-weight:800;color:${scoreColor};line-height:140px;">${overallScore}</span>
</div>
<span style="display:inline-block;background:${scoreColor}22;color:${scoreColor};padding:4px 16px;border-radius:20px;font-size:13px;font-weight:600;">${scoreLabel}</span>
</td></tr>

<!-- Category Breakdown -->
<tr><td style="padding:0 32px 32px;">
<h3 style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.5px;">Category Breakdown</h3>
${categoryBars}
</td></tr>

<!-- Top Actions -->
<tr><td style="padding:0 32px 32px;">
<h3 style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Top 3 Actions to Improve</h3>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f23;border-radius:8px;overflow:hidden;">
<tr><th style="padding:8px 12px;text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;border-bottom:1px solid #1a1a2e;">Area</th><th style="padding:8px 12px;text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;border-bottom:1px solid #1a1a2e;">Action</th><th style="padding:8px 12px;border-bottom:1px solid #1a1a2e;"></th></tr>
${actionsHtml}
</table>
</td></tr>

<!-- CTA -->
<tr><td style="padding:0 32px 40px;text-align:center;">
<a href="https://assemblnz.lovable.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,#00E5A0,#00D4AA);color:#0a0a1a;padding:12px 32px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">View Full Dashboard</a>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 32px;border-top:1px solid rgba(0,229,160,0.1);text-align:center;">
<p style="color:#475569;font-size:11px;margin:0;">Powered by Assembl — Your AI Business Intelligence Platform</p>
<p style="color:#334155;font-size:10px;margin:8px 0 0;">You're receiving this because you have an Assembl account.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

      // Send via Brevo
      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Assembl", email: "noreply@assembl.co.nz" },
          to: [{ email: user.email, name: userName }],
          subject: `Your Assembl Business Score: ${overallScore}/100 — ${scoreLabel}`,
          htmlContent: emailHtml,
        }),
      });

      if (brevoRes.ok) sentCount++;
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Weekly score email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
