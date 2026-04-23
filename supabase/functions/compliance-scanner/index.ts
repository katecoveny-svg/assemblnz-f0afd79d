import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resolveModel } from "../_shared/model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * NZ Compliance Scanner — Daily automated legislative change detector
 * 
 * Scans 20+ NZ government & industry sources, uses AI to identify
 * legislative changes, classifies by impact, and auto-updates agent
 * knowledge base. HIGH impact changes require admin approval.
 */

interface Source {
  name: string;
  url: string;
  type: string;
  agents: string[];
}

const SOURCES: Source[] = [
  // === Government Primary Sources ===
  { name: "NZ Legislation", url: "https://legislation.govt.nz/subscribe/recent", type: "legislation", agents: ["ALL"] },
  { name: "MBIE Employment", url: "https://www.mbie.govt.nz/business-and-employment/", type: "employment", agents: ["AROHA", "LEDGER"] },
  { name: "IRD Updates", url: "https://www.ird.govt.nz/about-us/publications", type: "tax", agents: ["LEDGER"] },
  { name: "WorkSafe NZ", url: "https://www.worksafe.govt.nz/about-us/news-and-media/", type: "health_safety", agents: ["ARAI", "APEX", "AURA"] },
  { name: "Tenancy Services", url: "https://www.tenancy.govt.nz/about-tenancy-services/news/", type: "property", agents: ["HAVEN"] },
  { name: "MPI Food Safety", url: "https://www.mpi.govt.nz/food-safety/food-safety-for-businesses/", type: "food_safety", agents: ["AURA"] },
  { name: "Waka Kotahi NZTA", url: "https://www.nzta.govt.nz/about-us/news/", type: "automotive", agents: ["FORGE"] },
  { name: "Privacy Commissioner", url: "https://privacy.org.nz/resources-and-learning/a-z-topics/", type: "privacy", agents: ["ALL"] },
  { name: "Commerce Commission", url: "https://comcom.govt.nz/news-and-media/", type: "commerce", agents: ["ANCHOR", "FLUX", "FORGE"] },
  { name: "Companies Office", url: "https://companies-register.companiesoffice.govt.nz/", type: "companies", agents: ["ANCHOR", "LEDGER", "KINDLE"] },
  { name: "RBNZ", url: "https://www.rbnz.govt.nz/about-us/news", type: "finance", agents: ["VAULT", "LEDGER"] },
  { name: "FMA", url: "https://www.fma.govt.nz/news/", type: "financial_markets", agents: ["VAULT", "SHIELD"] },
  { name: "Ministry of Education", url: "https://www.education.govt.nz/news/", type: "education", agents: ["GROVE", "TORO"] },
  { name: "Auckland Transport", url: "https://at.govt.nz/bus-train-ferry/service-announcements/", type: "transport", agents: ["TORO"] },
  { name: "DOC", url: "https://www.doc.govt.nz/news/", type: "conservation", agents: ["VOYAGE", "ATLAS", "AWA"] },
  { name: "MetService Warnings", url: "https://www.metservice.com/warnings/", type: "weather", agents: ["TORO", "VOYAGE", "APEX"] },
  // === Industry Bodies ===
  { name: "Hospitality NZ", url: "https://www.hospitality.org.nz/", type: "hospitality", agents: ["AURA"] },
  { name: "MTA", url: "https://www.mta.org.nz/news/", type: "automotive_industry", agents: ["FORGE"] },
  { name: "Federated Farmers", url: "https://fedfarm.org.nz/Web/", type: "agriculture", agents: ["TERRA"] },
  { name: "Master Builders", url: "https://www.masterbuilder.org.nz/News", type: "construction_industry", agents: ["APEX"] },
  // === NZ Open Data Sources ===
  { name: "NZ Legislation Search", url: "https://legislation.govt.nz/act/public/2020/0031/latest/LMS23223.html", type: "legislation_privacy", agents: ["ALL"] },
  { name: "Data.govt.nz", url: "https://data.govt.nz/toolkit/policies/", type: "open_data", agents: ["ALL"] },
  { name: "Stats NZ", url: "https://www.stats.govt.nz/news/", type: "statistics", agents: ["LEDGER", "ANCHOR", "TERRA"] },
  { name: "NZLII ERA Decisions", url: "https://www.nzlii.org/nz/cases/NZERA/", type: "case_law", agents: ["SHIELD", "ANCHOR", "HAVEN"] },
  { name: "ERA Decisions", url: "https://www.era.govt.nz/", type: "employment_law", agents: ["AROHA", "SHIELD"] },
  { name: "LINZ", url: "https://www.linz.govt.nz/news", type: "land_info", agents: ["HAVEN", "APEX", "TERRA"] },
];

const ALL_AGENTS = [
  "AROHA", "LEDGER", "APEX", "AURA", "HAVEN", "FORGE", "ANCHOR",
  "TERRA", "FLUX", "PRISM", "ECHO", "SHIELD", "VAULT", "TORO",
  "GROVE", "COMPASS", "VITAE",
];

async function scanSource(source: Source, apiKey: string, model: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(source.url, {
      headers: { "User-Agent": "Assembl-Compliance-Scanner/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { source: source.name, changes: [], error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    const truncatedHtml = html.substring(0, 15000);

    const analysis = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are an NZ legal compliance scanner. Analyse this web page content and identify ANY changes to NZ law, regulations, rates, or compliance requirements that occurred in the last 7 days.

For each change found, return JSON:
{
  "changes": [
    {
      "title": "Short descriptive title",
      "summary": "2-3 sentence plain English summary",
      "affected_legislation": "Act/Regulation name and section",
      "effective_date": "YYYY-MM-DD or null if unknown",
      "previous_value": "What it was before (if applicable)",
      "new_value": "What it is now",
      "impact_level": "high", "medium", or "low",
      "affected_industries": [],
      "requires_human_review": true or false,
      "source_url": "specific URL if available"
    }
  ]
}

HIGH = changes rates/thresholds/deadlines affecting agent calculations
MEDIUM = new guidance/codes of practice agents should know
LOW = minor amendments, administrative changes

If NO changes found in last 7 days, return: {"changes": []}

Be PRECISE about NZ legislation. Include section numbers and effective dates. Do not hallucinate changes — if unsure, set requires_human_review: true.`,
          },
          {
            role: "user",
            content: `Source: ${source.name}\nType: ${source.type}\n\nContent:\n${truncatedHtml}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!analysis.ok) {
      return { source: source.name, changes: [], error: `AI ${analysis.status}` };
    }

    const result = await analysis.json();
    const content = result.choices?.[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(content);
      return { source: source.name, changes: parsed.changes || [] };
    } catch {
      return { source: source.name, changes: [], error: "Failed to parse AI response" };
    }
  } catch (error) {
    return {
      source: source.name,
      changes: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const errors: string[] = [];
    let totalChanges = 0;
    let highImpact = 0;

    // Resolve KAHU's preferred model once per run — KAHU is the
    // compliance scanner agent. Falls back to DEFAULT_MODEL if the DB
    // lookup fails.
    const scannerModel = await resolveModel("kahu", supabase);

    // Scan sources in batches of 4 to avoid rate limits
    for (let i = 0; i < SOURCES.length; i += 4) {
      const batch = SOURCES.slice(i, i + 4);
      const results = await Promise.allSettled(
        batch.map((s) => scanSource(s, LOVABLE_API_KEY, scannerModel))
      );

      for (const result of results) {
        if (result.status === "rejected") {
          errors.push(result.reason?.message || "Unknown batch error");
          continue;
        }
        const { source, changes, error } = result.value;
        if (error) errors.push(`${source}: ${error}`);
        if (changes.length === 0) continue;

        totalChanges += changes.length;

        for (const change of changes) {
          // Skip duplicates
          const { data: existing } = await supabase
            .from("compliance_updates")
            .select("id")
            .eq("title", change.title)
            .gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString())
            .limit(1);

          if (existing?.length) continue;

          const impactLevel = (change.impact_level || "low").toLowerCase();
          if (impactLevel === "high") highImpact++;

          const affectedAgents = change.affected_agents?.includes("ALL")
            ? ALL_AGENTS
            : (change.affected_agents || SOURCES.find((s) => s.name === source)?.agents || []);

          // Insert compliance update
          await supabase.from("compliance_updates").insert({
            source_url: change.source_url || "",
            source_name: source,
            title: change.title,
            change_summary: change.summary,
            change_detail: {
              affected_legislation: change.affected_legislation,
              effective_date: change.effective_date,
              previous_value: change.previous_value,
              new_value: change.new_value,
            },
            impact_level: impactLevel,
            affected_agents: affectedAgents,
            affected_industries: change.affected_industries || [],
            effective_date: change.effective_date || null,
            requires_human_review: change.requires_human_review || impactLevel === "high",
            verified: impactLevel !== "high",
            auto_applied: impactLevel !== "high",
            legislation_ref: change.affected_legislation || null,
          });

          // HIGH → admin notification
          if (impactLevel === "high") {
            await supabase.from("admin_notifications").insert({
              type: "compliance_change",
              priority: "HIGH",
              title: `⚠️ HIGH IMPACT: ${change.title}`,
              body: `${change.summary}\n\nAffects: ${affectedAgents.join(", ")}\nEffective: ${change.effective_date || "TBD"}\nAction: Review and approve in Assembl admin.`,
              read: false,
            });
          }

          // Auto-apply LOW/MEDIUM to agent_knowledge_base
          if (impactLevel !== "high") {
            for (const agent of affectedAgents) {
              await supabase.from("agent_knowledge_base").upsert(
                {
                  agent_id: agent.toLowerCase(),
                  topic: change.affected_legislation || change.title,
                  content: `${change.summary}${change.new_value ? ` New value: ${change.new_value}` : ""}${change.effective_date ? ` (effective ${change.effective_date})` : ""}`,
                  last_verified: new Date().toISOString(),
                  source_url: change.source_url || null,
                  confidence: 0.95,
                  is_active: true,
                  is_stale: false,
                },
                { onConflict: "agent_id,topic" }
              );
            }
          }
        }
      }
    }

    // Log the scan
    const duration = Math.round((Date.now() - startTime) / 1000);
    await supabase.from("compliance_scan_log").insert({
      scan_date: new Date().toISOString().split("T")[0],
      sources_checked: SOURCES.length,
      changes_detected: totalChanges,
      high_impact_count: highImpact,
      scan_duration_seconds: duration,
      errors: errors.length > 0 ? errors : null,
    });

    const result = {
      status: "complete",
      sources_checked: SOURCES.length,
      changes_detected: totalChanges,
      high_impact: highImpact,
      duration_seconds: duration,
      errors,
    };

    console.log("[compliance-scanner] Complete:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[compliance-scanner] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
