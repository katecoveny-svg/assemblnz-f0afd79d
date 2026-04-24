import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Activity,
  Search,
  Users,
} from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import { KETE_CONFIG, type KeteDefinition } from "@/components/kete/KeteConfig";
import { allAgents } from "@/data/agents";
import { INDUSTRY_KETE } from "@/assets/brand/kete";
import { supabase } from "@/integrations/supabase/client";

/**
 * /dashboards — single hub that lists every kete with live agent-status
 * counts, the specialist agent roster, and a direct link into each kete's
 * own dashboard. Source of truth: KETE_CONFIG + allAgents + agent_status.
 */

const PEARL = {
  bg: "#FBFAF7",
  ink: "#0E1513",
  pounamu: "#1F4D47",
  taupeDeep: "#6F6158",
  muted: "#8B8479",
  opal: "#E8EEEC",
  softGold: "#D9BC7A",
} as const;

// Same alias map AdminKeteOverview uses, so counts match across the platform.
const PACK_ALIASES: Record<string, string[]> = {
  manaaki: ["manaaki"],
  waihanga: ["waihanga"],
  auaha: ["auaha"],
  arataki: ["arataki", "waka"],
  pikau: ["pikau"],
  hoko: ["hoko", "pakihi"],
  ako: ["ako", "hauora"],
  toro: ["toroa", "toro"],
};

function getAgentsForKete(kete: KeteDefinition) {
  const aliases = PACK_ALIASES[kete.id] ?? [kete.id];
  return allAgents.filter((a) => a.pack && aliases.includes(a.pack));
}

function dashboardRoute(kete: KeteDefinition) {
  return kete.id === "toro" ? "/toro/dashboard" : `${kete.route}/dashboard`;
}

interface AgentStatusRow {
  agent_id: string;
  is_online: boolean;
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export default function DashboardsHubPage() {
  const [statusMap, setStatusMap] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pre-compute kete → agent roster
  const keteRosters = useMemo(() => {
    return KETE_CONFIG.map((k) => ({
      kete: k,
      agents: getAgentsForKete(k),
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const allCodes = keteRosters
        .flatMap((r) => r.agents.map((a) => a.id.toLowerCase()))
        .filter((v, i, arr) => arr.indexOf(v) === i);

      if (!allCodes.length) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("agent_status")
        .select("agent_id, is_online")
        .in("agent_id", allCodes);

      if (cancelled) return;
      const map = new Map<string, boolean>();
      (data as AgentStatusRow[] | null)?.forEach((row) =>
        map.set(row.agent_id.toLowerCase(), row.is_online),
      );
      setStatusMap(map);
      setLoading(false);
    };

    refresh();
    const interval = window.setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [keteRosters]);

  const totals = useMemo(() => {
    const totalAgents = keteRosters.reduce((sum, r) => sum + r.agents.length, 0);
    const online = Array.from(statusMap.values()).filter(Boolean).length;
    return { totalAgents, online };
  }, [keteRosters, statusMap]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return keteRosters;
    return keteRosters.filter(({ kete, agents }) => {
      if (kete.name.toLowerCase().includes(q)) return true;
      if (kete.nameEn.toLowerCase().includes(q)) return true;
      return agents.some(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.designation.toLowerCase().includes(q),
      );
    });
  }, [keteRosters, search]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: PEARL.bg, color: PEARL.taupeDeep }}
    >
      <SEO
        title="Dashboards · all agents and kete | Assembl"
        description="Live status across every Assembl kete and specialist agent. Jump straight into the dashboard for Manaaki, Waihanga, Auaha, Arataki, Pikau, Hoko, Ako or Tōro."
      />
      <BrandNav />

      <main className="flex-1 pt-32 pb-24">
        {/* Header */}
        <section className="max-w-[1280px] mx-auto px-6 sm:px-8 mb-12">
          <motion.div {...fadeUp} className="max-w-[760px]">
            <p
              className="lowercase mb-4"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                letterSpacing: "0.2em",
                color: PEARL.muted,
              }}
            >
              ngā papatohu · dashboards
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(36px, 5vw, 56px)",
                lineHeight: 1.1,
                color: PEARL.ink,
                marginBottom: 18,
              }}
            >
              Every kete.{" "}
              <span style={{ fontStyle: "italic", color: PEARL.pounamu }}>
                Every agent. One hub.
              </span>
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                lineHeight: 1.65,
                color: PEARL.taupeDeep,
                maxWidth: 640,
              }}
            >
              Live status from <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>agent_status</code>
              {" "}across every specialist. Jump into a kete's dashboard, or scan the full
              roster from one screen.
            </p>
          </motion.div>

          {/* Totals strip */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <StatChip
              label="Industry kete"
              value={`${KETE_CONFIG.filter((k) => k.group === "business").length}`}
            />
            <StatChip
              label="Whānau kete"
              value={`${KETE_CONFIG.filter((k) => k.group === "whanau").length}`}
            />
            <StatChip label="Specialist agents" value={`${totals.totalAgents}`} />
            <StatChip
              label="Online now"
              value={loading ? "—" : `${totals.online}`}
              accent
            />
          </motion.div>

          {/* Search */}
          <div
            className="mt-8 max-w-[480px] flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: `1px solid ${PEARL.opal}`,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <Search size={15} style={{ color: PEARL.muted }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search kete or agent…"
              aria-label="Search kete or agent"
              className="flex-1 bg-transparent outline-none"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: PEARL.ink,
              }}
            />
          </div>
        </section>

        {/* Kete grid */}
        <section className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(({ kete, agents }, i) => (
              <KeteDashboardCard
                key={kete.id}
                kete={kete}
                agents={agents}
                statusMap={statusMap}
                loading={loading}
                index={i}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div
              className="text-center py-20 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.5)", border: `1px solid ${PEARL.opal}` }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 22,
                  color: PEARL.taupeDeep,
                }}
              >
                No kete or agents match "{search}".
              </p>
            </div>
          )}
        </section>
      </main>

      <BrandFooter />
    </div>
  );
}

/* ─── Atoms ─── */

function StatChip({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex items-baseline gap-2.5 px-4 py-2.5 rounded-full"
      style={{
        background: accent ? "rgba(31,77,71,0.08)" : "rgba(255,255,255,0.7)",
        border: `1px solid ${accent ? PEARL.pounamu + "30" : PEARL.opal}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 16,
          fontWeight: 500,
          color: accent ? PEARL.pounamu : PEARL.ink,
        }}
      >
        {value}
      </span>
      <span
        className="lowercase"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          letterSpacing: "0.14em",
          color: PEARL.muted,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function KeteDashboardCard({
  kete,
  agents,
  statusMap,
  loading,
  index,
}: {
  kete: KeteDefinition;
  agents: ReturnType<typeof getAgentsForKete>;
  statusMap: Map<string, boolean>;
  loading: boolean;
  index: number;
}) {
  const onlineCount = agents.filter((a) => statusMap.get(a.id.toLowerCase())).length;
  const accent = INDUSTRY_KETE[kete.id as keyof typeof INDUSTRY_KETE]?.accentHex ?? kete.color;
  const route = dashboardRoute(kete);
  const isActive = kete.smsStatus === "active" || kete.id === "auaha" || agents.length > 0;

  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: index * 0.04 }}
    >
      <Link
        to={route}
        className="group block h-full overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5"
        style={{
          background: "rgba(255,255,255,0.65)",
          border: `1px solid ${PEARL.opal}`,
          boxShadow: "0 8px 30px rgba(111,97,88,0.06)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Top accent band */}
        <div
          style={{
            height: 4,
            background: `linear-gradient(90deg, ${accent} 0%, ${accent}40 100%)`,
          }}
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p
                className="lowercase mb-1.5"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  color: PEARL.muted,
                }}
              >
                {kete.nameEn}
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 400,
                  fontSize: 26,
                  color: PEARL.ink,
                  lineHeight: 1.1,
                }}
              >
                {kete.name}
              </h2>
            </div>
            <ArrowUpRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ color: PEARL.muted, flexShrink: 0 }}
            />
          </div>

          {/* Live status row */}
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-xl mb-5"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: `1px solid ${PEARL.opal}`,
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{
                width: 7,
                height: 7,
                background: loading
                  ? `${accent}40`
                  : onlineCount > 0
                    ? "#3A7D6E"
                    : "#C66B5C",
                boxShadow: !loading && onlineCount > 0 ? `0 0 8px ${accent}60` : "none",
                animation: loading ? "pulse 1.6s ease-in-out infinite" : undefined,
              }}
            />
            <Activity size={12} style={{ color: accent }} />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: PEARL.taupeDeep,
                letterSpacing: "0.04em",
              }}
            >
              {loading
                ? "syncing…"
                : `${onlineCount} / ${agents.length} agents online`}
            </span>
            <span
              className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{
                background: isActive ? "rgba(90,173,160,0.12)" : "rgba(208,165,67,0.10)",
                color: isActive ? "#3A7D6E" : "#A47A2C",
                border: `1px solid ${isActive ? "rgba(90,173,160,0.25)" : "rgba(208,165,67,0.25)"}`,
              }}
            >
              {isActive ? <CheckCircle2 size={9} /> : <Clock size={9} />}
              {isActive ? "Live" : "Pilot"}
            </span>
          </div>

          {/* Description */}
          <p
            className="mb-5 line-clamp-2"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              lineHeight: 1.55,
              color: PEARL.taupeDeep,
            }}
          >
            {kete.description}
          </p>

          {/* Agent roster */}
          <div className="mb-5">
            <p
              className="lowercase mb-2 flex items-center gap-1.5"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                letterSpacing: "0.16em",
                color: PEARL.muted,
              }}
            >
              <Users size={10} />
              Specialist agents · {agents.length}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {agents.slice(0, 8).map((a) => {
                const online = statusMap.get(a.id.toLowerCase());
                return (
                  <span
                    key={a.id}
                    title={a.role}
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      letterSpacing: "0.04em",
                      padding: "3px 9px",
                      borderRadius: 999,
                      background: online ? `${accent}18` : "rgba(255,255,255,0.6)",
                      border: `1px solid ${online ? accent + "40" : PEARL.opal}`,
                      color: online ? PEARL.ink : PEARL.muted,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 999,
                        background: online ? "#3A7D6E" : PEARL.muted + "60",
                      }}
                    />
                    {a.name}
                  </span>
                );
              })}
              {agents.length > 8 && (
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: PEARL.muted,
                    padding: "3px 9px",
                  }}
                >
                  +{agents.length - 8} more
                </span>
              )}
              {agents.length === 0 && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontStyle: "italic",
                    color: PEARL.muted,
                  }}
                >
                  Roster wiring in progress
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div
            className="inline-flex items-center gap-1.5 transition-all group-hover:gap-2.5"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: PEARL.pounamu,
            }}
          >
            Open {kete.name} dashboard
            <ArrowUpRight size={13} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
