import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Database, Activity, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Homepage live-proof strip.
 * Shows real source count, last sync, agents online, and last compliance scan
 * to prove the platform is live — not a brochure.
 */
export default function HomepageProofStrip() {
  const [sources, setSources] = useState<number | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [agentsOnline, setAgentsOnline] = useState<number | null>(null);
  const [agentsTotal, setAgentsTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const [{ data: srcRows }, { data: agentRows }] = await Promise.all([
        supabase.from("kb_sources").select("last_checked_at, active").eq("active", true),
        supabase.from("agent_status").select("agent_id, is_online"),
      ]);
      if (cancelled) return;
      setSources(srcRows?.length ?? 0);
      const latest = (srcRows ?? [])
        .map((r) => r.last_checked_at)
        .filter(Boolean)
        .sort()
        .pop();
      setLastSync(latest ?? null);
      setAgentsTotal(agentRows?.length ?? 0);
      setAgentsOnline((agentRows ?? []).filter((a) => a.is_online).length);
    };

    refresh();
    const interval = window.setInterval(refresh, 90_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const isLoading = sources === null;
  const freshness = lastSync ? formatAgo(new Date(lastSync)) : "—";
  const TEAL = "#3A7D6E";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-5 py-2.5 rounded-full text-[11px] sm:text-xs"
      style={{
        background: "rgba(255,255,255,0.7)",
        border: `1px solid ${TEAL}22`,
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 16px rgba(74,165,168,0.08), 0 0 0 1px rgba(255,255,255,0.4) inset",
        color: "#5B6374",
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "0.02em",
      }}
      aria-label="Live platform status"
    >
      <span className="flex items-center gap-1.5">
        <Database size={11} style={{ color: TEAL }} />
        {isLoading ? (
          <Skel w={70} accent={TEAL} />
        ) : (
          <>
            <strong style={{ color: "#3D4250", fontWeight: 600 }}>{sources}</strong>
            <span>governance sources</span>
          </>
        )}
      </span>
      <Sep accent={TEAL} />
      <span className="flex items-center gap-1.5">
        <ShieldCheck size={11} style={{ color: TEAL }} />
        {isLoading ? <Skel w={56} accent={TEAL} /> : <span>synced {freshness}</span>}
      </span>
      <Sep accent={TEAL} />
      <span className="flex items-center gap-1.5">
        <Pulse loading={isLoading} online={(agentsOnline ?? 0) > 0} accent={TEAL} />
        <Activity size={11} style={{ color: TEAL }} />
        {isLoading ? (
          <Skel w={64} accent={TEAL} />
        ) : (
          <>
            <strong style={{ color: "#3D4250", fontWeight: 600 }}>{agentsOnline}</strong>
            <span>/ {agentsTotal} agents online</span>
          </>
        )}
      </span>
    </motion.div>
  );
}

function Skel({ w, accent }: { w: number; accent: string }) {
  return <span className="inline-block h-3 rounded-full animate-pulse" style={{ width: w, background: `${accent}20` }} />;
}
function Sep({ accent }: { accent: string }) {
  return <span style={{ width: 1, height: 12, background: `${accent}30` }} />;
}
function Pulse({ loading, online, accent }: { loading: boolean; online: boolean; accent: string }) {
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: 6,
        height: 6,
        background: loading ? `${accent}40` : online ? "#3A7D6E" : "#C66B5C",
        boxShadow: !loading && online ? `0 0 8px ${accent}80` : "none",
        animation: loading ? "pulse 1.6s ease-in-out infinite" : undefined,
      }}
    />
  );
}

function formatAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
