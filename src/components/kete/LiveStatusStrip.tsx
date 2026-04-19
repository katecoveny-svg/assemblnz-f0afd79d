import { useEffect, useState } from "react";
import { Activity, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  pack: string;
  agentCodes: string[]; // lowercase agent ids matching agent_status.agent_id
  accent?: string;
}

/**
 * Compact glass strip showing:
 *   • # of governed knowledge sources for this pack + freshness
 *   • # of agents currently online (out of N for this kete)
 *
 * Pulls live from `kb_sources` and `agent_status`.
 */
export default function LiveStatusStrip({ pack, agentCodes, accent = "#3A7D6E" }: Props) {
  const [sources, setSources] = useState<number | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Every kete inherits platform-wide ("cross") governance feeds —
      // Privacy Commissioner, NZ Gazette, Beehive, Parliament Bills etc.
      // We count pack-specific + cross sources together so the strip reflects
      // the full live brain available to that kete.
      const packsToInclude = pack === "cross" ? ["cross"] : [pack, "cross"];
      const [{ data: srcRows }, { data: agentRows }] = await Promise.all([
        supabase
          .from("kb_sources")
          .select("last_checked_at, active, agent_packs")
          .overlaps("agent_packs", packsToInclude)
          .eq("active", true),
        agentCodes.length
          ? supabase
              .from("agent_status")
              .select("agent_id, is_online")
              .in("agent_id", agentCodes.map((c) => c.toLowerCase()))
          : Promise.resolve({ data: [] as { agent_id: string; is_online: boolean }[] }),
      ]);
      if (cancelled) return;

      setSources(srcRows?.length ?? 0);
      const latest = (srcRows ?? [])
        .map((r) => r.last_checked_at)
        .filter(Boolean)
        .sort()
        .pop();
      setLastSync(latest ?? null);
      setOnline((agentRows ?? []).filter((a) => a.is_online).length);
    })();
    return () => {
      cancelled = true;
    };
  }, [pack, agentCodes.join(",")]);

  const freshness = lastSync ? formatAgo(new Date(lastSync)) : "—";

  return (
    <div
      className="inline-flex items-center gap-5 px-5 py-2.5 rounded-full text-xs font-body"
      style={{
        background: "rgba(255,255,255,0.6)",
        border: `1px solid ${accent}25`,
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 16px rgba(58,125,110,0.06), 0 0 0 1px rgba(255,255,255,0.4) inset",
        color: "#5B6374",
        fontWeight: 400,
        letterSpacing: "0.02em",
      }}
    >
      <span className="flex items-center gap-1.5">
        <Database size={12} style={{ color: accent }} />
        <span>{sources ?? "·"} live sources</span>
        <span style={{ opacity: 0.5 }}>· synced {freshness}</span>
      </span>
      <span style={{ width: 1, height: 12, background: `${accent}30` }} />
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block rounded-full"
          style={{
            width: 6,
            height: 6,
            background: (online ?? 0) > 0 ? "#3A7D6E" : "#C66B5C",
            boxShadow: (online ?? 0) > 0 ? `0 0 8px ${accent}80` : "none",
          }}
        />
        <Activity size={12} style={{ color: accent }} />
        <span>
          {online ?? "·"} / {agentCodes.length} agents online
        </span>
      </span>
    </div>
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
