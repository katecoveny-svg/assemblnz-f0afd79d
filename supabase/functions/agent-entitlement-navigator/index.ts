import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { embedText } from "../_shared/embed.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type CaseSnapshot = {
  currentBenefit: string;
  householdAdults: number;
  childrenInCare: number;
  declaredIncomeWeekly: number;
  accommodationStatus: "rent" | "mortgage" | "board" | "other";
  disclosedDisabilities: string[];
  lastAssessmentAt: string;
};

type EntitlementInput = {
  caseRef?: string;
  trigger?: string;
  agentPack?: string | null;
  caseSnapshot?: Partial<CaseSnapshot>;
};

const DEFAULT_CASE: CaseSnapshot = {
  currentBenefit: "Jobseeker Support",
  householdAdults: 1,
  childrenInCare: 1,
  declaredIncomeWeekly: 280,
  accommodationStatus: "rent",
  disclosedDisabilities: ["mobility support need"],
  lastAssessmentAt: "2026-02-10",
};

function normaliseSnapshot(input?: Partial<CaseSnapshot>): CaseSnapshot {
  return {
    ...DEFAULT_CASE,
    ...input,
    disclosedDisabilities: Array.isArray(input?.disclosedDisabilities)
      ? input.disclosedDisabilities
      : DEFAULT_CASE.disclosedDisabilities,
  };
}

function mapCitation(row: Record<string, unknown>) {
  return {
    documentId: String(row.document_id ?? ""),
    title: String(row.title ?? "Untitled legislation source"),
    sourceName: String(row.source_name ?? "PCO New Zealand Legislation API"),
    url: typeof row.url === "string" ? row.url : null,
    snippet: String(row.snippet ?? ""),
    publishedAt: typeof row.published_at === "string" ? row.published_at : null,
    similarity: Number(row.similarity ?? 0),
    authorityTier: row.authority_tier == null ? null : Number(row.authority_tier),
    weightedScore: Number(row.weighted_score ?? 0),
  };
}

function buildGroundingQuery(snapshot: CaseSnapshot) {
  return [
    "Entitlement Navigator · Manaakitanga",
    "MSD case-manager draft support. Human approval required.",
    "Statutory basis: Social Security Act 2018 entitlement assessment; Privacy Act 2020 IPP 3, 5, 8, 11.",
    `Current benefit: ${snapshot.currentBenefit}`,
    `Household adults: ${snapshot.householdAdults}`,
    `Children in care: ${snapshot.childrenInCare}`,
    `Declared income weekly: ${snapshot.declaredIncomeWeekly}`,
    `Accommodation status: ${snapshot.accommodationStatus}`,
    `Disclosed disabilities: ${snapshot.disclosedDisabilities.join(", ") || "none supplied"}`,
    `Last assessment: ${snapshot.lastAssessmentAt}`,
  ].join("\n");
}

function draftEntitlements(snapshot: CaseSnapshot, citations: ReturnType<typeof mapCitation>[]) {
  const drafts = [];
  if (snapshot.disclosedDisabilities.length > 0) {
    drafts.push({
      entitlement: "Disability Allowance eligibility review",
      reasoning:
        "The masked snapshot records a disclosed disability or support need. A case manager should check whether disability-related costs have been assessed and whether evidence is current.",
      citations: citations.slice(0, 3),
      draftLetter:
        "Draft only: Please review whether disability-related costs have been fully assessed for this case. Confirm evidence requirements and beneficiary consent before any contact.",
      confidence: 0.72,
      flags: [{ severity: 3, description: "Requires case-manager judgement and current supporting evidence." }],
    });
  }
  if (snapshot.accommodationStatus === "rent" || snapshot.accommodationStatus === "board") {
    drafts.push({
      entitlement: "Accommodation Supplement variation check",
      reasoning:
        "The masked snapshot shows rent or board costs and a prior assessment date. A case manager should check whether accommodation details have changed since the last assessment.",
      citations: citations.slice(0, 3),
      draftLetter:
        "Draft only: Please confirm current accommodation costs and whether an Accommodation Supplement reassessment is needed. Do not send without named case-manager approval.",
      confidence: 0.68,
      flags: [{ severity: 2, description: "Needs current accommodation evidence before progressing." }],
    });
  }
  return drafts;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: "Supabase service credentials are not configured" }, { status: 500, headers: corsHeaders });
    }
    if (!geminiKey) {
      return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500, headers: corsHeaders });
    }

    const body = (await req.json().catch(() => ({}))) as EntitlementInput;
    const snapshot = normaliseSnapshot(body.caseSnapshot);
    const groundingQuery = buildGroundingQuery(snapshot);
    const embedding = await embedText(groundingQuery, geminiKey);
    if (!embedding) {
      return Response.json({ error: "Could not embed entitlement snapshot" }, { status: 502, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.rpc("match_kb_knowledge", {
      query_embedding: embedding,
      agent_pack: body.agentPack ?? "toro",
      top_k: 5,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    const citations = (Array.isArray(data) ? data : []).map((row) => mapCitation(row as Record<string, unknown>));
    const drafts = draftEntitlements(snapshot, citations);

    return Response.json(
      {
        navigator: {
          slug: "entitlement-navigator",
          name: "Entitlement Navigator",
          subtitle: "Manaakitanga",
          agency: "msd",
          humanApprover: "msd_case_manager",
        },
        caseRef: body.caseRef ?? "MSD-SYNTHETIC-001",
        trigger: body.trigger ?? "manual-request",
        citations,
        drafts,
        summary:
          drafts.length > 0
            ? `${drafts.length} draft entitlement checks prepared for named case-manager review. No action has been sent or sealed.`
            : "No entitlement candidate surfaced from the masked synthetic snapshot.",
        status: "pending_approval",
        piiPosture: "Assumes Kahu masking has run before this function receives the snapshot.",
        generatedAt: new Date().toISOString(),
      },
      { headers: corsHeaders },
    );
  } catch (err) {
    console.error("[agent-entitlement-navigator]", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown entitlement navigator error" },
      { status: 500, headers: corsHeaders },
    );
  }
});
