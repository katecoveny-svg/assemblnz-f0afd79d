import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Database, ShieldCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";

const TEAL = "#4AA5A8";
const GOLD = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const RED = "#C66B5C";

interface SourceRow { name: string; agent_packs: string[] | null; last_checked_at: string | null; active: boolean | null; }
interface AgentRow { agent_id: string; is_online: boolean; updated_at: string | null; maintenance_message: string | null; }

export default function StatusPage() {
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [lastChanges, setLastChanges] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());

  const load = async () => {
    setLoading(true);
    const [{ data: srcData }, { data: agentData }, { data: scanData }, { data: changeData }] = await Promise.all([
      supabase.from("kb_sources").select("name, agent_packs, last_checked_at, active").eq("active", true),
      supabase.from("agent_status").select("agent_id, is_online, updated_at, maintenance_message"),
      supabase.from("compliance_scan_log").select("scan_date, changes_detected").order("scan_date", { ascending: false }).limit(1),
      supabase.from("compliance_updates").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString()),
    ]);
    setSources((srcData as SourceRow[]) ?? []);
    setAgents((agentData as AgentRow[]) ?? []);
    setLastScan(scanData?.[0]?.scan_date ?? null);
    setLastChanges((changeData as any)?.length ?? 0);
    setRefreshedAt(new Date());
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onlineCount = agents.filter((a) => a.is_online).length;
  const totalAgents = agents.length;
  const allOnline = totalAgents > 0 && onlineCount === totalAgents;
  const overall = allOnline ? "All systems operational" : onlineCount === 0 ? "Major disruption" : "Partial degradation";
  const overallColor = allOnline ? POUNAMU : onlineCount === 0 ? RED : GOLD;

  return (
    <LightPageShell>
      <SEO
        title="Live system status | Assembl"
        description="Real-time platform status — governance source sync, agent uptime, last NZ regulatory compliance scan."
      />
      <BrandNav />
      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: `${overallColor}14`, border: `1px solid ${overallColor}40` }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: overallColor, boxShadow: `0 0 10px ${overallColor}` }} />
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: overallColor, fontFamily: "'JetBrains Mono', monospace" }}>{overall}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light text-foreground mb-3">Live system status</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">Real-time view of governance sync, agent uptime, and the daily NZ regulatory scan.</p>
          <div className="mt-4 flex items-center justify-center gap-3 text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#5B6374" }}>
            <span>Refreshed {timeAgo(refreshedAt)}</span>
            <button onClick={load} className="inline-flex items-center gap-1 hover:text-foreground transition-colors" disabled={loading}>
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> refresh
            </button>
          </div>
        </motion.div>

        {/* Top metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <MetricCard icon={Database} label="Governance sources" value={sources.length} sub={lastSyncLabel(sources)} loading={loading} accent={TEAL} />
          <MetricCard icon={Activity} label="Agents online" value={`${onlineCount}/${totalAgents}`} sub={onlineCount === totalAgents ? "All operational" : `${totalAgents - onlineCount} degraded`} loading={loading} accent={onlineCount === totalAgents ? POUNAMU : GOLD} />
          <MetricCard icon={ShieldCheck} label="Last compliance scan" value={lastScan ? new Date(lastScan).toLocaleDateString("en-NZ", { day: "numeric", month: "short" }) : "—"} sub={`${lastChanges} updates this week`} loading={loading} accent={GOLD} />
        </div>

        {/* Agent status table */}
        <Section title="Agent uptime" subtitle={`${onlineCount} of ${totalAgents} specialist agents online`}>
          {loading ? (
            <SkeletonRows />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {agents.sort((a, b) => a.agent_id.localeCompare(b.agent_id)).map((a) => (
                <div key={a.agent_id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.04)" }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: a.is_online ? POUNAMU : RED, boxShadow: a.is_online ? `0 0 6px ${POUNAMU}80` : "none" }} />
                  <span className="text-xs font-medium truncate" style={{ color: "#3D4250", fontFamily: "'JetBrains Mono', monospace" }}>{a.agent_id}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Sources list */}
        <Section title="Governance source sync" subtitle="NZ regulatory and statutory feeds monitored daily">
          {loading ? (
            <SkeletonRows />
          ) : (
            <div className="space-y-1.5">
              {sources.sort((a, b) => (a.name || "").localeCompare(b.name || "")).map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={13} style={{ color: POUNAMU, flexShrink: 0 }} />
                    <span className="text-xs sm:text-sm truncate" style={{ color: "#3D4250" }}>{s.name}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs whitespace-nowrap" style={{ color: "#8B92A0", fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.last_checked_at ? timeAgo(new Date(s.last_checked_at)) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <p className="text-center text-[11px] text-muted-foreground mt-10" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Status updates every 60 seconds. Daily compliance scan runs 5am NZST.
        </p>
      </main>
      <BrandFooter />
    </LightPageShell>
  );
}

function MetricCard({ icon: Icon, label, value, sub, loading, accent }: { icon: any; label: string; value: string | number; sub: string; loading: boolean; accent: string }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.75)", border: `1px solid ${accent}22`, backdropFilter: "blur(20px)", boxShadow: `0 8px 24px -8px ${accent}1f` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color: accent }} />
        <span className="text-[11px] uppercase tracking-wider" style={{ color: "#5B6374", fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
      </div>
      {loading ? (
        <div className="h-8 w-20 rounded-md animate-pulse" style={{ background: `${accent}20` }} />
      ) : (
        <div className="text-3xl font-light" style={{ color: "#3D4250" }}>{value}</div>
      )}
      <div className="text-[11px] mt-1" style={{ color: "#8B92A0" }}>{sub}</div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2 className="text-lg font-medium" style={{ color: "#3D4250" }}>{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "rgba(74,165,168,0.08)" }} />
      ))}
    </div>
  );
}

function lastSyncLabel(sources: SourceRow[]) {
  const latest = sources.map((s) => s.last_checked_at).filter(Boolean).sort().pop();
  return latest ? `Last sync ${timeAgo(new Date(latest))}` : "Awaiting sync";
}

function timeAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
