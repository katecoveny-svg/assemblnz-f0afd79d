import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

async function getAccessToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Google OAuth credentials not configured");

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data = await resp.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);

    // ── OAuth callback handler ──
    if (url.searchParams.has("code")) {
      const code = url.searchParams.get("code")!;
      const state = url.searchParams.get("state") || "";
      const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
      const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const redirectUri = `${supabaseUrl}/functions/v1/google-calendar`;

      // Exchange code for tokens
      const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResp.ok) {
        const err = await tokenResp.text();
        console.error("Token exchange error:", err);
        return new Response(`<html><body><script>window.opener?.postMessage({type:'google-calendar-error',error:'Token exchange failed'},'*');window.close();</script><p>Authentication failed. You can close this window.</p></body></html>`, {
          headers: { "Content-Type": "text/html" },
        });
      }

      const tokens = await tokenResp.json();
      const userId = state; // We pass user ID as state

      if (userId && tokens.refresh_token) {
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

        // Store refresh token in user_integrations
        await sb.from("user_integrations").upsert({
          user_id: userId,
          integration_name: "google_calendar",
          integration_type: "oauth",
          status: "active",
          config: { refresh_token: tokens.refresh_token, scope: tokens.scope },
          last_synced_at: new Date().toISOString(),
        }, { onConflict: "user_id,integration_name" });
      }

      return new Response(`<html><body><script>window.opener?.postMessage({type:'google-calendar-connected'},'*');window.close();</script><p>Google Calendar connected! You can close this window.</p></body></html>`, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // ── Require auth for all API operations ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // ── Get OAuth URL ──
    if (action === "get_auth_url") {
      const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
      if (!clientId) {
        return new Response(JSON.stringify({ error: "Google Calendar not configured — GOOGLE_CLIENT_ID missing" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const redirectUri = `${supabaseUrl}/functions/v1/google-calendar`;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
        access_type: "offline",
        prompt: "consent",
        state: user.id,
      }).toString();

      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Check connection status ──
    if (action === "status") {
      const { data: integration } = await supabase
        .from("user_integrations")
        .select("status, last_synced_at")
        .eq("integration_name", "google_calendar")
        .eq("user_id", user.id)
        .single();

      return new Response(JSON.stringify({
        connected: integration?.status === "active",
        lastSynced: integration?.last_synced_at,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Get refresh token ──
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminSb = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
    const { data: integration } = await adminSb
      .from("user_integrations")
      .select("config")
      .eq("user_id", user.id)
      .eq("integration_name", "google_calendar")
      .eq("status", "active")
      .single();

    if (!integration?.config?.refresh_token) {
      return new Response(JSON.stringify({ error: "Google Calendar not connected. Please connect via Integration Hub." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken(integration.config.refresh_token);

    // ── List events ──
    if (action === "list_events") {
      const { timeMin, timeMax, maxResults = 10, calendarId = "primary" } = body;
      const params = new URLSearchParams({
        orderBy: "startTime",
        singleEvents: "true",
        maxResults: String(maxResults),
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 7 * 86400000).toISOString(),
      });

      const resp = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Calendar API error [${resp.status}]: ${err}`);
      }

      const data = await resp.json();
      const events = (data.items || []).map((e: any) => ({
        id: e.id,
        summary: e.summary,
        description: e.description,
        location: e.location,
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        status: e.status,
        htmlLink: e.htmlLink,
      }));

      return new Response(JSON.stringify({ events }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Create event ──
    if (action === "create_event") {
      const { summary, description, location, startTime, endTime, calendarId = "primary", attendees } = body;

      const event: any = {
        summary,
        description,
        location,
        start: { dateTime: startTime, timeZone: "Pacific/Auckland" },
        end: { dateTime: endTime, timeZone: "Pacific/Auckland" },
      };
      if (attendees?.length) {
        event.attendees = attendees.map((email: string) => ({ email }));
      }

      const resp = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Calendar create error [${resp.status}]: ${err}`);
      }

      const created = await resp.json();
      return new Response(JSON.stringify({
        success: true,
        event: {
          id: created.id,
          summary: created.summary,
          start: created.start?.dateTime,
          end: created.end?.dateTime,
          htmlLink: created.htmlLink,
        },
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Delete event ──
    if (action === "delete_event") {
      const { eventId, calendarId = "primary" } = body;
      const resp = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return new Response(JSON.stringify({ success: resp.ok }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: get_auth_url, status, list_events, create_event, delete_event" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Google Calendar error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
