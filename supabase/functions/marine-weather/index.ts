import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// MetService marine forecast regions
const REGIONS: Record<string, { name: string; url: string }> = {
  auckland: { name: "Auckland / Hauraki Gulf", url: "https://www.metservice.com/marine/regions/auckland-north" },
  northland: { name: "Northland", url: "https://www.metservice.com/marine/regions/northland" },
  coromandel: { name: "Coromandel", url: "https://www.metservice.com/marine/regions/coromandel" },
  bay_of_plenty: { name: "Bay of Plenty", url: "https://www.metservice.com/marine/regions/bay-of-plenty" },
  waikato: { name: "Waikato / West Coast", url: "https://www.metservice.com/marine/regions/waikato" },
  taranaki: { name: "Taranaki", url: "https://www.metservice.com/marine/regions/taranaki" },
  wellington: { name: "Wellington / Cook Strait", url: "https://www.metservice.com/marine/regions/wellington" },
  marlborough: { name: "Marlborough Sounds", url: "https://www.metservice.com/marine/regions/marlborough" },
  canterbury: { name: "Canterbury", url: "https://www.metservice.com/marine/regions/canterbury" },
  otago: { name: "Otago", url: "https://www.metservice.com/marine/regions/otago" },
  southland: { name: "Southland / Fiordland", url: "https://www.metservice.com/marine/regions/southland" },
  east_cape: { name: "East Cape / Gisborne", url: "https://www.metservice.com/marine/regions/east-cape" },
  hawkes_bay: { name: "Hawke's Bay", url: "https://www.metservice.com/marine/regions/hawkes-bay" },
  west_coast: { name: "West Coast (SI)", url: "https://www.metservice.com/marine/regions/west-coast" },
};

async function fetchMetServicePage(url: string): Promise<string> {
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AssemblBot/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!resp.ok) return "";
    return await resp.text();
  } catch {
    return "";
  }
}

function extractMarineData(html: string): string {
  if (!html) return "";
  
  // Extract text content from forecast sections
  const sections: string[] = [];
  
  // Extract forecast text - look for common MetService patterns
  const forecastMatches = html.match(/<div[^>]*class="[^"]*forecast[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) || [];
  for (const match of forecastMatches) {
    const text = match.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length > 20) sections.push(text);
  }
  
  // Extract any paragraph content with weather info
  const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  for (const match of pMatches) {
    const text = match.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length > 30 && (
      /wind|swell|sea|wave|knot|rain|cloud|fine|gale|storm|temp|press|tide/i.test(text)
    )) {
      sections.push(text);
    }
  }
  
  // Extract table data (tides, etc)
  const tdMatches = html.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
  const tableData: string[] = [];
  for (const match of tdMatches) {
    const text = match.replace(/<[^>]+>/g, "").trim();
    if (text && text.length < 100) tableData.push(text);
  }
  if (tableData.length > 0) {
    sections.push("Data points: " + tableData.slice(0, 40).join(" | "));
  }
  
  // Also extract any JSON-LD or script data
  const scriptMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const match of scriptMatches) {
    const json = match.replace(/<[^>]+>/g, "").trim();
    if (json.length > 10 && json.length < 5000) {
      try {
        const parsed = JSON.parse(json);
        sections.push("Structured data: " + JSON.stringify(parsed).substring(0, 500));
      } catch { /* skip */ }
    }
  }
  
  return sections.slice(0, 20).join("\n\n");
}

// Fetch Open-Meteo marine/weather data for a specific location
async function fetchOpenMeteoMarine(lat: number, lon: number): Promise<any> {
  try {
    // Weather forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,pressure_msl,cloud_cover&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,visibility,pressure_msl&forecast_days=3&timezone=Pacific%2FAuckland`;
    const weatherResp = await fetch(weatherUrl);
    const weather = weatherResp.ok ? await weatherResp.json() : null;

    // Marine forecast (swell, wave)
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,swell_wave_direction,swell_wave_period&hourly=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,swell_wave_direction,swell_wave_period&forecast_days=3&timezone=Pacific%2FAuckland`;
    const marineResp = await fetch(marineUrl);
    const marine = marineResp.ok ? await marineResp.json() : null;

    return { weather, marine };
  } catch (e) {
    console.error("Open-Meteo fetch error:", e);
    return { weather: null, marine: null };
  }
}

// NZ region coordinates for marine forecasts
const REGION_COORDS: Record<string, { lat: number; lon: number }> = {
  auckland: { lat: -36.85, lon: 174.76 },
  northland: { lat: -35.73, lon: 174.32 },
  coromandel: { lat: -36.76, lon: 175.50 },
  bay_of_plenty: { lat: -37.68, lon: 176.17 },
  waikato: { lat: -37.78, lon: 175.28 },
  taranaki: { lat: -39.06, lon: 174.08 },
  wellington: { lat: -41.29, lon: 174.78 },
  marlborough: { lat: -41.29, lon: 174.00 },
  canterbury: { lat: -43.53, lon: 172.64 },
  otago: { lat: -45.87, lon: 170.50 },
  southland: { lat: -46.41, lon: 168.35 },
  east_cape: { lat: -38.41, lon: 178.04 },
  hawkes_bay: { lat: -39.49, lon: 176.91 },
  west_coast: { lat: -42.45, lon: 171.21 },
};

function windDirectionName(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function weatherCodeDesc(code: number): string {
  const codes: Record<number, string> = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
    55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 80: "Slight rain showers",
    81: "Moderate rain showers", 82: "Violent rain showers", 95: "Thunderstorm",
    96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
  };
  return codes[code] || "Unknown";
}

function formatMarineWeather(data: any, regionName: string): string {
  const lines: string[] = [];
  lines.push(`## 🌊 Live Marine Weather — ${regionName}`);
  lines.push(`*Updated: ${new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}*\n`);

  if (data.weather?.current) {
    const c = data.weather.current;
    lines.push(`### Current Conditions`);
    lines.push(`- **Weather:** ${weatherCodeDesc(c.weather_code)}`);
    lines.push(`- **Temperature:** ${c.temperature_2m}°C`);
    lines.push(`- **Wind:** ${c.wind_speed_10m} km/h ${windDirectionName(c.wind_direction_10m)} (gusts ${c.wind_gusts_10m} km/h)`);
    lines.push(`- **Pressure:** ${c.pressure_msl} hPa`);
    lines.push(`- **Cloud Cover:** ${c.cloud_cover}%`);
    lines.push(`- **Humidity:** ${c.relative_humidity_2m}%`);
    
    // Wind assessment for boating
    const windKnots = Math.round(c.wind_speed_10m * 0.539957);
    const gustKnots = Math.round(c.wind_gusts_10m * 0.539957);
    lines.push(`- **Wind (knots):** ${windKnots} kts (gusts ${gustKnots} kts)`);
    
    if (gustKnots > 33) {
      lines.push(`\n⚠️ **GALE WARNING CONDITIONS** — Wind gusts exceeding 33 knots. NOT recommended for small craft.`);
    } else if (gustKnots > 25) {
      lines.push(`\n⚠️ **STRONG WIND ADVISORY** — Gusts over 25 knots. Small craft should exercise extreme caution.`);
    } else if (windKnots > 15) {
      lines.push(`\n⚡ **Moderate winds** — Suitable for experienced boaters. Keep an eye on conditions.`);
    } else {
      lines.push(`\n✅ **Light winds** — Good conditions for boating.`);
    }
  }

  if (data.marine?.current) {
    const m = data.marine.current;
    lines.push(`\n### Sea State`);
    if (m.wave_height != null) lines.push(`- **Wave Height:** ${m.wave_height}m`);
    if (m.wave_period != null) lines.push(`- **Wave Period:** ${m.wave_period}s`);
    if (m.wave_direction != null) lines.push(`- **Wave Direction:** ${windDirectionName(m.wave_direction)}`);
    if (m.swell_wave_height != null) lines.push(`- **Swell Height:** ${m.swell_wave_height}m`);
    if (m.swell_wave_period != null) lines.push(`- **Swell Period:** ${m.swell_wave_period}s`);
    if (m.swell_wave_direction != null) lines.push(`- **Swell Direction:** ${windDirectionName(m.swell_wave_direction)}`);
    if (m.wind_wave_height != null) lines.push(`- **Wind Waves:** ${m.wind_wave_height}m`);
    
    // Sea state assessment
    const waveH = m.wave_height ?? 0;
    if (waveH > 3) {
      lines.push(`\n⚠️ **ROUGH SEAS** — Waves over 3m. Stay ashore unless in a large, seaworthy vessel.`);
    } else if (waveH > 2) {
      lines.push(`\n⚡ **Moderate seas** — Waves 2-3m. Experienced boaters only.`);
    } else if (waveH > 1) {
      lines.push(`\n✅ **Slight seas** — Waves 1-2m. Generally suitable for recreational boating.`);
    } else {
      lines.push(`\n✅ **Calm seas** — Waves under 1m. Great conditions for boating.`);
    }
  }

  // 24-hour outlook from hourly data
  if (data.weather?.hourly) {
    const h = data.weather.hourly;
    lines.push(`\n### 24-Hour Wind Forecast`);
    const now = new Date();
    for (let i = 0; i < Math.min(h.time?.length || 0, 24); i += 3) {
      const t = new Date(h.time[i]);
      if (t < now) continue;
      const windKts = Math.round((h.wind_speed_10m?.[i] || 0) * 0.539957);
      const gustKts = Math.round((h.wind_gusts_10m?.[i] || 0) * 0.539957);
      const dir = windDirectionName(h.wind_direction_10m?.[i] || 0);
      const timeStr = t.toLocaleTimeString("en-NZ", { timeZone: "Pacific/Auckland", hour: "2-digit", minute: "2-digit" });
      lines.push(`- **${timeStr}:** ${windKts} kts ${dir} (gusts ${gustKts} kts) — ${weatherCodeDesc(h.weather_code?.[i] || 0)}`);
    }
  }

  if (data.marine?.hourly) {
    const h = data.marine.hourly;
    lines.push(`\n### 24-Hour Sea Forecast`);
    const now = new Date();
    for (let i = 0; i < Math.min(h.time?.length || 0, 24); i += 3) {
      const t = new Date(h.time[i]);
      if (t < now) continue;
      const timeStr = t.toLocaleTimeString("en-NZ", { timeZone: "Pacific/Auckland", hour: "2-digit", minute: "2-digit" });
      const wh = h.wave_height?.[i] ?? "?";
      const sh = h.swell_wave_height?.[i] ?? "?";
      lines.push(`- **${timeStr}:** Waves ${wh}m, Swell ${sh}m`);
    }
  }

  lines.push(`\n---`);
  lines.push(`*Data from Open-Meteo. For official NZ marine forecasts, check [MetService Marine](https://www.metservice.com/marine). Always check conditions before departure.*`);
  lines.push(`*In an emergency, call Coastguard on **\\*500** or VHF Channel 16.*`);

  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { region, lat, lon } = await req.json();
    
    let useLat: number, useLon: number, regionName: string;
    
    if (lat && lon) {
      useLat = lat;
      useLon = lon;
      regionName = "Custom Location";
    } else {
      const key = (region || "auckland").toLowerCase().replace(/\s+/g, "_");
      const coords = REGION_COORDS[key] || REGION_COORDS.auckland;
      const regionInfo = REGIONS[key] || REGIONS.auckland;
      useLat = coords.lat;
      useLon = coords.lon;
      regionName = regionInfo.name;
    }
    
    const data = await fetchOpenMeteoMarine(useLat, useLon);
    const formatted = formatMarineWeather(data, regionName);
    
    return new Response(JSON.stringify({ 
      forecast: formatted,
      raw: data,
      region: regionName,
      coordinates: { lat: useLat, lon: useLon },
      regions: Object.entries(REGIONS).map(([k, v]) => ({ id: k, name: v.name })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Marine weather error:", e);
    return new Response(JSON.stringify({ error: "Failed to fetch marine weather" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
