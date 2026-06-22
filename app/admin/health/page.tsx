/**
 * Health dashboard — a private, server-rendered view of the last 24h of
 * health-check-cron runs (public.health_check_logs).
 *
 * health_check_logs is service-role only (RLS on, no public policies). This page
 * runs ON THE SERVER with the SERVICE ROLE key (never sent to the browser) and is
 * gated by HEALTH_CHECK_API_KEY in the URL — the same secret the cron uses to
 * invoke the function manually.
 *
 * Env (Vercel → Settings → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL    = https://wurwcrgxjjwqdaxqceey.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY   = <service role key>   ← server-only
 *   HEALTH_CHECK_API_KEY        = <shared health secret>
 *
 * Open:  https://www.assembl.co.nz/admin/health?key=YOUR_HEALTH_CHECK_API_KEY
 */

export const dynamic = "force-dynamic";

type CheckResult = {
  name: string;
  status: "ok" | "error";
  response_time_ms: number;
  error_message?: string;
  category: "critical" | "high" | "medium";
};

type HealthLog = {
  id: string;
  created_at: string;
  overall_status: "ok" | "degraded" | "down";
  checks: CheckResult[];
  failures: number;
  brevo_ip_blocked: boolean;
  alerted: boolean;
  webhook_delivered: boolean;
  email_delivered: boolean;
  duration_ms: number | null;
  run_source: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const HEALTH_KEY = process.env.HEALTH_CHECK_API_KEY ?? "";

async function fetchLogs(): Promise<HealthLog[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/health_check_logs?select=*&created_at=gte.${since}&order=created_at.desc`,
    {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`Could not load health logs (${res.status})`);
  return res.json();
}

const nzTime = (iso: string) =>
  new Date(iso).toLocaleString("en-NZ", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

const STATUS_COLOR: Record<string, string> = {
  ok: "#3A7D6E",
  degraded: "#C98A1B",
  down: "#B5533A",
};

export default async function HealthPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }> | { key?: string };
}) {
  const params = await searchParams;

  if (!HEALTH_KEY || params.key !== HEALTH_KEY) {
    return (
      <main style={styles.page}>
        <p style={styles.muted}>Not authorised.</p>
      </main>
    );
  }

  let logs: HealthLog[] = [];
  let error = "";
  try {
    logs = await fetchLogs();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  const latest = logs[0];
  const total = logs.length;
  const okRuns = logs.filter((l) => l.overall_status === "ok").length;
  const uptime = total > 0 ? Math.round((okRuns / total) * 1000) / 10 : null;
  const brevoBlocked = !!latest?.brevo_ip_blocked;

  // Oldest → newest for the timeline strip.
  const timeline = [...logs].reverse();

  return (
    <main style={styles.page}>
      <h1 style={styles.h1}>Pipeline health</h1>
      <p style={styles.muted}>
        Last 24h · {total} runs{uptime !== null ? ` · ${uptime}% all-green` : ""}
        {latest ? ` · last run ${nzTime(latest.created_at)}` : ""}
      </p>

      {error && <p style={styles.error}>{error}</p>}

      {brevoBlocked && (
        <div style={styles.ipBanner}>
          ⛔ <strong>Brevo IP blocked.</strong> The sending IP is not on Brevo&apos;s authorised-IP
          list, so email alerts are NOT going out. Add this server&apos;s egress IP at Brevo →
          Senders &amp; IPs → Authorised IPs.
        </div>
      )}

      {!error && !latest && <p style={styles.muted}>No health runs in the last 24h yet.</p>}

      {latest && (
        <>
          {/* Current per-check status grid */}
          <h2 style={styles.h2}>
            Current status{" "}
            <span style={{ ...styles.pill, background: STATUS_COLOR[latest.overall_status] }}>
              {latest.overall_status.toUpperCase()}
            </span>
          </h2>
          <div style={styles.grid}>
            {latest.checks.map((c) => (
              <div
                key={c.name}
                style={{
                  ...styles.card,
                  borderLeft: `4px solid ${c.status === "ok" ? STATUS_COLOR.ok : STATUS_COLOR.down}`,
                }}
              >
                <div style={styles.cardName}>{c.name}</div>
                <div style={{ ...styles.cardStatus, color: c.status === "ok" ? STATUS_COLOR.ok : STATUS_COLOR.down }}>
                  {c.status === "ok" ? "OK" : "FAIL"} · {c.response_time_ms}ms
                </div>
                {c.error_message && <div style={styles.cardErr}>{c.error_message}</div>}
              </div>
            ))}
          </div>

          {/* 24h timeline strip — one square per run, newest on the right */}
          <h2 style={styles.h2}>Last 24h</h2>
          <div style={styles.timeline}>
            {timeline.map((l) => (
              <span
                key={l.id}
                title={`${nzTime(l.created_at)} — ${l.overall_status}${l.failures ? ` (${l.failures} fail)` : ""}`}
                style={{ ...styles.tick, background: STATUS_COLOR[l.overall_status] }}
              />
            ))}
          </div>

          {/* Recent failing runs */}
          <h2 style={styles.h2}>Recent runs</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["When", "Status", "Fails", "Brevo IP", "Webhook", "Email", "Duration"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 30).map((l) => (
                  <tr key={l.id} style={styles.tr}>
                    <td style={styles.td}>{nzTime(l.created_at)}</td>
                    <td style={{ ...styles.td, color: STATUS_COLOR[l.overall_status], fontWeight: 600 }}>
                      {l.overall_status}
                    </td>
                    <td style={styles.td}>{l.failures || "—"}</td>
                    <td style={{ ...styles.td, color: l.brevo_ip_blocked ? STATUS_COLOR.down : "#6B6B66" }}>
                      {l.brevo_ip_blocked ? "BLOCKED" : "ok"}
                    </td>
                    <td style={styles.td}>{l.alerted ? (l.webhook_delivered ? "sent" : "—") : "n/a"}</td>
                    <td style={styles.td}>{l.alerted ? (l.email_delivered ? "sent" : "—") : "n/a"}</td>
                    <td style={styles.td}>{l.duration_ms ?? "—"}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F4F1EA",
    padding: "40px 24px",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: "#1F1F1D",
  },
  h1: { fontFamily: "var(--font-display), Georgia, serif", fontSize: 30, fontWeight: 600, margin: "0 0 4px" },
  h2: { fontSize: 16, fontWeight: 600, margin: "28px 0 12px", display: "flex", alignItems: "center", gap: 10 },
  muted: { color: "#6B6B66", fontSize: 14, margin: "0 0 20px" },
  error: { color: "#B5533A", fontSize: 14 },
  pill: { color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, letterSpacing: 0.5 },
  ipBanner: {
    background: "#FBEAE5", border: "1px solid #E5B7AB", color: "#7A2E1C",
    borderRadius: 10, padding: "14px 16px", fontSize: 14, margin: "8px 0 4px",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 },
  card: { background: "#fff", border: "1px solid #E5E0D6", borderRadius: 10, padding: "14px 16px" },
  cardName: { fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 600, marginBottom: 6 },
  cardStatus: { fontSize: 13, fontWeight: 600 },
  cardErr: { color: "#B5533A", fontSize: 12, marginTop: 8, lineHeight: 1.4, wordBreak: "break-word" },
  timeline: { display: "flex", flexWrap: "wrap", gap: 3 },
  tick: { width: 10, height: 18, borderRadius: 2, display: "inline-block" },
  tableWrap: { overflowX: "auto", background: "#fff", border: "1px solid #E5E0D6", borderRadius: 12 },
  table: { borderCollapse: "collapse", width: "100%", fontSize: 14 },
  th: {
    textAlign: "left", padding: "12px 14px", borderBottom: "1px solid #E5E0D6",
    color: "#6B6B66", fontWeight: 600, whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #F0ECE2" },
  td: { padding: "11px 14px", verticalAlign: "top", whiteSpace: "nowrap" },
};
