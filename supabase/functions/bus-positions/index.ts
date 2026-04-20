import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AT_API_KEY = Deno.env.get('AT_API_KEY');
    if (!AT_API_KEY) {
      return new Response(JSON.stringify({ error: 'AT_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Support both GET query params and POST body
    let routeIds: string | null = null;
    const url = new URL(req.url);
    routeIds = url.searchParams.get('route_ids');
    
    if (!routeIds && req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.route_ids) {
          routeIds = Array.isArray(body.route_ids) ? body.route_ids.join(',') : body.route_ids;
        }
      } catch (_) {}
    }

    // Call Auckland Transport GTFS-realtime vehicle positions
    const atUrl = 'https://api.at.govt.nz/realtime/legacy/vehiclelocations';
    const atRes = await fetch(atUrl, {
      headers: { 'Ocp-Apim-Subscription-Key': AT_API_KEY },
    });

    if (!atRes.ok) {
      const errText = await atRes.text();
      console.error('AT API error:', atRes.status, errText);
      return new Response(JSON.stringify({ error: 'AT API request failed', status: atRes.status }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await atRes.json();
    const entities = data?.response?.entity || data?.entity || [];

    // Map to clean vehicle positions
    let vehicles = entities
      .filter((e: any) => e?.vehicle?.position)
      .map((e: any) => {
        const v = e.vehicle;
        return {
          vehicle_id: v.vehicle?.id || e.id,
          route_id: v.trip?.route_id || '',
          trip_id: v.trip?.trip_id || '',
          latitude: v.position.latitude,
          longitude: v.position.longitude,
          bearing: v.position.bearing ?? null,
          speed: v.position.speed ?? null,
          timestamp: v.timestamp || null,
          occupancy_status: v.occupancy_status ?? null,
        };
      });

    // Filter by route IDs if provided
    if (routeIds) {
      const ids = routeIds.split(',').map(id => id.trim());
      vehicles = vehicles.filter((v: any) => ids.includes(v.route_id));
    }

    return new Response(JSON.stringify({ vehicles, count: vehicles.length, timestamp: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Bus positions error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
