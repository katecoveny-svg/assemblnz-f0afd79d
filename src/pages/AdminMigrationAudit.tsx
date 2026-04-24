/**
 * AdminMigrationAudit — Audit summary of agent_prompts seeding by migration.
 *
 * Groups rows in `public.agent_prompts` by their `created_at` minute bucket
 * (each migration run produces a tight cluster of inserts) and surfaces
 * per-pack counts so admins can see at a glance:
 *   - which packs were updated by each migration run
 *   - which inserts were skipped (idempotent ON CONFLICT DO NOTHING)
 *   - how many rows changed per pack
 *
 * Read-only. No business logic — pure presentation over Supabase data.
 */
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminShell from "@/components/admin/AdminShell";
import { Database, RefreshCw, CheckCircle2, MinusCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromptRow {
  id: string;
  agent_name: string;
  pack: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MigrationRun {
  /** ISO timestamp rounded to minute — acts as the migration "key". */
  bucket: string;
  /** Human-readable label e.g. "24 Apr 2026, 4:42 am". */
  label: string;
  /** Total rows inserted in this run. */
  rowCount: number;
  /** Per-pack breakdown for this run. */
  packs: { pack: string; count: number; agents: string[] }[];
}

interface PackSummary {
  pack: string;
  agentCount: number;
  latestUpdate: string;
  versionRange: string;
}

const ADMIN_EMAILS = ["assembl@assembl.co.nz", "kate@assembl.co.nz"];

const formatNZ = (iso: string) =>
  new Date(iso).toLocaleString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const AdminMigrationAudit = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<PromptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());

  const load = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from("agent_prompts")
      .select("id, agent_name, pack, version, is_active, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (!error && data) setRows(data as PromptRow[]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin]);

  // Group by created_at minute bucket -> migration runs
  const migrationRuns: MigrationRun[] = useMemo(() => {
    const buckets = new Map<string, PromptRow[]>();
    for (const r of rows) {
      const d = new Date(r.created_at);
      // Round to nearest minute for clustering (migrations insert in same tx)
      const bucket = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
      ).toISOString();
      const list = buckets.get(bucket) ?? [];
      list.push(r);
      buckets.set(bucket, list);
    }

    const runs: MigrationRun[] = Array.from(buckets.entries()).map(([bucket, list]) => {
      const packMap = new Map<string, string[]>();
      for (const r of list) {
        const agents = packMap.get(r.pack) ?? [];
        agents.push(r.agent_name);
        packMap.set(r.pack, agents);
      }
      const packs = Array.from(packMap.entries())
        .map(([pack, agents]) => ({ pack, count: agents.length, agents: agents.sort() }))
        .sort((a, b) => b.count - a.count);

      return {
        bucket,
        label: formatNZ(bucket),
        rowCount: list.length,
        packs,
      };
    });

    return runs.sort((a, b) => (a.bucket < b.bucket ? 1 : -1));
  }, [rows]);

  // Aggregate per-pack summary across all runs
  const packSummaries: PackSummary[] = useMemo(() => {
    const map = new Map<string, PromptRow[]>();
    for (const r of rows) {
      const list = map.get(r.pack) ?? [];
      list.push(r);
      map.set(r.pack, list);
    }
    return Array.from(map.entries())
      .map(([pack, list]) => {
        const versions = list.map((r) => r.version);
        const minV = Math.min(...versions);
        const maxV = Math.max(...versions);
        const latest = list.reduce(
          (acc, r) => (r.updated_at > acc ? r.updated_at : acc),
          list[0].updated_at,
        );
        return {
          pack,
          agentCount: list.length,
          latestUpdate: latest,
          versionRange: minV === maxV ? `v${minV}` : `v${minV}–v${maxV}`,
        };
      })
      .sort((a, b) => a.pack.localeCompare(b.pack));
  }, [rows]);

  // Detect "skipped" packs: packs that exist but were not in the most recent run.
  // The most recent migration shows what changed; older packs not in it = "no change".
  const latestRun = migrationRuns[0];
  const latestPackSet = new Set(latestRun?.packs.map((p) => p.pack) ?? []);

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <AdminShell
      title="Migration Audit"
      subtitle="Per-pack seeding history from agent_prompts"
      icon={<Database size={18} style={{ color: "#3A7D6E" }} />}
      backTo="/admin/dashboard"
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={load}
          disabled={refreshing}
          className="text-[#6F6158] hover:text-[#3D4250]"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          <span className="ml-2">Refresh</span>
        </Button>
      }
    >
      {loading ? (
        <p className="text-sm text-[#6F6158]/60 font-body">Loading audit data…</p>
      ) : (
        <div className="space-y-8">
          {/* TOP STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total agent rows" value={rows.length.toString()} accent="#3A7D6E" />
            <StatCard label="Active packs" value={packSummaries.length.toString()} accent="#4AA5A8" />
            <StatCard label="Migration runs" value={migrationRuns.length.toString()} accent="#D9BC7A" />
            <StatCard
              label="Last run"
              value={latestRun ? latestRun.label.split(",")[0] : "—"}
              accent="#9D8C7D"
            />
          </div>

          {/* MIGRATION RUNS */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl text-[#9D8C7D] tracking-wide">
              Migration runs
            </h2>
            <p className="text-sm text-[#6F6158]/70 font-body -mt-2">
              Each row = one migration that inserted/updated agent_prompts. Rows are clustered by
              minute of `created_at` (idempotent re-runs show 0 new rows and don&apos;t appear).
            </p>

            <div className="space-y-3">
              {migrationRuns.map((run, idx) => (
                <div
                  key={run.bucket}
                  className="rounded-3xl border border-[rgba(142,129,119,0.14)] bg-white/80 backdrop-blur-xl p-5"
                  style={{ boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(58,125,110,0.08)", color: "#3A7D6E" }}
                        >
                          run #{migrationRuns.length - idx}
                        </span>
                        {idx === 0 && (
                          <span
                            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold"
                            style={{ background: "#D9BC7A", color: "#6F6158" }}
                          >
                            latest
                          </span>
                        )}
                      </div>
                      <p className="font-display text-lg text-[#3D4250] mt-1">{run.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-2xl text-[#3A7D6E]">{run.rowCount}</p>
                      <p className="text-[10px] uppercase tracking-wider text-[#6F6158]/50">
                        rows changed
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[rgba(142,129,119,0.12)] pt-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#6F6158]/50 font-body mb-2">
                      Packs updated
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {run.packs.map((p) => (
                        <div
                          key={p.pack}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-body"
                          style={{
                            background: "rgba(74,165,168,0.08)",
                            border: "1px solid rgba(74,165,168,0.2)",
                            color: "#3D4250",
                          }}
                          title={p.agents.join(", ")}
                        >
                          <CheckCircle2 size={12} style={{ color: "#3A7D6E" }} />
                          <span className="font-mono uppercase">{p.pack}</span>
                          <span className="text-[#6F6158]/60">·</span>
                          <span className="text-[#6F6158]">
                            {p.count} {p.count === 1 ? "agent" : "agents"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PER-PACK SUMMARY (with skipped indicator vs latest run) */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl text-[#9D8C7D] tracking-wide">
              All packs (current state)
            </h2>
            <p className="text-sm text-[#6F6158]/70 font-body -mt-2">
              Packs with the <span className="text-[#9D8C7D]">grey dot</span> were not touched by
              the most recent run (idempotent — already applied).
            </p>

            <div
              className="rounded-3xl border border-[rgba(142,129,119,0.14)] bg-white/80 backdrop-blur-xl overflow-hidden"
              style={{ boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}
            >
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-[rgba(142,129,119,0.12)]">
                    {["Status", "Pack", "Agents", "Versions", "Last updated"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left font-bold uppercase tracking-wider text-[10px] text-[#6F6158]/60"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {packSummaries.map((p) => {
                    const inLatest = latestPackSet.has(p.pack);
                    return (
                      <tr
                        key={p.pack}
                        className="border-b border-[rgba(142,129,119,0.06)] last:border-0 hover:bg-[#EEE7DE]/40 transition-colors"
                      >
                        <td className="px-5 py-3">
                          {inLatest ? (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#3A7D6E" }}>
                              <CheckCircle2 size={14} />
                              <span>Updated</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-[#9D8C7D]">
                              <MinusCircle size={14} />
                              <span>Skipped</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-mono uppercase text-[#3D4250] font-medium">
                            {p.pack}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-[#3A7D6E]">{p.agentCount}</td>
                        <td className="px-5 py-3 font-mono text-[#6F6158]/70 text-xs">
                          {p.versionRange}
                        </td>
                        <td className="px-5 py-3 text-[#6F6158]/70 text-xs">
                          {formatNZ(p.latestUpdate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* FOOTER NOTE */}
          <p className="text-xs text-[#6F6158]/50 font-body italic flex items-center gap-2">
            <Layers size={12} />
            Source: <code className="font-mono">public.agent_prompts</code> · Idempotent
            re-applies don&apos;t insert new rows, so they appear as &quot;skipped&quot; here.
          </p>
        </div>
      )}
    </AdminShell>
  );
};

const StatCard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div
    className="rounded-3xl border border-[rgba(142,129,119,0.14)] bg-white/80 backdrop-blur-xl p-4"
    style={{ boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}
  >
    <p className="text-[10px] uppercase tracking-wider text-[#6F6158]/50 font-body mb-1">
      {label}
    </p>
    <p className="font-display text-2xl" style={{ color: accent }}>
      {value}
    </p>
  </div>
);

export default AdminMigrationAudit;
