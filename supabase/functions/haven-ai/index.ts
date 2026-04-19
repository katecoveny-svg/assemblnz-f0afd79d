import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Knowledge Brain grounding helper (Gemini 768-dim → match_kb_knowledge) ───
const GEMINI_EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";
async function gatherLiveGrounding(question: string, agentPack: string, sb: ReturnType<typeof createClient>): Promise<string> {
  try {
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey || !question) return "";
    const r = await fetch(`${GEMINI_EMBED_URL}?key=${geminiKey}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text: question.slice(0, 8000) }] }, outputDimensionality: 768 }),
    });
    if (!r.ok) return "";
    const j = await r.json();
    const vec = j?.embedding?.values;
    if (!Array.isArray(vec)) return "";
    const { data } = await sb.rpc("match_kb_knowledge", { query_embedding: vec, agent_pack: agentPack, top_k: 5 });
    if (!data?.length) return "";
    return "\n\n=== LIVE KNOWLEDGE BRAIN (verified NZ sources) ===\n" +
      (data as Array<Record<string, unknown>>).map((s, i) => {
        const date = s.published_at ? new Date(s.published_at as string).toISOString().slice(0,10) : "n/d";
        return `[${i+1}] ${s.title} — ${s.source_name} (${date})\n${s.snippet}\n${s.url ? `→ ${s.url}` : ""}`;
      }).join("\n---\n") + "\n=== END KNOWLEDGE BRAIN ===\n";
  } catch (e) { console.warn("[haven-ai] grounding failed:", (e as Error).message); return ""; }
}

const HAVEN_SYSTEM_PROMPT = `You are HAVEN, an NZ property management AI assistant by Assembl. You help property managers, landlords, and investors manage their rental portfolios. You can create properties, log maintenance jobs, schedule inspections, track compliance, find and match tradies, and answer questions about NZ tenancy law (Residential Tenancies Act 1986, Healthy Homes Guarantee Act 2017, Building Act 2004). You always reference specific NZ legislation when relevant. When a user describes a maintenance issue, automatically suggest the right trade category and offer to find matching tradies. When a user adds a property, automatically suggest setting up Healthy Homes compliance items. Be proactive, efficient, and NZ-focused. Use NZ English.

You have the following tools available. When the user's request clearly maps to one of these, call the tool. Otherwise answer conversationally.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "create_property",
      description: "Create a new rental property in the portfolio",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "Street address" },
          suburb: { type: "string", description: "Suburb name" },
          region: { type: "string", description: "NZ region e.g. Auckland, Wellington" },
          tenant_name: { type: "string", description: "Current tenant name if known" },
          tenant_phone: { type: "string" },
          tenant_email: { type: "string" },
          notes: { type: "string" },
        },
        required: ["address", "suburb"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_maintenance_job",
      description: "Log a new maintenance/repair job for a property",
      parameters: {
        type: "object",
        properties: {
          property_address: { type: "string", description: "Address or partial address to match" },
          title: { type: "string", description: "Short job title" },
          description: { type: "string", description: "Full description of the issue" },
          urgency: { type: "string", enum: ["low", "medium", "high", "emergency"] },
          category: { type: "string", description: "Trade category e.g. plumbing, electrical" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "schedule_inspection",
      description: "Schedule a property inspection",
      parameters: {
        type: "object",
        properties: {
          property_address: { type: "string" },
          date: { type: "string", description: "Inspection date YYYY-MM-DD" },
          notes: { type: "string" },
        },
        required: ["property_address", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_compliance_item",
      description: "Add a compliance check item (e.g. smoke alarm, insulation) to a property",
      parameters: {
        type: "object",
        properties: {
          property_address: { type: "string" },
          title: { type: "string", description: "Compliance item title" },
          category: { type: "string", description: "Category: Safety, Insulation, Healthy Homes, Inspection" },
          due_date: { type: "string", description: "Due date YYYY-MM-DD" },
        },
        required: ["property_address", "title", "category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_tradie",
      description: "Search and match tradies for a job based on trade type and description",
      parameters: {
        type: "object",
        properties: {
          trade: { type: "string", description: "Trade type e.g. plumber, electrician" },
          description: { type: "string", description: "Job description for matching" },
        },
        required: ["trade"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_briefing",
      description: "Get today's briefing: urgent jobs, overdue compliance, upcoming inspections",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_portfolio_summary",
      description: "Get portfolio summary: property count, open jobs, compliance score, total spend",
      parameters: { type: "object", properties: {} },
    },
  },
];

async function executeTool(
  toolName: string,
  args: any,
  supabase: any,
  userId: string
): Promise<string> {
  switch (toolName) {
    case "create_property": {
      const { data, error } = await supabase.from("properties").insert({
        user_id: userId,
        address: args.address,
        suburb: args.suburb,
        region: args.region || "Auckland",
        tenant_name: args.tenant_name,
        tenant_phone: args.tenant_phone,
        tenant_email: args.tenant_email,
        notes: args.notes,
      }).select("id, address, suburb").single();
      if (error) return `Error creating property: ${error.message}`;
      return ` Property created: ${data.address}, ${data.suburb} (ID: ${data.id}). I'd recommend setting up Healthy Homes compliance items for this property.`;
    }

    case "log_maintenance_job": {
      let propertyId = null;
      if (args.property_address) {
        const { data: props } = await supabase.from("properties")
          .select("id, address").eq("user_id", userId)
          .ilike("address", `%${args.property_address}%`).limit(1);
        if (props?.length) propertyId = props[0].id;
      }
      if (!propertyId) {
        const { data: allProps } = await supabase.from("properties")
          .select("id").eq("user_id", userId).limit(1);
        if (allProps?.length) propertyId = allProps[0].id;
        else return "No properties found. Please add a property first.";
      }
      const { data, error } = await supabase.from("maintenance_jobs").insert({
        user_id: userId,
        property_id: propertyId,
        title: args.title,
        description: args.description,
        urgency: args.urgency || "medium",
        category: args.category,
        status: "reported",
      }).select("id, title").single();
      if (error) return `Error logging job: ${error.message}`;
      return ` Job logged: "${data.title}" (${args.urgency || "medium"} urgency). ${args.category ? `Category: ${args.category}. I can search for matching ${args.category} tradies if you'd like.` : ""}`;
    }

    case "schedule_inspection": {
      const { data: props } = await supabase.from("properties")
        .select("id, address").eq("user_id", userId)
        .ilike("address", `%${args.property_address}%`).limit(1);
      if (!props?.length) return "Property not found. Check the address.";
      await supabase.from("properties").update({
        next_inspection_date: args.date,
        inspection_notes: args.notes || null,
      }).eq("id", props[0].id);
      return ` Inspection scheduled for ${props[0].address} on ${args.date}.${args.notes ? ` Notes: ${args.notes}` : ""}`;
    }

    case "add_compliance_item": {
      const { data: props } = await supabase.from("properties")
        .select("id, address").eq("user_id", userId)
        .ilike("address", `%${args.property_address}%`).limit(1);
      if (!props?.length) return "Property not found.";
      const { error } = await supabase.from("compliance_items").insert({
        user_id: userId,
        property_id: props[0].id,
        title: args.title,
        category: args.category,
        due_date: args.due_date || null,
        status: "not_checked",
      });
      if (error) return `Error: ${error.message}`;
      return ` Compliance item added: "${args.title}" (${args.category}) for ${props[0].address}.`;
    }

    case "find_tradie": {
      const { data: tradies } = await supabase.from("tradies")
        .select("name, trade, rating, jobs_completed, service_area, phone, email")
        .eq("user_id", userId)
        .ilike("trade", `%${args.trade}%`)
        .order("rating", { ascending: false })
        .limit(5);
      if (!tradies?.length) return `No ${args.trade} tradies found in your directory. You can add tradies in the Tradies tab.`;
      const list = tradies.map((t: any, i: number) =>
        `${i + 1}. **${t.name}** — ${t.trade} |  ${Number(t.rating || 0).toFixed(1)} | ${t.jobs_completed || 0} jobs | ${t.service_area || "N/A"} | ${t.phone || t.email || "No contact"}`
      ).join("\n");
      return `Found ${tradies.length} ${args.trade} tradies:\n\n${list}\n\nYou can assign one from the Jobs tab.`;
    }

    case "get_briefing": {
      const today = new Date().toISOString().split("T")[0];
      const { data: urgentJobs } = await supabase.from("maintenance_jobs")
        .select("title, urgency, status").eq("user_id", userId)
        .in("urgency", ["emergency", "high"])
        .neq("status", "completed").neq("status", "invoice_uploaded").limit(10);
      const { data: overdueComp } = await supabase.from("compliance_items")
        .select("title").eq("user_id", userId).eq("status", "overdue").limit(10);
      const { data: inspections } = await supabase.from("properties")
        .select("address, next_inspection_date").eq("user_id", userId)
        .not("next_inspection_date", "is", null)
        .gte("next_inspection_date", today)
        .order("next_inspection_date").limit(5);

      let briefing = "##  Today's Briefing\n\n";
      if (urgentJobs?.length) {
        briefing += `###  Urgent Jobs (${urgentJobs.length})\n`;
        urgentJobs.forEach((j: any) => { briefing += `- **${j.title}** — ${j.urgency} / ${j.status}\n`; });
        briefing += "\n";
      } else {
        briefing += "###  No urgent jobs\n\n";
      }
      if (overdueComp?.length) {
        briefing += `###  Overdue Compliance (${overdueComp.length})\n`;
        overdueComp.forEach((c: any) => { briefing += `- ${c.title}\n`; });
        briefing += "\n";
      }
      if (inspections?.length) {
        briefing += "###  Upcoming Inspections\n";
        inspections.forEach((p: any) => { briefing += `- ${p.address} — ${p.next_inspection_date}\n`; });
      }
      return briefing;
    }

    case "get_portfolio_summary": {
      const { count: propCount } = await supabase.from("properties").select("id", { count: "exact", head: true }).eq("user_id", userId);
      const { count: openJobCount } = await supabase.from("maintenance_jobs")
        .select("id", { count: "exact", head: true }).eq("user_id", userId)
        .neq("status", "completed").neq("status", "invoice_uploaded");
      const { data: compItems } = await supabase.from("compliance_items").select("status").eq("user_id", userId);
      const total = compItems?.length || 0;
      const compliant = compItems?.filter((c: any) => c.status === "compliant").length || 0;
      const score = total > 0 ? Math.round((compliant / total) * 100) : 0;
      const { data: invoiced } = await supabase.from("maintenance_jobs").select("invoice_amount").eq("user_id", userId).not("invoice_amount", "is", null);
      const totalSpend = (invoiced || []).reduce((s: number, j: any) => s + Number(j.invoice_amount), 0);

      return `##  Portfolio Summary\n\n- **Properties:** ${propCount || 0}\n- **Open Jobs:** ${openJobCount || 0}\n- **Compliance Score:** ${score}% (${compliant}/${total} items compliant)\n- **Total Spend:** $${totalSpend.toLocaleString()} NZD`;
    }

    default:
      return "Unknown tool.";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Verify user
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = user.id;

    // Service client for DB operations
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { messages } = await req.json();

    // Inject Knowledge Brain grounding from latest user message
    const lastUserMsg = [...messages].reverse().find((m: { role: string; content: string }) => m.role === "user")?.content ?? "";
    const grounding = await gatherLiveGrounding(lastUserMsg, "haven", serviceClient);
    const groundedSystem = HAVEN_SYSTEM_PROMPT + grounding;

    // Call AI with tools
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: groundedSystem },
          ...messages,
        ],
        tools: TOOLS,
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResp.json();
    const choice = aiData.choices?.[0];

    // If tool calls, execute them and get final response
    if (choice?.message?.tool_calls?.length) {
      const toolResults: any[] = [];
      for (const tc of choice.message.tool_calls) {
        const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
        const result = await executeTool(tc.function.name, args, serviceClient, userId);
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result,
        });
      }

      // Second call with tool results
      const followUp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: groundedSystem },
            ...messages,
            choice.message,
            ...toolResults,
          ],
        }),
      });

      if (!followUp.ok) throw new Error("Follow-up AI call failed");
      const followData = await followUp.json();
      const content = followData.choices?.[0]?.message?.content || "Action completed.";
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No tool calls — return text response
    const content = choice?.message?.content || "I'm here to help with your property management needs.";
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("haven-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
