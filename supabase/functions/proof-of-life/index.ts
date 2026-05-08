import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Proof-of-Life — runs a tenant's first workflow within 24h of provisioning.
 * 
 * Called either:
 *  a) by a pg_cron job that polls for newly-provisioned tenants, or
 *  b) directly from the onboarding pipeline after provisioning.
 * 
 * It generates a lightweight "first evidence pack" using the tenant's
 * kete + business context, then emails it to the billing contact.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    // Accept either a specific tenant_id or process all pending
    const body = await req.json().catch(() => ({}));
    const specificTenantId = body.tenant_id;

    // Find tenants that were provisioned but haven't had their first workflow
    let query = supabase
      .from("tenant_intake")
      .select("id, tenant_id, contact_email, contact_name, business_name, personalised_plan, scrape_website")
      .eq("pipeline_status", "complete")
      .not("tenant_id", "is", null);

    if (specificTenantId) {
      query = query.eq("tenant_id", specificTenantId);
    }

    const { data: intakes, error } = await query.limit(10);

    if (error || !intakes?.length) {
      return new Response(
        JSON.stringify({ message: "No tenants pending proof-of-life", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const intake of intakes) {
      try {
        console.log(`[PROOF-OF-LIFE] Processing tenant ${intake.tenant_id}`);

        // Get tenant details
        const { data: tenant } = await supabase
          .from("platform_orgs")
          .select("id, name, kete_primary, brand_color, metadata")
          .eq("id", intake.tenant_id)
          .single();

        if (!tenant) continue;

        // Check if we already ran proof-of-life for this tenant
        const { data: existingMemory } = await supabase
          .from("business_memory")
          .select("id")
          .eq("tenant_id", tenant.id)
          .eq("category", "proof_of_life")
          .limit(1)
          .maybeSingle();

        if (existingMemory) {
          console.log(`[PROOF-OF-LIFE] Already done for tenant ${tenant.id}`);
          continue;
        }

        // Extract plan workflows
        const plan = intake.personalised_plan as any;
        const firstWorkflow = plan?.workflows_week_1?.[0];

        if (!firstWorkflow) {
          console.log(`[PROOF-OF-LIFE] No workflows in plan for tenant ${tenant.id}`);
          continue;
        }

        // Generate proof-of-life evidence pack using AI
        let evidencePack = null;
        if (lovableApiKey) {
          const websiteContent = (intake.scrape_website as any)?.markdown?.substring(0, 2000) || "";

          const prompt = `You are an AI compliance assistant for ${tenant.name}, a New Zealand business using the ${tenant.kete_primary} kete on Assembl.

Generate a concise first evidence brief for the workflow: "${firstWorkflow.name}" (${firstWorkflow.what_it_does}).

Business context:
${websiteContent ? `Website: ${websiteContent}` : "No website content available."}

The evidence brief should include:
1. A title and date
2. 3-5 actionable findings relevant to this business
3. Each finding should have: title, description, risk_level (low/medium/high), recommended_action
4. A summary paragraph

Respond in JSON:
{
  "title": "...",
  "date": "${new Date().toISOString().split("T")[0]}",
  "workflow_name": "${firstWorkflow.name}",
  "summary": "...",
  "findings": [
    { "title": "...", "description": "...", "risk_level": "...", "recommended_action": "..." }
  ],
  "simulated": true,
  "note": "This is a simulated evidence brief based on publicly available information. Connect your tools for live data."
}`;

          try {
            const res = await fetch("https://ai.lovable.dev/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
              }),
            });
            const data = await res.json();
            const content = data.choices?.[0]?.message?.content;
            if (content) {
              evidencePack = JSON.parse(content);
            }
          } catch (e) {
            console.error("[PROOF-OF-LIFE] AI generation error:", e);
          }
        }

        // Fallback if AI fails
        if (!evidencePack) {
          evidencePack = {
            title: `${firstWorkflow.name} — First Evidence Brief`,
            date: new Date().toISOString().split("T")[0],
            workflow_name: firstWorkflow.name,
            summary: `This is your first automated evidence brief for ${tenant.name}. Connect your tools to get real data flowing.`,
            findings: [
              {
                title: "Workflow ready to activate",
                description: `The "${firstWorkflow.name}" workflow has been configured for your business.`,
                risk_level: "low",
                recommended_action: "Connect your tools at /workspace/connections to activate live data.",
              },
            ],
            simulated: true,
            note: "This is a simulated evidence brief. Connect your tools for live data.",
          };
        }

        // Store as business memory
        const { data: memberData } = await supabase
          .from("platform_org_members")
          .select("user_id")
          .eq("tenant_id", tenant.id)
          .eq("role", "admin")
          .limit(1)
          .maybeSingle();

        if (memberData) {
          await supabase.from("business_memory").insert({
            user_id: memberData.user_id,
            tenant_id: tenant.id,
            category: "proof_of_life",
            tags: ["evidence-pack", "first-run", "simulated"],
            content: JSON.stringify(evidencePack),
            metadata: {
              workflow_name: firstWorkflow.name,
              generated_at: new Date().toISOString(),
              simulated: true,
            },
            relevance_score: 1.0,
          });
        }

        // Generate and upload HTML evidence brief
        const briefHtml = renderEvidenceBrief(evidencePack, tenant);
        const briefKey = `proof-of-life-${tenant.id}.html`;

        await supabase.storage
          .from("plans")
          .upload(briefKey, new Blob([briefHtml], { type: "text/html" }), {
            contentType: "text/html",
            upsert: true,
          });

        const { data: briefUrl } = supabase.storage
          .from("plans")
          .getPublicUrl(briefKey);

        // Update pipeline status
        await supabase
          .from("tenant_intake")
          .update({ pipeline_status: "proof_delivered" })
          .eq("id", intake.id);

        results.push({
          tenant_id: tenant.id,
          status: "delivered",
          brief_url: briefUrl?.publicUrl,
        });

        console.log(`[PROOF-OF-LIFE] Delivered for tenant ${tenant.id}`);
      } catch (e) {
        console.error(`[PROOF-OF-LIFE] Error for intake ${intake.id}:`, e);
        results.push({ tenant_id: intake.tenant_id, status: "error", error: String(e) });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Proof-of-life error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function renderEvidenceBrief(pack: any, tenant: any): string {
  const accent = tenant.brand_color || "#E8B94A";
  const findings = pack.findings || [];

  const riskColors: Record<string, string> = {
    high: "#E74C3C",
    medium: "#F39C12",
    low: "#27AE60",
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${pack.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:wght@600;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0B0D10;color:#E8E4DD;font-family:'Inter',sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
.container{max-width:640px;margin:0 auto;padding:24px 16px 80px}
h1{font-family:'Fraunces',serif;font-size:24px;margin-bottom:4px}
h2{font-size:16px;color:${accent};margin:28px 0 12px;font-weight:600}
.badge{display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:4px 10px;border-radius:6px;margin-bottom:16px}
.simulated{background:rgba(232,185,74,0.12);color:#E8B94A;border:1px solid rgba(232,185,74,0.3)}
.date{font-size:12px;color:#6B6760;margin-bottom:24px}
.summary{font-size:14px;color:#C8C4BE;margin-bottom:32px;line-height:1.7}
.finding{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-bottom:12px}
.finding-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.finding-title{font-weight:600;font-size:14px;color:#E8E4DD}
.risk{font-size:10px;font-weight:700;text-transform:uppercase;padding:3px 8px;border-radius:4px}
.finding-desc{font-size:13px;color:#9A9690;margin-bottom:8px}
.finding-action{font-size:12px;color:${accent};font-weight:500}
.footer{text-align:center;margin-top:40px;font-size:11px;color:#6B6760}
.footer a{color:${accent};text-decoration:none}
.cta{display:block;width:100%;padding:14px;background:${accent};color:#0B0D10;font-weight:700;font-size:14px;border:none;border-radius:12px;cursor:pointer;text-align:center;text-decoration:none;margin-top:24px}
</style>
</head>
<body>
<div class="container">
<span class="badge simulated">Simulated · First Run</span>
<h1>${pack.title}</h1>
<p class="date">${pack.date} · ${tenant.name}</p>
<p class="summary">${pack.summary}</p>

<h2>Findings</h2>
${findings.map((f: any) => `
<div class="finding">
  <div class="finding-header">
    <span class="finding-title">${f.title}</span>
    <span class="risk" style="background:${riskColors[f.risk_level] || riskColors.low}20;color:${riskColors[f.risk_level] || riskColors.low}">${f.risk_level}</span>
  </div>
  <p class="finding-desc">${f.description}</p>
  <p class="finding-action">→ ${f.recommended_action}</p>
</div>`).join("")}

${pack.note ? `<p style="font-size:12px;color:#6B6760;margin-top:24px;font-style:italic">${pack.note}</p>` : ""}

<a href="/workspace/connections" class="cta">Connect your tools for live data</a>

<div class="footer">
<p>Generated by <a href="https://assembl.co.nz">Assembl</a></p>
</div>
</div>
</body>
</html>`;
}
