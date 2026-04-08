import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* ══════════════════════════════════════════════════════════
   TŌROA — Super-Thinking SMS Family Navigator
   Features: Vision AI, Memory System, Traffic Intelligence,
             Proactive Alerts, Forward Planning
   ══════════════════════════════════════════════════════════ */

/* ── Intent keywords ── */
const INTENT_MAP: Record<string, string[]> = {
  newsletter: ["school", "newsletter", "action", "event", "due", "notice", "principal"],
  packing: ["packing", "pack", "trip", "activity", "luggage", "camping", "ski"],
  bus: ["bus", "transport", "at", "metlink", "arrive", "when", "train"],
  meals: ["meal", "food", "recipe", "shopping", "grocery", "dinner", "lunch", "fridge"],
  budget: ["budget", "spending", "money", "expense", "cost", "spend", "income"],
  calendar: ["calendar", "event", "appointment", "schedule", "add", "training", "practice"],
  homework: ["homework", "assignment", "essay", "due", "study", "project", "science", "maths"],
  traffic: ["traffic", "drive", "commute", "route", "road", "motorway", "highway", "directions"],
  location: ["home", "address", "school address", "work address", "save location", "my address"],
  smarthome: ["alexa", "lights", "thermostat", "smart home", "heating", "turn on", "turn off", "set temperature", "lock door", "garage", "alarm", "echo", "google home", "home assistant"],
  help: ["help", "commands", "what can you do", "hi toroa", "hey toroa", "start"],
};

function classifyIntent(msg: string, hasMedia: boolean): string {
  if (hasMedia) return "newsletter";
  const lower = msg.toLowerCase();
  for (const [intent, words] of Object.entries(INTENT_MAP)) {
    if (words.some((w) => lower.includes(w))) return intent;
  }
  return "general";
}

/* ── Parse inbound ── */
interface InboundSms {
  from: string;
  to: string;
  body: string;
  messageId: string;
  provider: "twilio" | "vonage" | "tnz" | "direct";
  mediaUrl?: string;
  mediaType?: string;
  numMedia?: number;
}

async function parsePayload(req: Request): Promise<InboundSms> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    const numMedia = parseInt((form.get("NumMedia") as string) || "0", 10);
    return {
      from: (form.get("From") as string) || "",
      to: (form.get("To") as string) || "",
      body: (form.get("Body") as string) || "",
      messageId: (form.get("MessageSid") as string) || "",
      provider: "twilio",
      numMedia,
      mediaUrl: numMedia > 0 ? (form.get("MediaUrl0") as string) || undefined : undefined,
      mediaType: numMedia > 0 ? (form.get("MediaContentType0") as string) || undefined : undefined,
    };
  }
  const raw = await req.json();
  console.log("toroa-sms raw inbound", JSON.stringify(raw));

  if (raw.msisdn) {
    return { from: raw.msisdn.startsWith("+") ? raw.msisdn : `+${raw.msisdn}`, to: raw.to || "", body: raw.text || raw.message || "", messageId: raw.messageId || raw["message-id"] || "", provider: "vonage" };
  }

  // Normalise field names — accept TNZ v2.04 capitalised AND lowercase shapes
  const from = raw.from ?? raw.From ?? raw.Sender ?? raw.SourceAddress ?? null;
  const to = raw.to ?? raw.To ?? raw.Destination ?? raw.DestinationAddress ?? null;
  const body = raw.body ?? raw.Body ?? raw.message ?? raw.Message ?? raw.MessageText ?? raw.text ?? null;
  const messageId = raw.messageId ?? raw.MessageID ?? raw.MessageId ?? raw["message-id"] ?? "";

  if (from || raw.Sender || raw.From) {
    const provider = (raw.Sender || raw.Destination || raw.MessageText || raw.Message) ? "tnz" as const : "direct" as const;
    return { from: from || "", to: to || "", body: body || "", messageId, provider, mediaUrl: raw.mediaUrl || raw.imageUrl || undefined, mediaType: raw.mediaType || "image/jpeg" };
  }

  return { from: from || raw.phone || "", to: to || "", body: body || "", messageId, provider: "direct", mediaUrl: raw.mediaUrl || raw.imageUrl || undefined, mediaType: raw.mediaType || "image/jpeg" };
}

/* ── Fetch media for Vision AI ── */
async function fetchMediaAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const headers: Record<string, string> = {};
    if (url.includes("twilio.com") && accountSid && authToken) {
      headers["Authorization"] = `Basic ${btoa(`${accountSid}:${authToken}`)}`;
    }
    const resp = await fetch(url, { headers });
    if (!resp.ok) return null;
    const buffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return { base64: btoa(binary), mimeType: resp.headers.get("content-type") || "image/jpeg" };
  } catch { return null; }
}

/* ── Send SMS ── */
async function sendSms(to: string, message: string): Promise<void> {
  const token = Deno.env.get("TNZ_AUTH_TOKEN");
  const base = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v2.02";
  const from = Deno.env.get("TNZ_FROM_NUMBER") || "TOROA";
  if (!token) { console.warn("TNZ_AUTH_TOKEN not set"); return; }
  try {
    await fetch(`${base}/send/sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${token}` },
      body: JSON.stringify({ MessageData: { Message: message, Destinations: [{ Recipient: to }], Reference: `toroa-${Date.now()}`, FromNumber: from } }),
    });
  } catch (err) { console.error("SMS send error:", err); }
}

/* ══════════════════════════════════════════════════════════
   MEMORY SYSTEM — Remember everything about the whānau
   ══════════════════════════════════════════════════════════ */

interface FamilyMemory {
  category: string;
  memory_key: string;
  memory_value: any;
}

async function loadFamilyMemory(sb: any, familyId: string): Promise<FamilyMemory[]> {
  const { data } = await sb
    .from("toroa_family_memory")
    .select("category, memory_key, memory_value")
    .eq("family_id", familyId)
    .is("expires_at", null) // only non-expired
    .order("updated_at", { ascending: false })
    .limit(50);
  return data || [];
}

async function extractAndSaveMemories(sb: any, familyId: string, userMsg: string, aiReply: string, apiKey: string): Promise<void> {
  try {
    const extractResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You extract structured family information from conversations. Output ONLY valid JSON array. Each item: {"category": "...", "key": "...", "value": "..."}

Categories: children, schools, dietary, allergies, routines, locations, preferences, activities, pets, vehicles, work, important_dates, health, emergency_contacts

Rules:
- Only extract CONCRETE facts, not opinions or vague statements
- Children: name, age, year level, school
- Locations: home address, school address, work address
- Routines: school drop-off time, pickup time, activity days
- If no facts found, return empty array []
- Never invent or assume facts`
          },
          { role: "user", content: `USER: ${userMsg}\nASSISTANT: ${aiReply}` }
        ],
        max_tokens: 300,
      }),
    });

    if (!extractResp.ok) return;
    const result = await extractResp.json();
    const content = result.choices?.[0]?.message?.content || "[]";
    
    // Parse JSON from response (handle markdown code blocks)
    let memories: Array<{ category: string; key: string; value: string }> = [];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      memories = JSON.parse(cleaned);
    } catch { return; }

    if (!Array.isArray(memories) || memories.length === 0) return;

    for (const mem of memories) {
      if (!mem.category || !mem.key || !mem.value) continue;
      // Upsert: update if same family+category+key exists
      await sb.from("toroa_family_memory").upsert(
        {
          family_id: familyId,
          category: mem.category,
          memory_key: mem.key,
          memory_value: { text: mem.value, raw: true },
          source: "conversation",
          confidence: 0.9,
        },
        { onConflict: "family_id,category,memory_key" }
      );
    }
  } catch (e) {
    console.error("Memory extraction error:", e);
  }
}

function formatMemoryForPrompt(memories: FamilyMemory[]): string {
  if (memories.length === 0) return "";
  
  const grouped: Record<string, string[]> = {};
  for (const m of memories) {
    if (!grouped[m.category]) grouped[m.category] = [];
    const val = typeof m.memory_value === "object" && m.memory_value?.text 
      ? m.memory_value.text 
      : JSON.stringify(m.memory_value);
    grouped[m.category].push(`${m.memory_key}: ${val}`);
  }

  let prompt = "\n\n🧠 FAMILY MEMORY (use naturally, never reveal you're reading a database):\n";
  for (const [cat, items] of Object.entries(grouped)) {
    prompt += `[${cat.toUpperCase()}] ${items.join(" | ")}\n`;
  }
  prompt += "\nUse this knowledge naturally — reference children by name, remember their preferences, anticipate needs based on routines. If you know their school drop-off time and they're asking about traffic, proactively mention timing.";
  return prompt;
}

/* ══════════════════════════════════════════════════════════
   TRAFFIC INTELLIGENCE — Google Maps Routes API
   ══════════════════════════════════════════════════════════ */

interface TrafficInfo {
  duration_text: string;
  duration_in_traffic_text: string;
  delay_minutes: number;
  summary: string;
  warnings: string[];
}

async function getTrafficInfo(origin: string, destination: string): Promise<TrafficInfo | null> {
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) {
    // Fallback: use Open-Meteo for weather-based travel warnings
    return null;
  }
  
  try {
    const params = new URLSearchParams({
      origin,
      destination,
      departure_time: "now",
      traffic_model: "best_guess",
      key: apiKey,
    });
    
    const resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params}`);
    if (!resp.ok) return null;
    
    const data = await resp.json();
    if (data.status !== "OK" || !data.routes?.[0]) return null;
    
    const leg = data.routes[0].legs[0];
    const normalSec = leg.duration?.value || 0;
    const trafficSec = leg.duration_in_traffic?.value || normalSec;
    const delayMin = Math.round((trafficSec - normalSec) / 60);
    
    return {
      duration_text: leg.duration?.text || "unknown",
      duration_in_traffic_text: leg.duration_in_traffic?.text || leg.duration?.text || "unknown",
      delay_minutes: delayMin,
      summary: data.routes[0].summary || "",
      warnings: data.routes[0].warnings || [],
    };
  } catch (e) {
    console.error("Traffic API error:", e);
    return null;
  }
}

async function getTrafficContext(sb: any, familyId: string): Promise<string> {
  // Load family locations
  const { data: locations } = await sb
    .from("toroa_family_locations")
    .select("label, address, location_type")
    .eq("family_id", familyId);
  
  if (!locations || locations.length < 2) return "";
  
  const home = locations.find((l: any) => l.location_type === "home");
  const school = locations.find((l: any) => l.location_type === "school");
  const work = locations.find((l: any) => l.location_type === "work");
  
  const routes: string[] = [];
  
  // Check home→school traffic
  if (home?.address && school?.address) {
    const traffic = await getTrafficInfo(home.address, school.address);
    if (traffic && traffic.delay_minutes > 5) {
      routes.push(`🚗 Home→School: ${traffic.duration_in_traffic_text} (${traffic.delay_minutes}min delay via ${traffic.summary})`);
    } else if (traffic) {
      routes.push(`🚗 Home→School: ${traffic.duration_in_traffic_text} (clear roads)`);
    }
  }
  
  // Check home→work traffic
  if (home?.address && work?.address) {
    const traffic = await getTrafficInfo(home.address, work.address);
    if (traffic && traffic.delay_minutes > 5) {
      routes.push(`🚗 Home→Work: ${traffic.duration_in_traffic_text} (${traffic.delay_minutes}min delay via ${traffic.summary})`);
    } else if (traffic) {
      routes.push(`🚗 Home→Work: ${traffic.duration_in_traffic_text} (clear roads)`);
    }
  }
  
  if (routes.length === 0) return "";
  return `\n\n🛣️ LIVE TRAFFIC:\n${routes.join("\n")}`;
}

/* ══════════════════════════════════════════════════════════
   FORWARD-THINKING CONTEXT — Anticipate family needs
   ══════════════════════════════════════════════════════════ */

async function getForwardThinkingContext(sb: any, familyId: string, memories: FamilyMemory[]): Promise<string> {
  const nzNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Pacific/Auckland" }));
  const hour = nzNow.getHours();
  const dayOfWeek = nzNow.getDay(); // 0=Sun
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isSchoolHours = isWeekday && hour >= 6 && hour <= 9;
  const isAfternoon = hour >= 14 && hour <= 17;
  const isEvening = hour >= 17 && hour <= 21;
  
  const hints: string[] = [];
  
  // Time-based anticipation
  if (isSchoolHours) {
    hints.push("It's school drop-off time — traffic info and weather relevant");
    const schoolMem = memories.find(m => m.category === "routines" && m.memory_key.includes("drop"));
    if (schoolMem) hints.push(`Family drop-off routine: ${schoolMem.memory_value?.text || JSON.stringify(schoolMem.memory_value)}`);
  }
  
  if (isAfternoon && isWeekday) {
    hints.push("Afternoon pickup window — check if any after-school activities today");
    const activities = memories.filter(m => m.category === "activities");
    if (activities.length > 0) {
      hints.push(`Known activities: ${activities.map(a => `${a.memory_key}: ${a.memory_value?.text || ""}`).join(", ")}`);
    }
  }
  
  if (isEvening) {
    hints.push("Evening — meal planning, homework help, and tomorrow prep are likely needs");
  }
  
  // Check for upcoming calendar events
  const { data: calendar } = await sb
    .from("toroa_calendar")
    .select("title, event_date, event_time, location")
    .eq("family_id", familyId)
    .gte("event_date", nzNow.toISOString().split("T")[0])
    .order("event_date", { ascending: true })
    .limit(3);
  
  if (calendar && calendar.length > 0) {
    hints.push("📅 UPCOMING EVENTS:");
    for (const evt of calendar) {
      hints.push(`- ${evt.title} on ${evt.event_date}${evt.event_time ? ` at ${evt.event_time}` : ""}${evt.location ? ` (${evt.location})` : ""}`);
    }
  }
  
  // Weather awareness
  try {
    // Check if family has a home location
    const homeMem = memories.find(m => m.category === "locations" && m.memory_key === "home_city");
    const city = homeMem?.memory_value?.text || "Auckland";
    
    const { data: locations } = await sb
      .from("toroa_family_locations")
      .select("lat, lon")
      .eq("family_id", familyId)
      .eq("location_type", "home")
      .limit(1);
    
    const lat = locations?.[0]?.lat || -36.85;
    const lon = locations?.[0]?.lon || 174.76;
    
    const weatherResp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code&timezone=Pacific/Auckland`
    );
    if (weatherResp.ok) {
      const weather = await weatherResp.json();
      const curr = weather.current;
      if (curr.precipitation > 0) hints.push(`🌧️ Rain currently (${curr.precipitation}mm) — remind about jackets/umbrellas`);
      if (curr.temperature_2m < 10) hints.push(`🥶 Cold (${curr.temperature_2m}°C) — suggest warm layers`);
      if (curr.temperature_2m > 25) hints.push(`☀️ Hot (${curr.temperature_2m}°C) — remind about sunscreen, water bottles`);
    }
  } catch { /* weather fetch failed, non-critical */ }
  
  if (hints.length === 0) return "";
  return `\n\n🔮 FORWARD-THINKING CONTEXT (use proactively where relevant):\n${hints.join("\n")}`;
}

/* ── System prompt by intent ── */
function systemPromptForIntent(intent: string, memoryContext: string, trafficContext: string, forwardContext: string): string {
  const base = `You are Tōroa, a SUPER-THINKING SMS-first AI family navigator for New Zealand whānau. You don't just answer — you ANTICIPATE. You remember everything about this family and proactively surface relevant information.

PERSONALITY: Warm, clever, anticipatory. Like having a brilliant PA who also happens to be a trusted Kiwi friend. Use te reo Māori naturally. Use NZ English.

SUPER-THINKING RULES:
1. ALWAYS reference family members by name when you know them
2. If the time of day + family routines suggest something, proactively mention it
3. If traffic is bad and you know their school run, warn them
4. If weather is relevant to their activities, mention it
5. Connect dots between different pieces of knowledge (e.g., "Aroha has her swimming lesson today — don't forget her togs!")
6. Think 2 steps ahead: if they ask about dinner, also mention tomorrow's school lunch
7. Keep responses UNDER 1500 chars for SMS
8. NEVER reveal you're reading from a database — be natural

Current NZ time: ${new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}`;

  const extras: Record<string, string> = {
    newsletter: `\n\nParsing a school newsletter (text or photo). Extract: school name, action items (dates, costs), deadlines. Format concisely. If you know which child attends this school, personalise the summary.`,
    packing: `\n\nCreating a packing list. Use NZ retailers. If you know the child's sizes or preferences, reference them.`,
    bus: `\n\nNZ public transport help. Reference AT (Auckland), Metlink (Wellington). If you know their usual bus route, proactively check it.`,
    meals: `\n\nFamily meal planning. If you know dietary requirements or preferences, use them. Reference NZ supermarkets. If fridge photo sent, ID items and plan meals.`,
    budget: `\n\nNZ family budgeting. Use NZD. Reference FamilyBoost, WFF. If you know their spending patterns, personalise advice.`,
    calendar: `\n\nFamily calendar management. Use DD/MM/YYYY. Check for conflicts with known activities. Proactively suggest preparation needed.`,
    homework: `\n\nHomework tracking. If you know the child's subjects and year level, personalise. Be encouraging.`,
    traffic: `\n\nTraffic and route intelligence. Provide real-time conditions. If you know their usual routes, proactively advise on timing. Suggest departure times for on-time arrival.`,
    location: `\n\nThe user wants to save or update a location. Confirm the address and label. Supported types: home, school, work, other. Format: "✅ Saved! I'll use this for traffic alerts and smart timing."`,
    smarthome: `\n\nSmart home control via SMS. The family can control Alexa, Google Home, or Home Assistant devices by texting Tōroa. Parse their request into device + action. Supported: lights (on/off/dim), thermostat (set temp), locks (lock/unlock), garage (open/close), alarms (arm/disarm). Confirm the action clearly: "✅ Done! Living room lights set to 50%." If you don't recognise the device, ask them to clarify. Remind them they can link their smart home account at assembl.co.nz/toroa/smarthome.`,
    help: `\n\nList capabilities: 📧 Newsletter parsing (text + photo!), 🎒 Packing lists, 🚌 Bus times, 🍽️ Meal planning (send a fridge photo!), 💰 Budget, 📅 Calendar, 📚 Homework, 🚗 Live traffic + smart route alerts, 🏠 Smart home control (Alexa/Google Home), 🧠 I remember everything about your whānau! Be warm and mention you can learn their routines.`,
    general: `\n\nGeneral NZ family questions. Reference FamilyBoost, WINZ, Plunket. Always think: what else might this family need right now?`,
  };

  return base + (extras[intent] || extras.general) + memoryContext + trafficContext + forwardContext;
}

/* ── Build multimodal messages ── */
function buildMessages(
  systemPrompt: string,
  chatHistory: Array<{ role: string; content: string }>,
  userText: string,
  mediaData: { base64: string; mimeType: string } | null,
) {
  const messages: any[] = [{ role: "system", content: systemPrompt }, ...chatHistory];
  if (mediaData) {
    const userContent: any[] = [
      { type: "text", text: userText || "Please parse this school newsletter or notice and extract action items, dates, and costs." },
      { type: "image_url", image_url: { url: `data:${mediaData.mimeType};base64,${mediaData.base64}` } },
    ];
    messages.push({ role: "user", content: userContent });
  } else {
    messages.push({ role: "user", content: userText });
  }
  return messages;
}

/* ══════════════════════════════════════════════════════════
   MAIN HANDLER
   ══════════════════════════════════════════════════════════ */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const sms = await parsePayload(req);
    if (!sms.from || (!sms.body && !sms.mediaUrl)) {
      return new Response(JSON.stringify({ error: "Invalid SMS payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 1. Find or create family
    let { data: family } = await sb.from("toroa_families").select("*").eq("primary_phone", sms.from).single();
    if (!family) {
      const { data: newFamily } = await sb.from("toroa_families").insert({
        primary_phone: sms.from, status: "trial", plan: "starter",
        messages_remaining: 10, monthly_sms_limit: 100, sms_used_this_month: 0,
      }).select().single();
      family = newFamily;
    }
    if (!family) {
      return new Response(JSON.stringify({ error: "Failed to create family" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. Check SMS allowance
    if (family.status === "trial" && (family.messages_remaining ?? 0) <= 0) {
      await sendSms(sms.from, "Kia ora! You've used your free trial messages. Subscribe to keep using Tōroa → https://assembl.co.nz/toroa");
      return new Response(JSON.stringify({ status: "trial_expired" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (family.status === "active" && family.plan !== "plus") {
      const limit = family.monthly_sms_limit || 100;
      if ((family.sms_used_this_month || 0) >= limit) {
        await sendSms(sms.from, `You've hit your ${limit} SMS limit. Upgrade → https://assembl.co.nz/toroa`);
        return new Response(JSON.stringify({ status: "limit_reached" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // 3. Vision AI — fetch media if present
    let mediaData: { base64: string; mimeType: string } | null = null;
    const hasMedia = !!(sms.mediaUrl || (sms.numMedia && sms.numMedia > 0));
    if (sms.mediaUrl) mediaData = await fetchMediaAsBase64(sms.mediaUrl);

    // 4. Classify intent
    const intent = classifyIntent(sms.body || "", hasMedia);

    // 5. Load family memory + traffic + forward-thinking context (parallel)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const [memories, trafficCtx, history] = await Promise.all([
      loadFamilyMemory(sb, family.id),
      (intent === "traffic" || intent === "bus") ? getTrafficContext(sb, family.id) : Promise.resolve(""),
      sb.from("toroa_conversations").select("direction, message, response").eq("family_id", family.id).order("created_at", { ascending: false }).limit(10),
    ]);

    const memoryContext = formatMemoryForPrompt(memories);
    const forwardContext = await getForwardThinkingContext(sb, family.id, memories);

    const chatHistory = (history.data || []).reverse().flatMap((msg: any) => {
      const msgs = [{ role: "user" as const, content: msg.message }];
      if (msg.response) msgs.push({ role: "assistant" as const, content: msg.response });
      return msgs;
    });

    // 6. Call AI
    const model = mediaData ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";
    const systemPrompt = systemPromptForIntent(intent, memoryContext, trafficCtx, forwardContext);
    const messages = buildMessages(systemPrompt, chatHistory, sms.body || "", mediaData);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, max_tokens: 600 }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        await sendSms(sms.from, "Kia ora! Tōroa's a bit busy right now. Try again in a minute 🌊");
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI error: ${aiResp.status}`);
    }

    const aiResult = await aiResp.json();
    const replyText = aiResult.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Try again?";
    const tokensUsed = aiResult.usage?.total_tokens || 0;
    const finalReply = replyText.length > 1500 ? replyText.substring(0, 1497) + "..." : replyText;

    // 7. Send reply
    await sendSms(sms.from, finalReply);

    // 8. Log conversation
    await sb.from("toroa_conversations").insert({
      family_id: family.id, direction: "incoming", phone: sms.from,
      message: sms.body || (hasMedia ? "[Image sent]" : ""), intent,
      response: finalReply, tokens_used: tokensUsed,
    });

    // 9. Extract and save memories (async, don't block response)
    extractAndSaveMemories(sb, family.id, sms.body || "", finalReply, LOVABLE_API_KEY).catch(e => console.error("Memory save error:", e));

    // 10. Update usage
    const updates: Record<string, any> = { sms_used_this_month: (family.sms_used_this_month || 0) + 1 };
    if (family.status === "trial") updates.messages_remaining = Math.max(0, (family.messages_remaining || 0) - 1);
    await sb.from("toroa_families").update(updates).eq("id", family.id);

    return new Response(
      JSON.stringify({ success: true, messageId: sms.messageId, intent, vision: !!mediaData, memoriesLoaded: memories.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("toroa-sms error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
