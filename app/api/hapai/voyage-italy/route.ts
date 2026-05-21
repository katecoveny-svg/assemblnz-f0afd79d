import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CITY_COORDS: Record<string, { name: string; lat: number; lon: number }> = {
  rome: { name: "Rome", lat: 41.9028, lon: 12.4964 },
  roma: { name: "Rome", lat: 41.9028, lon: 12.4964 },
  florence: { name: "Florence", lat: 43.7696, lon: 11.2558 },
  firenze: { name: "Florence", lat: 43.7696, lon: 11.2558 },
  venice: { name: "Venice", lat: 45.4408, lon: 12.3155 },
  venezia: { name: "Venice", lat: 45.4408, lon: 12.3155 },
  milan: { name: "Milan", lat: 45.4642, lon: 9.19 },
  milano: { name: "Milan", lat: 45.4642, lon: 9.19 },
  como: { name: "Como", lat: 45.8081, lon: 9.0852 },
  "lake como": { name: "Lake Como", lat: 45.9859, lon: 9.2649 },
  garda: { name: "Lake Garda", lat: 45.6047, lon: 10.6351 },
  "lake garda": { name: "Lake Garda", lat: 45.6047, lon: 10.6351 },
  naples: { name: "Naples", lat: 40.8518, lon: 14.2681 },
  napoli: { name: "Naples", lat: 40.8518, lon: 14.2681 },
  bologna: { name: "Bologna", lat: 44.4949, lon: 11.3426 },
  siena: { name: "Siena", lat: 43.3188, lon: 11.3308 },
  tuscany: { name: "Tuscany", lat: 43.7711, lon: 11.2486 },
  "cinque terre": { name: "Cinque Terre", lat: 44.1461, lon: 9.6546 },
  "la spezia": { name: "La Spezia", lat: 44.1025, lon: 9.8241 },
  amalfi: { name: "Amalfi", lat: 40.634, lon: 14.6027 },
  praiano: { name: "Praiano", lat: 40.6125, lon: 14.5248 },
  positano: { name: "Positano", lat: 40.6281, lon: 14.4849 },
  sorrento: { name: "Sorrento", lat: 40.6263, lon: 14.3757 },
};

const SYSTEM_PROMPT = `You are VOYAGE — assembl's practical Italy travel desk for a New Zealand traveller.

You turn messy travel context into a useful daily operating brief. The public tool is draft-only: it can help the traveller decide, check, pack, translate, and prepare, but it must never claim to book, cancel, message, insure, pay, change a calendar, or alter a reservation.

Inputs may include a city, dates, bookings, worries, travel notes, weather, FX, and a photo/screenshot of a menu, sign, timetable, booking email, ticket, map, or notice. If an image is attached, extract only visible facts you can read. If the image is unclear, say so and ask for a closer photo.

OUTPUT FORMAT — return HTML using only these tags: <h2>, <p>, <ul>, <li>, <strong>. No other tags. No markdown fences.

Sections in this exact order:
<h2>Today in plain English</h2> — one short paragraph that says what matters.
<h2>Trip board</h2> — travellers, departure date, route, and key bookings supplied by the user.
<h2>Top 3 moves</h2> — exactly three bullets, each with why it matters today.
<h2>Weather and what to bring</h2> — use supplied live weather when present; include shoes, layers, rain, sun, water, tickets, adapter, passport, or medication only when relevant.
<h2>Bookings and timing risks</h2> — tickets, opening hours, train buffers, airport transfers, must-book galleries, check-in windows, queues, and Sunday/public-holiday risks.
<h2>Local sparks</h2> — 3 specific, slightly less obvious ideas that fit the city, weather, energy level, route, and user's preferences. Make these feel like a good local friend, not a generic top-ten list. Do not invent secret access or unsafe advice.
<h2>Photo or screenshot read</h2> — visible details from the image only. If no image, say <p>No image supplied.</p>.
<h2>Useful Italian</h2> — 3 to 6 short phrases with English meaning, matched to the situation.
<h2>Draft actions</h2> — bullets for messages, questions, calendar holds, or notes to review. Every item must be draft-only and human-approved.
<h2>Tomorrow watch</h2> — one short paragraph or bullets naming what to check next.

Rules:
- Use New Zealand English.
- Lowercase "assembl" if it appears.
- Be practical, warm, and specific.
- Do not invent booking numbers, train times, prices, or opening hours.
- Flag when live data was unavailable.
- Convert EUR to NZD using the supplied FX rate when useful.
- For Italy, remember common must-book spots: Vatican Museums, Colosseum underground/arena, Borghese Gallery, Uffizi, Accademia, Last Supper, Doge's Palace secret itineraries.
- Mention Schengen/passport/insurance only when relevant to the user's notes.`;

function sanitizeHtml(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<\/?(?!h2\b|p\b|ul\b|li\b|strong\b)[a-z][^>]*>/gi, "")
    .replace(/\bonly an ai\b/gi, "only a specialist")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function appendWatermark(html: string) {
  return (
    html +
    `<footer style="margin-top:28px;padding-top:16px;border-top:1px solid rgba(35,33,31,0.12);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(35,33,31,0.62);display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;line-height:1.5;">` +
    `<span><span style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;text-transform:none;letter-spacing:0;font-size:14px;color:#2B6B57;">assembl</span> · voyage italy</span>` +
    `<a href="https://assembl.co.nz/hapai/voyage-italy" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">assembl.co.nz/hapai/voyage-italy →</a>` +
    `</footer>`
  );
}

async function getFx() {
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=EUR&to=NZD", {
      next: { revalidate: 60 * 60 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    const rate = Number(data?.rates?.NZD);
    if (!Number.isFinite(rate)) return null;
    return { rate, date: String(data.date ?? "") };
  } catch {
    return null;
  }
}

async function getWeather(cityInput: string) {
  const key = cityInput.toLowerCase().trim();
  const city = CITY_COORDS[key] ?? CITY_COORDS[key.split(",")[0]?.trim() ?? ""] ?? CITY_COORDS.rome;
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(city.lat));
    url.searchParams.set("longitude", String(city.lon));
    url.searchParams.set("timezone", "Europe/Rome");
    url.searchParams.set("current", "temperature_2m,precipitation,weather_code,wind_speed_10m");
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code");
    url.searchParams.set("forecast_days", "3");
    const response = await fetch(url, { next: { revalidate: 20 * 60 } });
    if (!response.ok) return { city, summary: "Live weather unavailable." };
    const data = await response.json();
    const current = data.current ?? {};
    const daily = data.daily ?? {};
    return {
      city,
      summary: [
        `${city.name}: ${Math.round(Number(current.temperature_2m ?? 0))}°C now`,
        `wind ${Math.round(Number(current.wind_speed_10m ?? 0))} km/h`,
        `rain now ${Number(current.precipitation ?? 0)} mm`,
        Array.isArray(daily.precipitation_probability_max)
          ? `next 3 days rain risk ${daily.precipitation_probability_max.slice(0, 3).join("% / ")}%`
          : null,
      ]
        .filter(Boolean)
        .join("; "),
    };
  } catch {
    return { city, summary: "Live weather unavailable." };
  }
}

function routeCities(routePlan: string, currentCity: string) {
  const text = `${currentCity}\n${routePlan}`.toLowerCase();
  const found = new Map<string, { name: string; lat: number; lon: number }>();
  for (const [key, city] of Object.entries(CITY_COORDS)) {
    if (text.includes(key)) found.set(city.name, city);
  }
  if (found.size === 0) found.set(CITY_COORDS.rome.name, CITY_COORDS.rome);
  return [...found.values()].slice(0, 8);
}

async function getRouteWeather(routePlan: string, currentCity: string) {
  const cities = routeCities(routePlan, currentCity);
  const weather = await Promise.all(cities.map((city) => getWeather(city.name)));
  return weather.map((item) => ({
    city: item.city.name,
    summary: item.summary,
  }));
}

function fallbackHtml(input: {
  city: string;
  travelers: string;
  departureDate: string;
  routePlan: string;
  bookingVault: string;
  today: string;
  bookings: string;
  worries: string;
  notes: string;
  weather: string;
  fx: string;
  routeWeather: Array<{ city: string; summary: string }>;
  question: string;
  moments: string;
  imageAttached: boolean;
}) {
  const context = [input.bookingVault, input.bookings, input.worries, input.notes]
    .join("\n")
    .split(/[\n\r]+/)
    .map((line) => line.replace(/^[-•*\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
  const priorityItems = [
    context[0] ?? "Confirm today's first movement before leaving the hotel.",
    context[1] ?? "Put tickets, passport, wallet, phone battery, and accommodation address in one easy place.",
    context[2] ?? "Check tomorrow's train or transfer while you still have calm time.",
  ];

  return [
    `<h2>Today in plain English</h2><p>${escapeHtml(input.today || `Use this as a calm travel desk for ${input.city || "Italy"}: check the plan, spot timing risks, and leave with the few things that matter.`)}</p>`,
    `<h2>Trip board</h2><ul><li><strong>Travellers:</strong> ${escapeHtml(input.travelers || "Kate and Adrian")}</li><li><strong>Departure:</strong> ${escapeHtml(input.departureDate || "Sunday 24 May 2026")}</li><li><strong>Route:</strong> ${escapeHtml(input.routePlan || "Italy route not supplied yet.")}</li><li><strong>Booking vault:</strong> ${escapeHtml(input.bookingVault ? "Flight, hotel, and booking details supplied." : "No booking vault text supplied yet.")}</li></ul>`,
    `<h2>Top 3 moves</h2><ul>${priorityItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`,
    `<h2>Weather and what to bring</h2><p>${escapeHtml(input.weather || "Live weather unavailable.")}</p><ul><li>Comfortable walking shoes, charged phone, water, and a light layer.</li><li>Keep passport, ticket screenshots, and accommodation address available offline.</li></ul>`,
    `<h2>Bookings and timing risks</h2><ul><li>For major museums, galleries, trains, and airport transfers, check the booking window and queue buffer before leaving.</li><li>Sunday and public-holiday hours can be different in Italy; confirm before crossing town.</li></ul>`,
    `<h2>Local sparks</h2><ul><li>Choose one slower neighbourhood wander near your base instead of crossing the city twice.</li><li>Save one cafe, piazza, or viewpoint as a low-effort reset if the main plan gets too hot or crowded.</li><li>Ask the hotel for one nearby dinner option they would send a friend to, then check the menu before walking over.</li></ul>`,
    `<h2>Photo or screenshot read</h2><p>${input.imageAttached ? "An image was attached. Generation was unavailable, so review the visible text manually before acting." : "No image supplied."}</p>`,
    `<h2>Useful Italian</h2><ul><li><strong>Dov'e la stazione?</strong> — Where is the station?</li><li><strong>Ho una prenotazione.</strong> — I have a booking.</li><li><strong>Quanto costa?</strong> — How much does it cost?</li><li><strong>Posso avere acqua naturale?</strong> — Could I have still water?</li></ul>`,
    `<h2>Draft actions</h2><ul><li>Draft a note with today's address, booking times, and must-bring items.</li><li>Draft any message to accommodation or tour provider for human review before sending.</li></ul>`,
    `<h2>Tomorrow watch</h2><p>${escapeHtml(input.fx || "FX unavailable.")} Check tomorrow's travel time, weather, and tickets tonight while you still have options.</p>`,
  ].join("");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const city = String(body?.city ?? "Rome").trim().slice(0, 80);
  const travelers = String(body?.travelers ?? "Kate, Adrian").trim().slice(0, 240);
  const departureDate = String(body?.departureDate ?? "2026-05-24").trim().slice(0, 80);
  const routePlan = String(body?.routePlan ?? "").trim().slice(0, 4000);
  const bookingVault = String(body?.bookingVault ?? "").trim().slice(0, 12000);
  const question = String(body?.question ?? "").trim().slice(0, 1600);
  const moments = String(body?.moments ?? "").trim().slice(0, 4000);
  const today = String(body?.today ?? "").trim().slice(0, 1600);
  const bookings = String(body?.bookings ?? "").trim().slice(0, 5000);
  const worries = String(body?.worries ?? "").trim().slice(0, 4000);
  const notes = String(body?.notes ?? "").trim().slice(0, 9000);
  const imageDataUrl = String(body?.imageDataUrl ?? "").trim();

  if (imageDataUrl && !imageDataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "Upload a photo or screenshot image." }, { status: 400 });
  }
  if (imageDataUrl.length > 11_200_000) {
    return NextResponse.json({ error: "Please upload an image under 8MB." }, { status: 413 });
  }
  if (`${city}${travelers}${departureDate}${routePlan}${bookingVault}${today}${bookings}${worries}${notes}${imageDataUrl ? "image" : ""}`.trim().length < 8) {
    return NextResponse.json({ error: "Add a city, note, booking, or photo first." }, { status: 400 });
  }

  const [fx, weather, routeWeather] = await Promise.all([getFx(), getWeather(city), getRouteWeather(routePlan, city)]);
  const fxLine = fx ? `Live FX: 1 EUR = ${fx.rate.toFixed(3)} NZD (${fx.date}).` : "Live FX unavailable.";
  const weatherLine = weather.summary;
  const routeWeatherBlock = routeWeather.map((item) => `- ${item.summary}`).join("\n");
const message = `City/base:
${weather.city.name}

Travellers:
${travelers || "Kate, Adrian"}

Departure:
${departureDate || "2026-05-24"} (user says they leave on Sunday; current NZ date context is Thursday 21 May 2026, so Sunday is 24 May 2026)

Route / itinerary board:
${routePlan || "Not supplied"}

Booking vault:
${bookingVault || "Not supplied"}

Trip photos / moments captured:
${moments || "Not supplied"}

User question or request:
${question || "No specific question. Draft the daily travel desk."}

What is happening today:
${today || "Not supplied"}

Bookings, tickets, accommodation, or transport:
${bookings || "Not supplied"}

Worries, risks, or things to check:
${worries || "Not supplied"}

Loose travel notes:
${notes || "Not supplied"}

Live data:
${fxLine}
${weatherLine}
Route weather:
${routeWeatherBlock || "Route weather unavailable."}

Attachment:
${imageDataUrl ? "A photo or screenshot is attached. Read visible signs, menus, train boards, booking emails, tickets, maps, dates, times, addresses, and prices. Do not guess unclear details." : "No image supplied."}`;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data, error } = await service.functions.invoke("public-chat-llm", {
        body: {
          kete: "toro",
          message,
          systemPromptOverride: SYSTEM_PROMPT,
          sessionId: crypto.randomUUID(),
          imageDataUrl: imageDataUrl || undefined,
          maxTokens: 3000,
        },
      });
      if (!error && typeof data?.response === "string" && data.response.trim()) {
        return NextResponse.json({
          html: appendWatermark(sanitizeHtml(data.response)),
          weather: weatherLine,
          fx: fxLine,
          routeWeather,
        });
      }
    }
  } catch (error) {
    console.error("[hapai/voyage-italy] generation failed", error);
  }

  return NextResponse.json({
    html: appendWatermark(
      fallbackHtml({
        city: weather.city.name,
        travelers,
        departureDate,
        routePlan,
        bookingVault,
        today,
        bookings,
        worries,
        notes,
        weather: weatherLine,
        fx: fxLine,
        routeWeather,
        question,
        moments,
        imageAttached: Boolean(imageDataUrl),
      }),
    ),
    weather: weatherLine,
    fx: fxLine,
    routeWeather,
  });
}
