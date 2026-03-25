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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!OWM_KEY) {
      return new Response(JSON.stringify({ error: "OPENWEATHERMAP_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { lat, lon, city, units = "metric", mode = "both" }: WeatherRequest = await req.json();

    let useLat = lat, useLon = lon;

    // Geocode city name if no coordinates
    if (!useLat || !useLon) {
      if (city) {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)},NZ&limit=1&appid=${OWM_KEY}`;
        const geoResp = await fetch(geoUrl);
        const geoData = await geoResp.json();
        if (geoData?.[0]) {
          useLat = geoData[0].lat;
          useLon = geoData[0].lon;
        }
      }
      if (!useLat || !useLon) {
        useLat = -36.85; useLon = 174.76; // Default Auckland
      }
    }

    const results: any = { coordinates: { lat: useLat, lon: useLon } };

    if (mode === "current" || mode === "both") {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${useLat}&lon=${useLon}&units=${units}&appid=${OWM_KEY}`;
      const resp = await fetch(url);
      results.current = resp.ok ? await resp.json() : null;
    }

    if (mode === "forecast" || mode === "both") {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${useLat}&lon=${useLon}&units=${units}&appid=${OWM_KEY}`;
      const resp = await fetch(url);
      results.forecast = resp.ok ? await resp.json() : null;
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("iot-weather error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
