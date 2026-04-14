import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OWM_KEY = Deno.env.get("OPENWEATHERMAP_API_KEY");

interface WeatherRequest {
  lat?: number;
  lon?: number;
  city?: string;
  units?: string;
  mode?: "current" | "forecast" | "both";
}

const FALLBACK_WEATHER = {
  fallback: true,
  summary: "Weather data temporarily unavailable — using cached NZ defaults",
  current: {
    weather: [{ description: "data unavailable" }],
    main: { temp: 15, feels_like: 14, humidity: 70, pressure: 1013 },
    wind: { speed: 5, deg: 220 },
    visibility: 10000,
  },
};

async function safeFetch(url: string): Promise<{ ok: boolean; data: any }> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      console.error(`OpenWeatherMap API error: ${resp.status} ${text}`);
      return { ok: false, data: null };
    }
    return { ok: true, data: await resp.json() };
  } catch (err) {
    console.error("OpenWeatherMap fetch failed:", err);
    return { ok: false, data: null };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!OWM_KEY) {
      console.warn("[iot-weather] OPENWEATHERMAP_API_KEY not configured — returning fallback");
      return new Response(JSON.stringify({ ...FALLBACK_WEATHER, error: "API_KEY_MISSING" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { lat, lon, city, units = "metric", mode = "both" }: WeatherRequest = await req.json();

    let useLat = lat, useLon = lon;

    // Geocode city name if no coordinates
    if (!useLat || !useLon) {
      if (city) {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)},NZ&limit=1&appid=${OWM_KEY}`;
        const geo = await safeFetch(geoUrl);
        if (geo.ok && geo.data?.[0]) {
          useLat = geo.data[0].lat;
          useLon = geo.data[0].lon;
        }
      }
      if (!useLat || !useLon) {
        useLat = -36.85; useLon = 174.76; // Default Auckland
      }
    }

    const results: any = { coordinates: { lat: useLat, lon: useLon }, fallback: false };

    if (mode === "current" || mode === "both") {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${useLat}&lon=${useLon}&units=${units}&appid=${OWM_KEY}`;
      const resp = await safeFetch(url);
      if (resp.ok) {
        results.current = resp.data;
      } else {
        results.current = FALLBACK_WEATHER.current;
        results.fallback = true;
      }
    }

    if (mode === "forecast" || mode === "both") {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${useLat}&lon=${useLon}&units=${units}&appid=${OWM_KEY}`;
      const resp = await safeFetch(url);
      if (resp.ok) {
        results.forecast = resp.data;
      } else {
        results.forecast = null;
        results.fallback = true;
      }
    }

    // Generate formatted summary
    if (results.current) {
      const c = results.current;
      const windKts = Math.round((c.wind?.speed || 0) * 1.944);
      results.summary = [
        `Weather: ${c.weather?.[0]?.description || "Unknown"}`,
        `Temp: ${c.main?.temp}C (feels ${c.main?.feels_like}C)`,
        `Wind: ${windKts} kts ${c.wind?.deg || 0} deg`,
        `Humidity: ${c.main?.humidity}%`,
        `Pressure: ${c.main?.pressure} hPa`,
        `Visibility: ${(c.visibility || 0) / 1000} km`,
      ].join(" | ");
    }

    return new Response(JSON.stringify(results), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("iot-weather error:", e);
    // Return 200 with fallback instead of 500
    return new Response(JSON.stringify({
      ...FALLBACK_WEATHER,
      error: e instanceof Error ? e.message : "Unknown error",
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
