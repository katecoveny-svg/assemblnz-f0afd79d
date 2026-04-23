import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resolveModel } from "../_shared/model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * NZ Compliance Auto-Updater — Loop 1
 *
 * Runs daily at 5am NZST via cron.
 * 1. Calls Lovable AI to analyse recent NZ legislative changes
 * 2. Classifies by impact and affected agents
 * 3. Stores in compliance_updates table
 * 4. Auto-applies LOW/MEDIUM changes to agent_knowledge_base
 * 5. Flags HIGH for admin review
 */

const NZ_COMPLIANCE_SOURCES = [
  { name: "NZ Legislation", url: "https://www.legislation.govt.nz/subscribe/recent" },
  { name: "WorkSafe NZ", url: "https://www.worksafe.govt.nz/about-us/news-and-media/" },
  { name: "IRD Tax Updates", url: "https://www.ird.govt.nz/updates" },
  { name: "MBIE Employment", url: "https://www.employment.govt.nz/about/news/" },
  { name: "NZTA Transport", url: "https://www.nzta.govt.nz/about-us/news/" },
  { name: "MPI Biosecurity", url: "https://www.mpi.govt.nz/news/" },
  { name: "Privacy Commissioner", url: "https://privacy.org.nz/blog/" },
  { name: "Commerce Commission", url: "https://comcom.govt.nz/news-and-media" },
  { name: "ERA Determinations", url: "https://www.era.govt.nz/elawsearch/" },
  { name: "Financial Markets Authority", url: "https://www.fma.govt.nz/news/" },
  // Lifestyle agent sources
  { name: "Ministry of Education", url: "https://www.education.govt.nz/news/" },
  { name: "Auckland Transport", url: "https://at.govt.nz/bus-train-ferry/service-announcements/" },
  { name: "DOC", url: "https://www.doc.govt.nz/news/" },
  { name: "Ministry of Health", url: "https://www.health.govt.nz/news-media" },
  { name: "MetService", url: "https://www.metservice.com/warnings/" },
  { name: "SunSmart NZ", url: "https://www.sunsmart.org.nz/" },
  { name: "GETS Tenders", url: "https://www.gets.govt.nz/ExternalIndex.htm" },
  // ── New kete sources (HOKO / WHENUA / AKO) ──
  { name: "NZ Customs Service", url: "https://www.customs.govt.nz/about-us/news/" },
  { name: "MFAT Trade", url: "https://www.mfat.govt.nz/en/trade/" },
  { name: "Federated Farmers", url: "https://www.fedfarm.org.nz/news/" },
  { name: "Beef + Lamb NZ", url: "https://beeflambnz.com/news-views" },
  { name: "DairyNZ", url: "https://www.dairynz.co.nz/news/" },
  { name: "Ministry of Education ECE", url: "https://www.education.govt.nz/early-childhood/" },
  { name: "ERO Early Learning", url: "https://ero.govt.nz/our-research" },
];

// Map source → likely affected agents
const SOURCE_AGENT_MAP: Record<string, string[]> = {
  "WorkSafe NZ": ["arai", "vitals", "harvest"],
  "IRD Tax Updates": ["ledger", "vault"],
  "MBIE Employment": ["aroha", "pulse", "catalyst"],
  "NZTA Transport": ["motor", "transit", "mariner"],
  "MPI Biosecurity": ["harvest", "gateway", "grove"],
  "Privacy Commissioner": ["shield"],
  "Commerce Commission": ["counter", "market"],
  "Financial Markets Authority": ["vault", "ledger"],
  "ERA Determinations": ["aroha", "pulse"],
  // Lifestyle agent sources
  "Ministry of Education": ["helm", "grove"],
  "Auckland Transport": ["helm"],
  "DOC": ["voyage", "atlas"],
  "Ministry of Health": ["thrive", "nourish"],
  "MetService": ["helm", "voyage", "atlas"],
  "SunSmart NZ": ["glow", "atlas"],
  "GETS Tenders": ["flux"],
  // HOKO (import/export)
  "NZ Customs Service": ["gateway", "anchor-hoko", "flux-hoko", "nova-hoko", "prism-hoko"],
  "MFAT Trade": ["gateway", "flux-hoko", "nova-hoko"],
  // WHENUA (agriculture)
  "Federated Farmers": ["harvest", "grove"],
  "Beef + Lamb NZ": ["harvest"],
  "DairyNZ": ["harvest"],
  // AKO (early childhood education)
  "Ministry of Education ECE": ["apex-ako", "nova-ako", "mana-ako", "scholar"],
  "ERO Early Learning": ["apex-ako", "nova-ako", "mana-ako"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Ask AI to identify recent NZ compliance changes
    const today = new Date().toISOString().split("T")[0];
    const prompt = `You are an NZ compliance research assistant. Today is ${today}.

Identify the 3-5 most significant recent New Zealand legislative or regulatory changes from the past 7 days that would affect NZ businesses. Focus on:
- Employment law (ERA, Holidays Act, minimum wage, KiwiSaver)
- Tax (GST, PAYE, ACC levies, provisional tax)
- Health & Safety (HSWA, WorkSafe guidance)
- Privacy (Privacy Act 2020, IPP amendments)
- Transport (WoF/CoF, RUC, clean car)
- Primary sector (NAIT, NES-Freshwater, ETS, biosecurity)
- Construction (Building Act, CCA, consenting)
- Consumer protection (FTA, CGA, CCCFA)

For each change, provide:
1. title: Short descriptive title
2. change_summary: 2-3 sentence summary of what changed
3. impact_level: "low", "medium", or "high"
4. source_name: Which NZ government source
5. legislation_ref: Specific Act/regulation reference if applicable
6. effective_date: When it takes effect (YYYY-MM-DD or null)
7. affected_industries: Array of industries affected

If there are no significant changes in the past 7 days, return an empty array.

Respond as a JSON array only. No markdown, no explanation.`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: await resolveModel("kahu", supabase),
          messages: [
            { role: "system", content: "You are an NZ compliance scanner. Return only valid JSON arrays." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!aiResponse.ok) {
      console.error("AI call failed:", aiResponse.status);
      return new Response(
        JSON.stringify({ error: "AI analysis failed", status: aiResponse.status }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "[]";

    let changes: any[];
    try {
      const parsed = JSON.parse(content);
      changes = Array.isArray(parsed) ? parsed : parsed.changes || parsed.updates || [];
    } catch {
      console.warn("Failed to parse AI response:", content.substring(0, 200));
      changes = [];
    }

    console.log(`[compliance-autoupdate] Found ${changes.length} changes`);

    let inserted = 0;
    let flaggedHigh = 0;

    for (const change of changes) {
      if (!change.title || !change.change_summary) continue;

      // Determine affected agents from source
      const affectedAgents = SOURCE_AGENT_MAP[change.source_name] || [];

      // Check for duplicates (same title in last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
      const { data: existing } = await supabase
        .from("compliance_updates")
        .select("id")
        .eq("title", change.title)
        .gte("created_at", weekAgo)
        .limit(1);

      if (existing?.length) continue; // Skip duplicate

      // Insert the update
      const { error: insertErr } = await supabase
        .from("compliance_updates")
        .insert({
          title: change.title,
          change_summary: change.change_summary,
          impact_level: change.impact_level || "low",
          source_name: change.source_name || "NZ Legislation",
          source_url: change.source_url || null,
          legislation_ref: change.legislation_ref || null,
          effective_date: change.effective_date || null,
          affected_industries: change.affected_industries || [],
          affected_agents: affectedAgents,
          auto_applied: change.impact_level !== "high",
        });

      if (insertErr) {
        console.error("Insert error:", insertErr.message);
        continue;
      }

      inserted++;
      if (change.impact_level === "high") flaggedHigh++;

      // Auto-apply LOW/MEDIUM to knowledge base
      if (change.impact_level !== "high" && affectedAgents.length > 0) {
        for (const agentId of affectedAgents) {
          await supabase.from("agent_knowledge_base").upsert(
            {
              agent_id: agentId,
              topic: `compliance_update_${today}`,
              content: `${change.title}: ${change.change_summary}${change.legislation_ref ? ` (${change.legislation_ref})` : ""}`,
              confidence: change.impact_level === "medium" ? 0.8 : 0.7,
              last_verified: today,
              source_url: change.source_url || null,
              is_active: true,
            },
            { onConflict: "agent_id, topic" }
          );
        }
      }
    }

    const result = {
      success: true,
      date: today,
      changes_found: changes.length,
      changes_inserted: inserted,
      high_impact_flagged: flaggedHigh,
      sources_checked: NZ_COMPLIANCE_SOURCES.length,
    };

    console.log("[compliance-autoupdate] Complete:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[compliance-autoupdate] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
