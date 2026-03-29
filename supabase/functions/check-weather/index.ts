import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, days = 3 } = await req.json();

    if (!latitude || !longitude) {
      return new Response(JSON.stringify({ error: "latitude and longitude required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max,weather_code&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&timezone=Pacific%2FAuckland&forecast_days=${days}`;

    const res = await fetch(url);
    const data = await res.json();

    // Generate alerts
    const alerts: { type: string; message: string; severity: string; day: string }[] = [];
    const daily = data.daily;

    if (daily) {
      for (let i = 0; i < daily.time.length; i++) {
        const day = daily.time[i];
        const wind = daily.wind_speed_10m_max[i];
        const rain = daily.precipitation_sum[i];
        const tempMin = daily.temperature_2m_min[i];
        const uv = daily.uv_index_max[i];

        if (wind > 40) {
          alerts.push({ type: "wind", message: `Wind gusts up to ${wind}km/h — review crane and scaffolding operations`, severity: "high", day });
        }
        if (rain > 10) {
          alerts.push({ type: "rain", message: `${rain}mm rainfall forecast — excavation and earthworks safety review`, severity: "high", day });
        }
        if (tempMin < 5) {
          alerts.push({ type: "cold", message: `Temperature dropping to ${tempMin}°C — concrete curing concerns, frost risk`, severity: "medium", day });
        }
        if (uv > 6) {
          alerts.push({ type: "uv", message: `UV index ${uv} — sun protection required for outdoor workers`, severity: "medium", day });
        }
        if (rain < 2 && wind < 15) {
          alerts.push({ type: "spray_window", message: `Good spray conditions on ${day} — low wind, minimal rain`, severity: "info", day });
        }
      }
    }

    return new Response(JSON.stringify({
      current: data.current,
      daily: data.daily,
      alerts,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
