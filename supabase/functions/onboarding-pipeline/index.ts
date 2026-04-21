import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { intake_id } = await req.json();
    if (!intake_id) {
      return new Response(
        JSON.stringify({ error: "intake_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch intake record
    const { data: intake, error: fetchErr } = await supabase
      .from("tenant_intake")
      .select("*")
      .eq("id", intake_id)
      .single();

    if (fetchErr || !intake) {
      return new Response(
        JSON.stringify({ error: "Intake not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── URL Normalization ────────────────────────────────────────
    // Defensive: strip stray protocol prefixes and re-add a clean one.
    let rawUrl = String(intake.website_url || "").trim();
    rawUrl = rawUrl.replace(/^(https?:\/\/)+/i, "").replace(/^\/+/, "");
    const normalizedUrl = rawUrl ? `https://${rawUrl}` : "";
    if (normalizedUrl !== intake.website_url) {
      intake.website_url = normalizedUrl;
      await supabase.from("tenant_intake").update({ website_url: normalizedUrl }).eq("id", intake_id);
    }

    // Update status to processing
    await supabase
      .from("tenant_intake")
      .update({ pipeline_status: "processing" })
      .eq("id", intake_id);

    // ─── STAGE 1: KAHU — Scrape + Enrich ─────────────────────────
    console.log(`[KAHU] Starting scrape for ${intake.website_url}`);

    let scrapeWebsite = null;
    let scrapeNzbn = null;

    // Firecrawl scrape (if API key available)
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (firecrawlKey) {
      try {
        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: intake.website_url,
            formats: ["markdown", "links", "branding"],
            onlyMainContent: true,
          }),
        });
        const scrapeData = await scrapeRes.json();
        if (scrapeData.success) {
          scrapeWebsite = {
            markdown: scrapeData.data?.markdown?.substring(0, 10000),
            links: (scrapeData.data?.links || []).slice(0, 50),
            metadata: scrapeData.data?.metadata || {},
            branding: scrapeData.data?.branding || null,
          };
        }
      } catch (e) {
        console.error("[KAHU] Firecrawl error:", e);
      }
    }

    // NZBN lookup
    const nzbnToken = Deno.env.get("NZBN_API_TOKEN");
    if (nzbnToken && intake.business_name) {
      try {
        const nzbnRes = await fetch(
          `https://api.business.govt.nz/services/v4/nz-business/entities?search-term=${encodeURIComponent(intake.business_name)}&entity-status=Registered`,
          { headers: { Authorization: `Bearer ${nzbnToken}` } }
        );
        const nzbnData = await nzbnRes.json();
        if (nzbnData?.items?.[0]) {
          const entity = nzbnData.items[0];
          scrapeNzbn = {
            nzbn: entity.nzbn,
            entity_type: entity.entityType,
            status: entity.entityStatusDescription,
          };
        }
      } catch (e) {
        console.error("[KAHU] NZBN error:", e);
      }
    }

    // Exception screening
    let exceptionPath = null;
    let exceptionReason = null;

    if (intake.team_size === "200+") {
      exceptionPath = "enterprise";
      exceptionReason = "Team size exceeds self-serve threshold";
    }

    // Store scrape results
    await supabase
      .from("tenant_intake")
      .update({
        scrape_website: scrapeWebsite,
        scrape_nzbn: scrapeNzbn,
        exception_path: exceptionPath,
        exception_reason: exceptionReason,
        pipeline_status: exceptionPath ? "exception" : "classifying",
      })
      .eq("id", intake_id);

    if (exceptionPath) {
      console.log(`[KAHU] Exception: ${exceptionPath} — ${exceptionReason}`);
      return new Response(
        JSON.stringify({ status: "exception", path: exceptionPath }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── STAGE 2: IHO — Classification ────────────────────────────
    console.log("[IHO] Classifying business…");

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    let classification = {
      kete_primary: intake.kete_requested !== "not-sure" ? intake.kete_requested : "ARATAKI",
      kete_secondary: null as string | null,
      confidence: 0.8,
      reasoning: "Default classification based on user selection.",
    };

    if (lovableApiKey && (intake.kete_requested === "not-sure" || scrapeWebsite)) {
      try {
        const classifyPrompt = `You are a business classifier for Assembl, a NZ business tools platform. Based on the following business info, determine which kete (product pack) fits best.

Kete options:
- MANAAKI: Hospitality, food service, accommodation, cafes, restaurants, bars, hotels
- WAIHANGA: Construction, building, trades, plumbing, electrical, roofing
- AUAHA: Creative, media, design, film, photography, advertising, marketing agencies
- ARATAKI: General business compliance, privacy, automotive, professional services
- PIKAU: Technology, software, SaaS, security, freight, customs, logistics

Business name: ${intake.business_name || "Unknown"}
Website URL: ${intake.website_url}
Team size: ${intake.team_size}
User-selected kete: ${intake.kete_requested}
Pain points: ${intake.pain_points?.join(", ")}
${scrapeWebsite?.markdown ? `Website content (truncated): ${scrapeWebsite.markdown.substring(0, 3000)}` : ""}
${scrapeNzbn ? `NZBN data: ${JSON.stringify(scrapeNzbn)}` : ""}

Respond in JSON only:
{
  "kete_primary": "KETE_NAME",
  "kete_secondary": "KETE_NAME or null",
  "confidence": 0.0-1.0,
  "reasoning": "One sentence plain English explanation"
}`;

        const classifyRes = await fetch("https://ai.lovable.dev/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: classifyPrompt }],
            response_format: { type: "json_object" },
          }),
        });
        const classifyData = await classifyRes.json();
        const content = classifyData.choices?.[0]?.message?.content;
        if (content) {
          classification = JSON.parse(content);
        }
      } catch (e) {
        console.error("[IHO] Classification error:", e);
      }
    }

    await supabase
      .from("tenant_intake")
      .update({ pipeline_status: "planning" })
      .eq("id", intake_id);

    // ─── STAGE 3: TĀ — Plan Assembly ─────────────────────────────
    console.log("[TĀ] Building personalised plan…");

    let plan = null;
    if (lovableApiKey) {
      try {
        const planPrompt = `You are a business plan writer for Assembl, a NZ AI platform. Write a personalised onboarding plan.

Business: ${intake.business_name || "this business"}
Website: ${intake.website_url}
Contact: ${intake.contact_name}
Team size: ${intake.team_size}
Kete: ${classification.kete_primary} (${classification.reasoning})
Pain points: ${intake.pain_points?.join(", ")}
Priority workflow: ${intake.priority_workflow || "none specified"}
${scrapeWebsite?.markdown ? `Website summary: ${scrapeWebsite.markdown.substring(0, 2000)}` : ""}

Write in plain English. No jargon. No buzzwords. Respond in JSON:
{
  "business_summary": "One sentence about this business.",
  "kete_recommendation": { "primary": "KETE", "why": "2 sentences" },
  "workflows_week_1": [{ "name": "...", "what_it_does": "...", "time_saved_per_week": "Xh" }],
  "plan_30_60_90": {
    "week_1": ["..."],
    "month_1": ["..."],
    "month_3": ["..."]
  },
  "evidence_pack_samples": [{ "title": "...", "description": "..." }],
  "price": { "monthly_nzd": 890, "setup_nzd": 0, "includes": ["..."] }
}`;

        const planRes = await fetch("https://ai.lovable.dev/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: planPrompt }],
            response_format: { type: "json_object" },
          }),
        });
        const planData = await planRes.json();
        const planContent = planData.choices?.[0]?.message?.content;
        if (planContent) {
          plan = JSON.parse(planContent);
        }
      } catch (e) {
        console.error("[TĀ] Plan generation error:", e);
      }
    }

    // Fallback: if AI gateway failed, build a deterministic plan so the
    // pipeline always completes with something useful for the user.
    if (!plan) {
      console.log("[TĀ] Using deterministic fallback plan");
      plan = buildFallbackPlan(intake, classification);
    }

    await supabase
      .from("tenant_intake")
      .update({ pipeline_status: "checking" })
      .eq("id", intake_id);

    // ─── STAGE 4: MAHARA — Compliance Check ───────────────────────
    console.log("[MAHARA] Running compliance checks…");
    // Stub — rule-based checks pass through

    // ─── STAGE 5: MANA — Render + Deliver ─────────────────────────
    console.log("[MANA] Rendering plan…");

    const planSlug = intake_id;
    const planHtml = renderPlanHtml(intake, classification, plan);

    // Upload to storage
    await supabase.storage
      .from("plans")
      .upload(`${planSlug}.html`, new Blob([planHtml], { type: "text/html" }), {
        contentType: "text/html",
        upsert: true,
      });

    const { data: urlData } = supabase.storage
      .from("plans")
      .getPublicUrl(`${planSlug}.html`);

    await supabase
      .from("tenant_intake")
      .update({
        personalised_plan: plan,
        plan_html_url: urlData?.publicUrl,
        pipeline_status: "provisioning",
      })
      .eq("id", intake_id);

    // ─── STAGE 6: PROVISION TENANT ────────────────────────────────
    console.log("[PROVISION] Creating tenant + user…");

    const businessName = intake.business_name || new URL(intake.website_url).hostname.replace("www.", "");
    const brandColor = scrapeWebsite?.branding?.colors?.primary || "#3A7D6E";
    const logoUrl = scrapeWebsite?.branding?.images?.logo || null;

    // 6a. Create tenant record
    const { data: tenant, error: tenantErr } = await supabase
      .from("tenants")
      .insert({
        name: businessName,
        plan: "trial",
        billing_email: intake.contact_email,
        website_url: intake.website_url,
        kete_primary: classification.kete_primary,
        brand_color: brandColor,
        logo_url: logoUrl,
        metadata: {
          scrape_summary: scrapeWebsite?.metadata || {},
          nzbn: scrapeNzbn || {},
          classification,
          pain_points: intake.pain_points,
          team_size: intake.team_size,
        },
      })
      .select("id")
      .single();

    if (tenantErr || !tenant) {
      console.error("[PROVISION] Tenant creation error:", tenantErr);
      await supabase.from("tenant_intake").update({ pipeline_status: "error" }).eq("id", intake_id);
      return new Response(
        JSON.stringify({ error: "Failed to create tenant" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6b. Create auth user + send magic link
    // First check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === intake.contact_email);

    let authUserId: string;

    if (existingUser) {
      authUserId = existingUser.id;
      console.log("[PROVISION] User already exists, skipping creation");
    } else {
      // Create user with a random password (they'll use magic link)
      const tempPassword = crypto.randomUUID() + "Aa1!";
      const { data: newUser, error: userErr } = await supabase.auth.admin.createUser({
        email: intake.contact_email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: intake.contact_name,
          tenant_id: tenant.id,
        },
      });

      if (userErr || !newUser.user) {
        console.error("[PROVISION] User creation error:", userErr);
        await supabase.from("tenant_intake").update({ pipeline_status: "error" }).eq("id", intake_id);
        return new Response(
          JSON.stringify({ error: "Failed to create user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      authUserId = newUser.user.id;
    }

    // 6c. Create tenant membership (admin role)
    await supabase.from("tenant_members").upsert({
      tenant_id: tenant.id,
      user_id: authUserId,
      role: "admin",
    }, { onConflict: "tenant_id,user_id" });

    // 6d. Set up agent access for the kete
    const keteAgents = getKeteAgents(classification.kete_primary);
    for (const agent of keteAgents) {
      await supabase.from("agent_access").upsert({
        tenant_id: tenant.id,
        agent_code: agent.code,
        pack_id: classification.kete_primary,
        is_enabled: true,
      }, { onConflict: "tenant_id,agent_code" });
    }

    // 6e. Seed business memory from scrape data
    const memoryEntries = [];

    if (scrapeWebsite?.markdown) {
      memoryEntries.push({
        user_id: authUserId,
        tenant_id: tenant.id,
        category: "business_context",
        tags: ["onboarding", "website", "auto-scraped"],
        content: `Website content for ${businessName}: ${scrapeWebsite.markdown.substring(0, 5000)}`,
        metadata: { source: "firecrawl", url: intake.website_url },
        relevance_score: 0.9,
      });
    }

    if (scrapeNzbn) {
      memoryEntries.push({
        user_id: authUserId,
        tenant_id: tenant.id,
        category: "business_context",
        tags: ["onboarding", "nzbn", "legal"],
        content: `NZBN record: ${JSON.stringify(scrapeNzbn)}`,
        metadata: { source: "nzbn" },
        relevance_score: 0.85,
      });
    }

    if (intake.pain_points?.length) {
      memoryEntries.push({
        user_id: authUserId,
        tenant_id: tenant.id,
        category: "preferences",
        tags: ["onboarding", "pain-points"],
        content: `Priority pain points: ${intake.pain_points.join(", ")}. Priority workflow: ${intake.priority_workflow || "none specified"}.`,
        metadata: { source: "intake_form" },
        relevance_score: 0.95,
      });
    }

    if (plan) {
      memoryEntries.push({
        user_id: authUserId,
        tenant_id: tenant.id,
        category: "plan",
        tags: ["onboarding", "30-60-90"],
        content: `Personalised plan: ${JSON.stringify(plan)}`,
        metadata: { source: "pipeline" },
        relevance_score: 0.9,
      });
    }

    if (memoryEntries.length > 0) {
      await supabase.from("business_memory").insert(memoryEntries);
    }

    // 6f. Send magic link
    const siteUrl = Deno.env.get("SITE_URL") || "https://assemblnz.lovable.app";
    const { error: magicLinkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: intake.contact_email,
      options: {
        redirectTo: `${siteUrl}/workspace`,
      },
    });

    const magicLinkSent = !magicLinkErr;
    if (magicLinkErr) {
      console.error("[PROVISION] Magic link error:", magicLinkErr);
    }

    // 6g. Link intake to tenant
    await supabase
      .from("tenant_intake")
      .update({
        tenant_id: tenant.id,
        auth_user_id: authUserId,
        magic_link_sent: magicLinkSent,
        provisioned_at: new Date().toISOString(),
        pipeline_status: "complete",
      })
      .eq("id", intake_id);

    console.log("[PROVISION] Pipeline complete! Tenant:", tenant.id);

    // ─── STAGE 7: PROOF OF LIFE — Trigger first workflow ──────────
    // Fire-and-forget: schedule proof-of-life to run async
    console.log("[PROOF-OF-LIFE] Triggering first evidence pack…");
    fetch(`${supabaseUrl}/functions/v1/proof-of-life`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ tenant_id: tenant.id }),
    }).catch((e) => console.error("[PROOF-OF-LIFE] Trigger error:", e));

    return new Response(
      JSON.stringify({
        status: "complete",
        plan_url: urlData?.publicUrl,
        tenant_id: tenant.id,
        magic_link_sent: magicLinkSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Pipeline error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── Agent mapping per kete ──────────────────────────────────
function getKeteAgents(kete: string): { code: string; name: string }[] {
  const base = [
    { code: "iho", name: "Iho" },
    { code: "kahu", name: "Kahu" },
    { code: "ta", name: "Tā" },
    { code: "mahara", name: "Mahara" },
    { code: "mana", name: "Mana" },
  ];

  const keteMap: Record<string, { code: string; name: string }[]> = {
    MANAAKI: [
      { code: "aura", name: "Aura" },
      { code: "aroha", name: "Aroha" },
      { code: "echo", name: "Echo" },
    ],
    WAIHANGA: [
      { code: "apex", name: "Apex" },
      { code: "forge", name: "Forge" },
      { code: "sentinel", name: "Sentinel" },
      { code: "kaupapa", name: "Kaupapa" },
    ],
    AUAHA: [
      { code: "prism", name: "Prism" },
      { code: "muse", name: "Muse" },
      { code: "pixel", name: "Pixel" },
      { code: "verse", name: "Verse" },
      { code: "spark", name: "Spark" },
    ],
    ARATAKI: [
      { code: "pilot", name: "Pilot" },
      { code: "echo", name: "Echo" },
      { code: "navigator", name: "Navigator" },
    ],
    PIKAU: [
      { code: "navigator", name: "Navigator" },
      { code: "pilot", name: "Pilot" },
      { code: "echo", name: "Echo" },
    ],
  };

  return [...base, ...(keteMap[kete] || [])];
}

// ─── Plan HTML renderer ──────────────────────────────────────
function renderPlanHtml(
  intake: Record<string, unknown>,
  classification: Record<string, unknown>,
  plan: Record<string, unknown> | null
): string {
  const name = intake.contact_name as string;
  const businessName = (intake.business_name as string) || "your business";
  const kete = classification.kete_primary as string;
  const reasoning = classification.reasoning as string;

  const workflows = (plan as any)?.workflows_week_1 || [];
  const timeline = (plan as any)?.plan_30_60_90 || {};
  const packs = (plan as any)?.evidence_pack_samples || [];
  const price = (plan as any)?.price || { monthly_nzd: 890, setup_nzd: 0, includes: [] };
  const summary = (plan as any)?.business_summary || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Your Assembl Plan – ${businessName}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:wght@600;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0B0D10;color:#E8E4DD;font-family:'Inter',sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
.container{max-width:640px;margin:0 auto;padding:24px 16px 80px}
h1,h2,h3{font-family:'Fraunces',serif;color:#E8E4DD}
h1{font-size:28px;margin-bottom:8px}
h2{font-size:20px;margin:40px 0 16px;color:#E8B94A}
.subtitle{color:#9A9690;font-size:14px;margin-bottom:32px}
.card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:12px}
.kete-badge{display:inline-block;background:rgba(232,185,74,0.12);border:1px solid rgba(232,185,74,0.3);border-radius:8px;padding:6px 14px;font-size:13px;font-weight:600;color:#E8B94A;margin-bottom:12px}
.workflow-name{font-weight:600;color:#E8E4DD;margin-bottom:4px}
.workflow-desc{font-size:13px;color:#9A9690}
.time-saved{font-size:12px;color:#E8B94A;margin-top:6px}
.timeline{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:8px}
.timeline-col h3{font-size:14px;color:#E8B94A;margin-bottom:8px}
.timeline-col li{font-size:13px;color:#9A9690;margin-bottom:6px;list-style:none;padding-left:12px;position:relative}
.timeline-col li::before{content:'·';position:absolute;left:0;color:#E8B94A}
.price-block{text-align:center;padding:32px 20px;background:rgba(232,185,74,0.06);border:1px solid rgba(232,185,74,0.2);border-radius:16px;margin:32px 0}
.price-amount{font-family:'Fraunces',serif;font-size:48px;color:#E8B94A;font-weight:700}
.price-period{font-size:14px;color:#9A9690}
.price-includes{font-size:13px;color:#9A9690;margin-top:12px}
.cta{display:block;width:100%;padding:16px;background:#E8B94A;color:#0B0D10;font-weight:700;font-size:16px;border:none;border-radius:12px;cursor:pointer;text-align:center;text-decoration:none;margin-top:24px}
.cta:hover{background:#D4A843}
.magic{display:block;width:100%;padding:14px;background:transparent;color:#E8B94A;font-weight:600;font-size:14px;border:1px solid rgba(232,185,74,0.3);border-radius:12px;text-align:center;text-decoration:none;margin-top:12px}
.magic:hover{background:rgba(232,185,74,0.08)}
.footer{text-align:center;margin-top:40px;font-size:12px;color:#6B6760}
.footer a{color:#E8B94A;text-decoration:none}
@media(max-width:480px){.timeline{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="container">
<h1>Kia ora ${name}.</h1>
<p class="subtitle">Here's your Assembl plan for ${businessName}.</p>

${summary ? `<p style="font-size:15px;color:#C8C4BE;margin-bottom:32px">${summary}</p>` : ""}

<h2>Your kete</h2>
<div class="card">
<span class="kete-badge">${kete}</span>
<p style="font-size:14px;color:#C8C4BE">${reasoning}</p>
</div>

<h2>Workflows to install week 1</h2>
${workflows.map((w: any) => `
<div class="card">
<div class="workflow-name">${w.name}</div>
<div class="workflow-desc">${w.what_it_does}</div>
<div class="time-saved">Saves ~${w.time_saved_per_week}/week</div>
</div>`).join("")}

<h2>Your 30 / 60 / 90 plan</h2>
<div class="timeline">
<div class="timeline-col">
<h3>Week 1</h3>
<ul>${(timeline.week_1 || []).map((i: string) => `<li>${i}</li>`).join("")}</ul>
</div>
<div class="timeline-col">
<h3>Month 1</h3>
<ul>${(timeline.month_1 || []).map((i: string) => `<li>${i}</li>`).join("")}</ul>
</div>
<div class="timeline-col">
<h3>Month 3</h3>
<ul>${(timeline.month_3 || []).map((i: string) => `<li>${i}</li>`).join("")}</ul>
</div>
</div>

<h2>Evidence pack previews</h2>
${packs.map((p: any) => `
<div class="card">
<div class="workflow-name">${p.title}</div>
<div class="workflow-desc">${p.description}</div>
</div>`).join("")}

<div class="price-block">
<div class="price-amount">$${price.monthly_nzd}</div>
<div class="price-period">/month + GST</div>
${price.setup_nzd > 0 ? `<div class="price-period">$${price.setup_nzd} setup</div>` : '<div class="price-period">No setup fee</div>'}
<div class="price-includes">${(price.includes || []).join(" · ")}</div>
</div>

<p style="text-align:center;font-size:13px;color:#9A9690;margin-bottom:8px">Check your email for a magic link to log in and start.</p>

<a href="mailto:kia-ora@assembl.co.nz?subject=Start my Assembl — ${businessName}" class="cta">
Talk to us
</a>

<div class="footer">
<p>Not right? <a href="mailto:kia-ora@assembl.co.nz">Talk to Kate by email</a></p>
<p style="margin-top:8px"><a href="https://assembl.co.nz/privacy">Privacy</a></p>
</div>
</div>
</body>
</html>`;
}
