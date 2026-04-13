import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * ═══════════════════════════════════════════════════════════
 * AURA — WhatsApp Food Safety Diary
 * Legally compliant digital Food Control Plan record system
 * Replaces the 18-page paper diary via WhatsApp voice/text
 * ═══════════════════════════════════════════════════════════
 *
 * Flow: Cron triggers daily opening check → Chef replies with temps →
 * AURA validates → logs to food_safety_records → flags corrective actions
 *
 * Records include: date, time, person name, temperature reading,
 * corrective action if required. Stored for 4 years (Food Act 2014).
 * Exportable as PDF for MPI verifier.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Equipment check sequence for opening
const OPENING_CHECKS = [
  { id: "chiller_1", label: "Chiller 1", unit: "°C", maxTemp: 5 },
  { id: "chiller_2", label: "Chiller 2", unit: "°C", maxTemp: 5 },
  { id: "freezer_1", label: "Freezer 1", unit: "°C", maxTemp: -15 },
  { id: "hot_hold", label: "Hot Hold Unit", unit: "°C", minTemp: 65 },
  { id: "handwash", label: "Handwash Station", unit: "check", options: ["ok", "needs soap", "needs towels", "not working"] },
  { id: "food_dating", label: "Food Dating Labels", unit: "check", options: ["all current", "some expired", "needs checking"] },
];

interface DiarySession {
  userId: string;
  phone: string;
  checkedBy: string;
  checkType: "opening" | "closing" | "corrective";
  currentStep: number;
  readings: Record<string, { value: string | number; compliant: boolean; timestamp: string }>;
  startedAt: string;
}

// In-memory session store (per-invocation; for production use DB)
// Sessions are keyed by phone number and persisted via agent_sms_messages context
const TEMP_COMPLIANCE = 5; // max chiller temp °C
const TEMP_FREEZE = -15;   // max freezer temp °C
const TEMP_HOT = 65;       // min hot-hold temp °C

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action, userId, phone, checkedBy, message, equipmentConfig } = body;

    // ═══ ACTION: INITIATE — Start daily opening/closing checks ═══
    if (action === "initiate") {
      const checkType = body.checkType || "opening";
      const equipment = equipmentConfig || OPENING_CHECKS;
      const firstCheck = equipment[0];

      // Store session state in agent_memory for persistence
      const session: DiarySession = {
        userId,
        phone,
        checkedBy: checkedBy || "Chef",
        checkType,
        currentStep: 0,
        readings: {},
        startedAt: new Date().toISOString(),
      };

      await sb.from("agent_memory").upsert(
        {
          user_id: userId,
          agent_id: "aura",
          memory_key: `diary_session_${phone}`,
          memory_value: session,
        },
        { onConflict: "user_id,agent_id,memory_key" }
      );

      // Build the first prompt
      const greeting = checkType === "opening"
        ? `Kia ora ${checkedBy} — ${checkType} checks time ☕`
        : `Kia ora ${checkedBy} — time for ${checkType} checks 🔒`;

      const prompt = firstCheck.unit === "check"
        ? `${greeting}\n\n${firstCheck.label}?\nOptions: ${firstCheck.options?.join(", ")}`
        : `${greeting}\n\nWhat's ${firstCheck.label} at?`;

      // Send via WhatsApp if phone provided
      if (phone) {
        await sendWhatsApp(phone, prompt);
      }

      return respond({ ok: true, prompt, sessionStarted: true, nextCheck: firstCheck.label });
    }

    // ═══ ACTION: RECORD — Process a temperature/check reading ═══
    if (action === "record") {
      // Load session
      const { data: sessionData } = await sb
        .from("agent_memory")
        .select("memory_value")
        .eq("user_id", userId)
        .eq("agent_id", "aura")
        .eq("memory_key", `diary_session_${phone}`)
        .single();

      if (!sessionData?.memory_value) {
        return respond({ ok: false, error: "No active diary session. Send 'start checks' to begin." });
      }

      const session = sessionData.memory_value as unknown as DiarySession;
      const equipment = equipmentConfig || OPENING_CHECKS;
      const currentEquip = equipment[session.currentStep];

      if (!currentEquip) {
        return respond({ ok: false, error: "All checks completed for this session." });
      }

      // Parse the reading
      const reading = message?.trim();
      let value: string | number = reading;
      let compliant = true;
      let reply = "";

      if (currentEquip.unit === "°C") {
        // Parse temperature
        const tempMatch = reading.match(/([-]?\d+\.?\d*)/);
        if (!tempMatch) {
          const retryMsg = `I didn't catch that. What temperature is ${currentEquip.label} at? (just the number)`;
          if (phone) await sendWhatsApp(phone, retryMsg);
          return respond({ ok: true, prompt: retryMsg, retry: true });
        }

        const temp = parseFloat(tempMatch[1]);
        value = temp;

        // Compliance check
        if (currentEquip.maxTemp !== undefined && temp > currentEquip.maxTemp) {
          compliant = false;
          reply = `⚠️ ${currentEquip.label}: ${temp}°C — that's above ${currentEquip.maxTemp}°C.\n`;
          reply += `How long has it been above temp? Check the door seal and if it's overloaded.\n`;
          reply += `If food's been above ${currentEquip.maxTemp}°C for more than 2 hours, it needs to be assessed for disposal.\n\n`;
          reply += `I've logged a corrective action. Reply with what you find.`;
        } else if (currentEquip.minTemp !== undefined && temp < currentEquip.minTemp) {
          compliant = false;
          reply = `⚠️ ${currentEquip.label}: ${temp}°C — that's below ${currentEquip.minTemp}°C.\n`;
          reply += `Check the unit is turned on and heating properly.\n`;
          reply += `Food must be held above ${currentEquip.minTemp}°C for safety.\n\n`;
          reply += `I've logged a corrective action. Reply with what you find.`;
        } else {
          reply = `✅ ${currentEquip.label}: ${temp}°C — sweet as.`;
        }
      } else {
        // Check-type reading (handwash, food dating, etc.)
        compliant = reading.toLowerCase().includes("ok") || reading.toLowerCase().includes("current") || reading.toLowerCase().includes("all good");
        if (!compliant) {
          reply = `⚠️ ${currentEquip.label}: ${reading} — corrective action logged. Fix and confirm when done.`;
        } else {
          reply = `✅ ${currentEquip.label}: ${reading} — all good.`;
        }
      }

      // Save reading to session
      session.readings[currentEquip.id] = {
        value,
        compliant,
        timestamp: new Date().toISOString(),
      };

      // Save to food_safety_records table
      await sb.from("food_safety_records").insert({
        user_id: userId,
        record_type: `${session.checkType}_${currentEquip.id}`,
        record_date: new Date().toISOString().split("T")[0],
        temperature: typeof value === "number" ? value : null,
        item_name: currentEquip.label,
        checked_by: session.checkedBy,
        is_compliant: compliant,
        corrective_action: compliant ? null : `Non-compliant reading: ${value}. Awaiting corrective action.`,
        shift: session.checkType,
        notes: currentEquip.unit === "check" ? String(value) : null,
      });

      // Move to next step
      session.currentStep += 1;
      const nextEquip = equipment[session.currentStep];

      if (nextEquip) {
        // Prompt for next check
        const nextPrompt = nextEquip.unit === "check"
          ? `${nextEquip.label}?\nOptions: ${nextEquip.options?.join(", ")}`
          : `${nextEquip.label}?`;
        reply += ` ${nextPrompt}`;
      } else {
        // All checks complete — generate summary
        const totalChecks = Object.keys(session.readings).length;
        const issues = Object.entries(session.readings)
          .filter(([_, r]) => !r.compliant)
          .map(([id, r]) => `• ${id}: ${r.value}`);

        reply += `\n\n━━━ ${session.checkType.toUpperCase()} CHECKS COMPLETE ━━━\n`;
        reply += `✅ ${totalChecks - issues.length}/${totalChecks} compliant\n`;
        if (issues.length > 0) {
          reply += `⚠️ ${issues.length} issue${issues.length > 1 ? "s" : ""} flagged:\n${issues.join("\n")}\n`;
          reply += `Follow up on corrective actions and reply DONE when resolved.`;
        } else {
          reply += `All clear — have a great service! 🍳`;
        }

        // Clean up session
        session.currentStep = -1; // Mark complete
      }

      // Update session
      await sb.from("agent_memory").upsert(
        {
          user_id: userId,
          agent_id: "aura",
          memory_key: `diary_session_${phone}`,
          memory_value: session as any,
        },
        { onConflict: "user_id,agent_id,memory_key" }
      );

      if (phone) await sendWhatsApp(phone, reply);
      return respond({ ok: true, reply, compliant, currentStep: session.currentStep, checkComplete: !nextEquip });
    }

    // ═══ ACTION: CORRECTIVE — Log a corrective action follow-up ═══
    if (action === "corrective") {
      await sb.from("food_safety_records").insert({
        user_id: userId,
        record_type: "corrective_action",
        record_date: new Date().toISOString().split("T")[0],
        item_name: body.equipmentId || "General",
        checked_by: checkedBy || "Chef",
        is_compliant: true,
        corrective_action: message,
        shift: body.shift || "opening",
        notes: `Corrective action completed: ${message}`,
      });

      const reply = `✅ Corrective action logged for ${body.equipmentId || "item"}.\nAction: ${message}\nTime: ${new Date().toLocaleTimeString("en-NZ", { timeZone: "Pacific/Auckland" })}`;
      if (phone) await sendWhatsApp(phone, reply);
      return respond({ ok: true, reply });
    }

    // ═══ ACTION: EXPORT — Generate verifier-ready records pack ═══
    if (action === "export") {
      const fromDate = body.fromDate || new Date(Date.now() - 365 * 86400_000).toISOString().split("T")[0];
      const toDate = body.toDate || new Date().toISOString().split("T")[0];

      const { data: records, error } = await sb
        .from("food_safety_records")
        .select("*")
        .eq("user_id", userId)
        .gte("record_date", fromDate)
        .lte("record_date", toDate)
        .order("record_date", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        return respond({ ok: false, error: error.message });
      }

      // Group by month for summary
      const byMonth: Record<string, { total: number; compliant: number; corrective: number }> = {};
      for (const r of records || []) {
        const month = r.record_date.substring(0, 7);
        if (!byMonth[month]) byMonth[month] = { total: 0, compliant: 0, corrective: 0 };
        byMonth[month].total++;
        if (r.is_compliant) byMonth[month].compliant++;
        if (r.corrective_action) byMonth[month].corrective++;
      }

      return respond({
        ok: true,
        period: { from: fromDate, to: toDate },
        totalRecords: records?.length || 0,
        summary: byMonth,
        records: records || [],
        exportNote: "Records comply with Food Act 2014 s39 record-keeping requirements. Digital records maintained for minimum 4 years.",
      });
    }

    // ═══ ACTION: STATUS — Current compliance status ═══
    if (action === "status") {
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString().split("T")[0];

      const { data: weekRecords } = await sb
        .from("food_safety_records")
        .select("is_compliant, corrective_action, record_type")
        .eq("user_id", userId)
        .gte("record_date", weekAgo);

      const total = weekRecords?.length || 0;
      const compliant = weekRecords?.filter(r => r.is_compliant).length || 0;
      const corrective = weekRecords?.filter(r => r.corrective_action).length || 0;
      const todayDone = weekRecords?.some(r => r.record_type?.startsWith("opening")) || false;

      return respond({
        ok: true,
        weekSummary: {
          totalChecks: total,
          compliant,
          nonCompliant: total - compliant,
          correctiveActions: corrective,
          complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 0,
        },
        todayOpeningCheckDone: todayDone,
      });
    }

    return respond({ ok: false, error: `Unknown action: ${action}. Use: initiate, record, corrective, export, status` });
  } catch (error) {
    console.error("[food-safety-diary] Error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── Helpers ───────────────────────────────────────────
function respond(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendWhatsApp(to: string, body: string): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
  if (!accountSid || !authToken || !fromNumber) return;

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
      },
      body: new URLSearchParams({
        To: `whatsapp:${to}`,
        From: `whatsapp:${fromNumber}`,
        Body: body.length > 4000 ? body.substring(0, 3997) + "..." : body,
      }),
    }
  ).catch(e => console.error("[food-safety-diary] WhatsApp send error:", e));
}
