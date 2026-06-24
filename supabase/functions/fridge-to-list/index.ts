import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are an assembl kai (food) specialist for the Tōro family kete. Look at the photo of someone's fridge/pantry and help them plan the week.

INPUT: a photo + household details (size, days to cover, dietary needs, budget).

OUTPUT FORMAT — return JSON ONLY, no prose, no markdown fences:
{
  "spotted": ["item 1", "item 2"],
  "runningLow": ["item that's almost out"],
  "meals": [
    { "name": "Meal name", "mainIngredients": ["x","y"], "extraNeeded": ["z"] }
  ],
  "shoppingList": [
    { "aisle": "Produce", "items": ["..."] },
    { "aisle": "Dairy & chilled", "items": ["..."] },
    { "aisle": "Pantry / dry goods", "items": ["..."] },
    { "aisle": "Meat / fish", "items": ["..."] },
    { "aisle": "Bakery", "items": ["..."] },
    { "aisle": "Frozen", "items": ["..."] }
  ]
}

RULES:
- New Zealand English (kūmara, mince, capsicum).
- Respect dietary notes strictly.
- Budget: "tight" = supermarket value brands, fewer meal proteins. "generous" = mid-range. Never extravagant.
- Round shopping quantities to supermarket-pack sizes.
- 3-5 meals max. Repeat-friendly.
- Do not list things you do not see in the photo as "spotted" — only confident reads.
- If the photo is unclear, return spotted: [] and add one meal: { "name": "Couldn't read the photo clearly", "mainIngredients": [], "extraNeeded": [] }.`;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const key = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

  const body = await req.json().catch(() => null);
  const imageBase64 = String(body?.imageBase64 ?? "");
  if (!imageBase64.startsWith("data:image/")) return json({ error: "Missing imageBase64 data URI" }, 400);

  const details = {
    householdSize: Number(body?.householdSize ?? 4),
    daysToCover: Number(body?.daysToCover ?? 5),
    dietaryNotes: String(body?.dietaryNotes ?? ""),
    budget: String(body?.budget ?? "normal"),
  };

  const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: `Household details:\n${JSON.stringify(details, null, 2)}` },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
      max_tokens: 1200,
      response_format: { type: "json_object" },
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    console.error("[fridge-to-list] gateway error", upstream.status, text);
    return json({ error: `Gateway error: ${upstream.status}` }, 502);
  }

  const payload = await upstream.json();
  const content = payload?.choices?.[0]?.message?.content ?? "{}";
  try {
    return json(extractJson(content));
  } catch (error) {
    console.error("[fridge-to-list] JSON parse failed", error, content);
    return json({ error: "Could not parse model output" }, 502);
  }
});
