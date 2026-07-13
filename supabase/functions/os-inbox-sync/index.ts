// ═══════════════════════════════════════════════════════════════════════
// os-inbox-sync — per-tenant inbox ingestion (Agentic OS Phase 4).
//
// Generalises family-inbox-sync to business tenants: for each row in
// os_inbox_tokens, mint an access token, read recent inbox messages,
// dedupe against os_inbox_seen, and hand each NEW customer email to the
// public enquiry endpoint for its tenant — so the existing operating loop
// (task → genome-grounded draft → human approval → evidence) runs
// unchanged. This function never replies, sends, pays or RSVPs.
//
// DRY MODE: with no os_inbox_tokens rows it reads nothing and records a
// dry run — safe to schedule ahead of any OAuth connection.
// ═══════════════════════════════════════════════════════════════════════
import { createClient } from "jsr:@supabase/supabase-js@2";

const SITE_ORIGIN = Deno.env.get("OS_SITE_ORIGIN") ?? "https://www.assembl.co.nz";
const MAX_PER_RUN = 5; // per tenant per run — ingestion stays calm

type TokenRow = { tenant: string; provider: "gmail" | "outlook"; refresh_token: string };
type InboundEmail = { id: string; from: string; fromEmail: string; subject: string; snippet: string };

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function gmailAccessToken(refreshToken: string): Promise<string | null> {
  const id = Deno.env.get("GMAIL_CLIENT_ID");
  const secret = Deno.env.get("GMAIL_CLIENT_SECRET");
  if (!id || !secret) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: id, client_secret: secret,
      refresh_token: refreshToken, grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.access_token ?? null;
}

async function outlookAccessToken(refreshToken: string): Promise<string | null> {
  const id = Deno.env.get("OUTLOOK_CLIENT_ID");
  const secret = Deno.env.get("OUTLOOK_CLIENT_SECRET");
  if (!id || !secret) return null;
  const res = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: id, client_secret: secret,
      refresh_token: refreshToken, grant_type: "refresh_token",
      scope: "https://graph.microsoft.com/Mail.Read offline_access",
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.access_token ?? null;
}

function parseAddress(raw: string): { name: string; email: string } {
  const m = /^(.*?)\s*<([^>]+)>/.exec(raw);
  if (m) return { name: m[1].replace(/"/g, "").trim() || m[2], email: m[2].trim() };
  return { name: raw.trim(), email: raw.trim() };
}

async function readGmail(token: string): Promise<InboundEmail[]> {
  const list = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=newer_than:1d%20category:primary&maxResults=10",
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!list.ok) return [];
  const { messages } = await list.json();
  const out: InboundEmail[] = [];
  for (const m of (messages ?? []).slice(0, 10)) {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    if (!res.ok) continue;
    const msg = await res.json();
    const headers: Array<{ name: string; value: string }> = msg.payload?.headers ?? [];
    const from = headers.find((h) => h.name === "From")?.value ?? "";
    const subject = headers.find((h) => h.name === "Subject")?.value ?? "(no subject)";
    const addr = parseAddress(from);
    out.push({ id: msg.id, from: addr.name, fromEmail: addr.email, subject, snippet: msg.snippet ?? "" });
  }
  return out;
}

async function readOutlook(token: string): Promise<InboundEmail[]> {
  const res = await fetch(
    "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=10&$select=id,subject,bodyPreview,from,receivedDateTime&$orderby=receivedDateTime%20desc",
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return [];
  const { value } = await res.json();
  return (value ?? []).map((m: Record<string, unknown>) => {
    const from = m.from as { emailAddress?: { name?: string; address?: string } } | undefined;
    return {
      id: String(m.id),
      from: from?.emailAddress?.name ?? from?.emailAddress?.address ?? "Unknown",
      fromEmail: from?.emailAddress?.address ?? "",
      subject: String(m.subject ?? "(no subject)"),
      snippet: String(m.bodyPreview ?? ""),
    };
  });
}

Deno.serve(async () => {
  const supabase = serviceClient();
  if (!supabase) {
    return new Response(JSON.stringify({ ok: false, error: "no service credentials" }), { status: 500 });
  }

  const { data: tokens } = await supabase.from("os_inbox_tokens").select("tenant, provider, refresh_token");
  if (!tokens || tokens.length === 0) {
    // DRY MODE — nothing connected yet; record the heartbeat honestly.
    await supabase.from("os_inbox_runs").insert({ dry_run: true, scanned: 0, created_tasks: 0 });
    return new Response(JSON.stringify({ ok: true, dryRun: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  const results: Array<{ tenant: string; scanned: number; created: number }> = [];
  for (const row of tokens as TokenRow[]) {
    let scanned = 0;
    let created = 0;
    let error: string | null = null;
    try {
      const access = row.provider === "gmail"
        ? await gmailAccessToken(row.refresh_token)
        : await outlookAccessToken(row.refresh_token);
      if (!access) throw new Error("could not mint access token");
      const emails = row.provider === "gmail" ? await readGmail(access) : await readOutlook(access);
      scanned = emails.length;

      for (const email of emails) {
        if (created >= MAX_PER_RUN) break;
        if (!email.fromEmail || !email.snippet) continue;
        const { data: seen } = await supabase
          .from("os_inbox_seen").select("message_id").eq("message_id", email.id).maybeSingle();
        if (seen) continue;

        // The same front door a website visitor uses — the whole operating
        // loop (task, draft, approval, evidence) runs from here.
        const res = await fetch(`${SITE_ORIGIN}/api/living-site/enquiry`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            tenant: row.tenant,
            name: email.from.slice(0, 120),
            email: email.fromEmail.slice(0, 200),
            dog: `email · ${email.subject}`.slice(0, 200),
            message: email.snippet.slice(0, 2000),
          }),
        });
        await supabase.from("os_inbox_seen").insert({
          message_id: email.id, tenant: row.tenant, provider: row.provider,
          subject: email.subject.slice(0, 200),
        });
        if (res.ok) created++;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
    await supabase.from("os_inbox_runs").insert({
      tenant: row.tenant, provider: row.provider, dry_run: false,
      scanned, created_tasks: created, error,
    });
    results.push({ tenant: row.tenant, scanned, created });
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { "content-type": "application/json" },
  });
});
