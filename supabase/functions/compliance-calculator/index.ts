// ============================================================
// ASSEMBL NZ COMPLIANCE CALCULATOR — Lead Magnet Edge Function
// Returns applicable NZ legislation for a business profile and
// optionally captures a lead when an email is supplied.
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface LawEntry {
  law: string;
  short: string;
  applies_to: string;
  key_obligations: string[];
  kete: string;
  urgency: "critical" | "high" | "medium" | "low";
  link?: string;
}

// NZ legislation database — which laws apply based on business characteristics
const NZ_COMPLIANCE_MAP: Record<string, LawEntry[]> = {
  universal: [
    {
      law: "Health and Safety at Work Act 2015",
      short: "H&S Act",
      applies_to: "All businesses with workers (including contractors and volunteers)",
      key_obligations: [
        "Identify and manage risks to health and safety",
        "Provide and maintain a safe work environment",
        "Ensure workers are trained and competent",
        "Report notifiable events to WorkSafe",
      ],
      kete: "WAIHANGA",
      urgency: "critical",
      link: "https://www.legislation.govt.nz/act/public/2015/0070/latest/DLM5976660.html",
    },
    {
      law: "Employment Relations Act 2000",
      short: "ERA",
      applies_to: "All employers",
      key_obligations: [
        "Written employment agreements for all employees",
        "Good faith obligations",
        "Minimum employment standards",
        "Fair process for disciplinary and dismissal",
      ],
      kete: "AROHA",
      urgency: "critical",
      link: "https://www.legislation.govt.nz/act/public/2000/0024/latest/DLM58317.html",
    },
    {
      law: "Privacy Act 2020",
      short: "Privacy Act",
      applies_to: "All businesses collecting personal information",
      key_obligations: [
        "13 Information Privacy Principles",
        "NEW IPP 3A (from 1 May 2026) — biometric information",
        "Notifiable privacy breach procedures",
        "Privacy impact assessments for new systems",
      ],
      kete: "SIGNAL",
      urgency: "critical",
      link: "https://www.legislation.govt.nz/act/public/2020/0031/latest/LMS23223.html",
    },
    {
      law: "Holidays Act 2003",
      short: "Holidays Act",
      applies_to: "All employers",
      key_obligations: [
        "4 weeks annual leave after 12 months",
        "10 days sick leave per year (from 2021)",
        "Public holiday entitlements",
        "Bereavement leave provisions",
      ],
      kete: "AROHA",
      urgency: "high",
    },
    {
      law: "Minimum Wage Act 1983",
      short: "Min Wage",
      applies_to: "All employers",
      key_obligations: [
        "Adult minimum wage: $23.50/hr (from 1 April 2026)",
        "Starting-out rate: $18.80/hr",
        "Training rate: $18.80/hr",
      ],
      kete: "AROHA",
      urgency: "high",
    },
    {
      law: "KiwiSaver Act 2006",
      short: "KiwiSaver",
      applies_to: "All employers with eligible employees",
      key_obligations: [
        "Auto-enrolment of new employees",
        "Employer contribution: minimum 3%",
        "ESCT deductions",
        "Opt-out process management",
      ],
      kete: "AROHA",
      urgency: "high",
    },
  ],

  hospitality: [
    {
      law: "Food Act 2014",
      short: "Food Act",
      applies_to: "Any business that sells or provides food",
      key_obligations: [
        "Food control plan (FCP) or national programme",
        "Registration with local council",
        "Hazard analysis and risk management",
        "Regular verification audits",
      ],
      kete: "MANAAKI",
      urgency: "critical",
    },
    {
      law: "Sale and Supply of Alcohol Act 2012",
      short: "Alcohol Act",
      applies_to: "Businesses selling or supplying alcohol",
      key_obligations: [
        "On-licence, off-licence, or club licence",
        "Certified duty managers",
        "Host responsibility practices",
        "Alcohol management plan",
      ],
      kete: "MANAAKI",
      urgency: "critical",
    },
  ],

  construction: [
    {
      law: "Building Act 2004",
      short: "Building Act",
      applies_to: "Any business doing building work",
      key_obligations: [
        "Building consent requirements",
        "Licensed Building Practitioner (LBP) obligations",
        "Code compliance certificates",
        "Restricted building work rules",
      ],
      kete: "WAIHANGA",
      urgency: "critical",
    },
    {
      law: "Construction Contracts Act 2002",
      short: "CCA",
      applies_to: "All construction contracts",
      key_obligations: [
        "Payment claim and schedule process",
        "Retention money compliance",
        "Adjudication rights",
        "Prohibited provisions",
      ],
      kete: "KAUPAPA",
      urgency: "critical",
    },
    {
      law: "Health & Safety at Work (Asbestos) Regulations 2016",
      short: "Asbestos Regs",
      applies_to: "PCBUs managing or removing asbestos",
      key_obligations: [
        "Asbestos management plan",
        "Licensed removal for friable asbestos",
        "Air monitoring requirements",
        "Worker health monitoring",
      ],
      kete: "ARAI",
      urgency: "critical",
    },
  ],

  freight: [
    {
      law: "Customs and Excise Act 2018",
      short: "Customs Act",
      applies_to: "Importers, exporters, customs brokers",
      key_obligations: [
        "Customs declarations and entry requirements",
        "Tariff classification",
        "Rules of origin documentation",
        "Prohibited and restricted goods compliance",
      ],
      kete: "PIKAU",
      urgency: "critical",
    },
    {
      law: "Land Transport Act 1998",
      short: "LTA",
      applies_to: "Transport operators and freight companies",
      key_obligations: [
        "Transport service licence (TSL)",
        "Driver logbook requirements",
        "Vehicle dimension and mass limits",
        "Chain of responsibility obligations",
      ],
      kete: "PIKAU",
      urgency: "critical",
    },
    {
      law: "Biosecurity Act 1993",
      short: "Biosecurity",
      applies_to: "Importers of goods, especially organic materials",
      key_obligations: [
        "Import health standards",
        "Phytosanitary certificates",
        "MPI clearance requirements",
        "Transitional facility obligations",
      ],
      kete: "PIKAU",
      urgency: "high",
    },
  ],

  automotive: [
    {
      law: "Land Transport Act 1998",
      short: "LTA",
      applies_to: "Vehicle dealers, fleet operators, mechanics",
      key_obligations: [
        "WoF and CoF inspection requirements",
        "Vehicle registration obligations",
        "Driver licensing standards",
        "Fleet safety management",
      ],
      kete: "ARATAKI",
      urgency: "critical",
    },
    {
      law: "Motor Vehicle Sales Act 2003",
      short: "MVS Act",
      applies_to: "Motor vehicle traders",
      key_obligations: [
        "Motor vehicle trader registration",
        "Consumer information notice requirements",
        "Buy-back and dispute resolution",
        "Trust account obligations",
      ],
      kete: "ARATAKI",
      urgency: "critical",
    },
  ],

  creative: [
    {
      law: "Copyright Act 1994",
      short: "Copyright",
      applies_to: "Creative professionals, agencies, content creators",
      key_obligations: [
        "Copyright ownership and assignment",
        "Moral rights obligations",
        "Fair dealing provisions",
        "AI-generated content considerations",
      ],
      kete: "AUAHA",
      urgency: "high",
    },
    {
      law: "Fair Trading Act 1986",
      short: "FTA",
      applies_to: "All businesses in trade (especially marketing/advertising)",
      key_obligations: [
        "No misleading or deceptive conduct",
        "Advertising Standards Authority codes",
        "Testimonial and endorsement rules",
        "AI disclosure requirements (emerging)",
      ],
      kete: "AUAHA",
      urgency: "high",
    },
  ],

  childcare: [
    {
      law: "Education and Training Act 2020",
      short: "Education Act",
      applies_to: "Early childhood education services",
      key_obligations: [
        "Licensing and certification requirements",
        "Teacher registration (Education Council)",
        "Curriculum delivery (Te Whāriki)",
        "Assessment and reporting",
      ],
      kete: "AKO",
      urgency: "critical",
    },
    {
      law: "Children's Act 2014",
      short: "Children's Act",
      applies_to: "All organisations working with children",
      key_obligations: [
        "Safety checking (police vetting) of workers",
        "Child protection policies",
        "Reporting obligations",
        "Safety checking renewals (every 3 years)",
      ],
      kete: "AKO",
      urgency: "critical",
    },
  ],
};

const INDUSTRY_MAP: Record<string, string[]> = {
  hospitality: ["hospitality"],
  "cafe-restaurant": ["hospitality"],
  "food-beverage": ["hospitality"],
  construction: ["construction"],
  building: ["construction"],
  "trades-services": ["construction"],
  freight: ["freight"],
  "logistics-transport": ["freight"],
  "import-export": ["freight"],
  automotive: ["automotive"],
  "fleet-management": ["automotive"],
  creative: ["creative"],
  "marketing-agency": ["creative"],
  "design-media": ["creative"],
  childcare: ["childcare"],
  "early-childhood": ["childcare"],
  retail: [],
  professional: [],
  technology: [],
};

const RequestSchema = z.object({
  industry: z.string().min(1).max(64),
  employee_count: z.number().int().min(0).max(100000),
  has_contractors: z.boolean().default(false),
  handles_food: z.boolean().default(false),
  sells_alcohol: z.boolean().default(false),
  works_with_children: z.boolean().default(false),
  email: z.string().trim().email().max(255).optional(),
  name: z.string().trim().max(120).optional(),
  company_name: z.string().trim().max(160).optional(),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = RequestSchema.safeParse(json);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = parsed.data;
    const {
      industry,
      employee_count,
      has_contractors,
      handles_food,
      sells_alcohol,
      works_with_children,
    } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Build compliance checklist
    const applicable_laws: LawEntry[] = [...NZ_COMPLIANCE_MAP.universal];

    const industry_keys = INDUSTRY_MAP[industry] ?? [];
    for (const key of industry_keys) {
      const set = NZ_COMPLIANCE_MAP[key];
      if (set) applicable_laws.push(...set);
    }

    // Cross-industry triggers
    if (handles_food && !industry_keys.includes("hospitality")) {
      applicable_laws.push(...NZ_COMPLIANCE_MAP.hospitality);
    }
    if (sells_alcohol && !industry_keys.includes("hospitality")) {
      const alcohol = NZ_COMPLIANCE_MAP.hospitality.find(
        (l) => l.short === "Alcohol Act",
      );
      if (alcohol && !applicable_laws.some((l) => l.short === "Alcohol Act")) {
        applicable_laws.push(alcohol);
      }
    }
    if (works_with_children && !industry_keys.includes("childcare")) {
      applicable_laws.push(...NZ_COMPLIANCE_MAP.childcare);
    }

    // Deduplicate by law name
    const seen = new Set<string>();
    const deduped = applicable_laws.filter((l) => {
      if (seen.has(l.law)) return false;
      seen.add(l.law);
      return true;
    });

    // Size-based notes
    const size_notes: string[] = [];
    if (employee_count >= 20) {
      size_notes.push(
        "With 20+ employees, consider a formal H&S committee and worker participation system.",
      );
    }
    if (employee_count >= 6) {
      size_notes.push(
        "With 6+ employees, you should have documented H&S policies and procedures.",
      );
    }
    if (has_contractors) {
      size_notes.push(
        "Contractor relationships require careful employment status assessment — misclassification is a common ERA issue.",
      );
    }

    const total_obligations = deduped.reduce(
      (sum, law) => sum + (law.key_obligations?.length ?? 0),
      0,
    );
    const critical_count = deduped.filter((l) => l.urgency === "critical").length;
    const recommended_kete = Array.from(
      new Set(deduped.map((l) => l.kete).filter(Boolean)),
    );

    const company_size =
      employee_count <= 1
        ? "solo"
        : employee_count <= 5
          ? "2-5"
          : employee_count <= 20
            ? "6-20"
            : employee_count <= 50
              ? "21-50"
              : "51+";

    const result = {
      industry,
      employee_count,
      company_size,
      total_laws: deduped.length,
      critical_laws: critical_count,
      total_obligations,
      applicable_laws: deduped,
      size_notes,
      recommended_kete,
      summary: `Your ${industry} business with ${employee_count} employees must comply with ${deduped.length} pieces of NZ legislation (${critical_count} critical). That's ${total_obligations} specific obligations to track.`,
      cta: recommended_kete.length
        ? `Assembl's ${recommended_kete.join(" + ")} kete can automate compliance tracking across all ${deduped.length} laws. Start with a free consultation.`
        : `Assembl can automate compliance tracking across all ${deduped.length} laws. Start with a free consultation.`,
    };

    let lead_captured = false;

    // Capture lead if email provided
    if (body.email) {
      const { error: leadError } = await supabase
        .from("assembl_leads")
        .upsert(
          {
            email: body.email,
            name: body.name ?? null,
            company_name: body.company_name ?? null,
            industry,
            company_size,
            source: "compliance_calculator",
            kete_interest: recommended_kete,
            quiz_answers: {
              industry,
              employee_count,
              has_contractors,
              handles_food,
              sells_alcohol,
              works_with_children,
            },
            utm_source: body.utm_source ?? null,
            utm_medium: body.utm_medium ?? null,
            utm_campaign: body.utm_campaign ?? null,
            last_engaged_at: new Date().toISOString(),
          },
          { onConflict: "email" },
        );

      if (leadError) {
        console.error("lead upsert failed", leadError);
      } else {
        lead_captured = true;

        // Score the lead (best-effort)
        const { data: leadRow } = await supabase
          .from("assembl_leads")
          .select("id")
          .eq("email", body.email)
          .maybeSingle();

        if (leadRow?.id) {
          await supabase.rpc("assembl_calculate_lead_score", {
            p_lead_id: leadRow.id,
          });
        }
      }
    }

    // Update lead-magnet stats (best-effort, never break the response)
    try {
      const { data: magnet } = await supabase
        .from("assembl_lead_magnets")
        .select("views, completions, leads_captured")
        .eq("slug", "compliance-calculator")
        .maybeSingle();

      if (magnet) {
        await supabase
          .from("assembl_lead_magnets")
          .update({
            views: (magnet.views ?? 0) + 1,
            completions: (magnet.completions ?? 0) + 1,
            leads_captured:
              (magnet.leads_captured ?? 0) + (lead_captured ? 1 : 0),
            updated_at: new Date().toISOString(),
          })
          .eq("slug", "compliance-calculator");
      }
    } catch (e) {
      console.error("magnet stats update failed", e);
    }

    return new Response(JSON.stringify({ ...result, lead_captured }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("compliance-calculator error", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
