/**
 * AgentMarketplacePage — /agents
 * Beautiful, browseable directory of all 46 specialist agents.
 * - Search by name / role / expertise
 * - Filter by kete (canonical) and Shared Core
 * - Beautiful glass cards with hover lift and accent gradient
 * - Each card links to /chat/:agentId
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Sparkles, MessageSquare, ChevronRight, X, Filter } from "lucide-react";
import { allAgents } from "@/data/agents";
import { KETE_CONFIG } from "@/components/kete/KeteConfig";
import { agentCapabilities } from "@/data/agentCapabilities";
import AgentAvatar from "@/components/AgentAvatar";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

const PACK_TO_KETE: Record<string, string> = {
  manaaki: "manaaki",
  waihanga: "waihanga",
  hanga: "waihanga",
  auaha: "auaha",
  arataki: "arataki",
  waka: "arataki",
  pikau: "pikau",
  hoko: "hoko",
  pakihi: "hoko",
  ako: "ako",
  hauora: "ako",
  toroa: "toro",
  toro: "toro",
  hangarau: "core",
  "te-kahui-reo": "core",
  core: "core",
};

const CHARCOAL = "#3D4250";
const SOFT_BG = "#FAFBFC";

export default function AgentMarketplacePage() {
  const [search, setSearch] = useState("");
  const [activeKete, setActiveKete] = useState<string>("all");

  const buckets = useMemo(
    () => [
      { id: "all", name: "All agents", color: CHARCOAL },
      ...KETE_CONFIG.map((k) => ({ id: k.id, name: k.name, color: k.color })),
      { id: "core", name: "Shared Core", color: "#7B6BA8" },
    ],
    [],
  );

  const enriched = useMemo(
    () =>
      allAgents.map((a) => ({
        ...a,
        keteId: PACK_TO_KETE[a.pack ?? "core"] ?? "core",
        capCount: agentCapabilities[a.id]?.length ?? a.expertise.length,
      })),
    [],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: enriched.length };
    enriched.forEach((a) => (c[a.keteId] = (c[a.keteId] || 0) + 1));
    return c;
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter((a) => {
      if (activeKete !== "all" && a.keteId !== activeKete) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.expertise.some((e) => e.toLowerCase().includes(q))
      );
    });
  }, [enriched, activeKete, search]);

  return (
    <>
      <SEO
        title="Agent Marketplace — 46 NZ Business Specialists | Assembl"
        description="Browse Assembl's full directory of governed specialist agents — built for NZ hospitality, construction, creative, automotive, freight, retail, ECE, and shared compliance core."
      />
      <BrandNav />

      <main className="min-h-screen pt-24 pb-24" style={{ background: SOFT_BG, color: CHARCOAL }}>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-[2px] uppercase mb-5"
              style={{
                background: "rgba(123,107,168,0.08)",
                border: "1px solid rgba(123,107,168,0.2)",
                color: "#7B6BA8",
              }}
            >
              <Sparkles size={10} /> Agent Marketplace · {enriched.length} specialists
            </span>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight mb-4"
              style={{ fontFamily: "'Lato', sans-serif", color: CHARCOAL }}
            >
              Every Assembl agent, in one place.
            </h1>
            <p
              className="text-base md:text-lg leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}
            >
              Browse {enriched.length} governed specialists across {KETE_CONFIG.length} industry kete plus the shared
              compliance core. Every agent is grounded in NZ legislation, citation-ready, and human-approval safe.
            </p>
          </motion.div>
        </section>

        {/* Search + Filters */}
        <section className="max-w-6xl mx-auto px-6 mb-8 sticky top-20 z-30">
          <div
            className="rounded-2xl p-3 flex flex-col md:flex-row gap-3 items-stretch md:items-center"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }}>
              <Search size={16} style={{ color: "#9CA3AF" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, role, or expertise — try 'privacy', 'tendering', 'fuel'…"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: CHARCOAL, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search">
                  <X size={14} style={{ color: "#9CA3AF" }} />
                </button>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 text-[11px] font-mono uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
              <Filter size={12} /> {filtered.length} matching
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {buckets.map((b) => {
              const active = activeKete === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setActiveKete(b.id)}
                  className="shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-medium transition-all duration-200"
                  style={
                    active
                      ? {
                          background: `linear-gradient(135deg, ${b.color}18, ${b.color}08)`,
                          border: `1px solid ${b.color}40`,
                          color: CHARCOAL,
                          boxShadow: `0 4px 16px ${b.color}15`,
                        }
                      : {
                          background: "rgba(255,255,255,0.6)",
                          border: "1px solid rgba(0,0,0,0.06)",
                          color: "#6B7280",
                        }
                  }
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }} />
                    {b.name}
                    <span className="opacity-60">({counts[b.id] || 0})</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Grid */}
        <section className="max-w-6xl mx-auto px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm" style={{ color: "#9CA3AF" }}>No agents match — try a different filter or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((agent, i) => {
                const bucket = buckets.find((b) => b.id === agent.keteId);
                const accent = agent.color || bucket?.color || CHARCOAL;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.02, 0.4) }}
                  >
                    <Link
                      to={`/chat/${agent.id}`}
                      className="group relative block rounded-2xl p-5 h-full transition-all duration-300 hover:-translate-y-1"
                      style={{
                        background: "rgba(255,255,255,0.75)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.08), 0 0 32px ${accent}20`;
                        e.currentTarget.style.borderColor = `${accent}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)";
                        e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)";
                      }}
                    >
                      {/* Top edge glow */}
                      <span
                        className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-80 transition-opacity duration-500"
                        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                      />

                      <div className="flex items-start justify-between mb-4">
                        <AgentAvatar agentId={agent.id} color={accent} size={44} />
                        {bucket && bucket.id !== "all" && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-[1.5px] px-2 py-1 rounded-md"
                            style={{
                              background: `${bucket.color}12`,
                              color: bucket.color,
                              border: `1px solid ${bucket.color}25`,
                            }}
                          >
                            {bucket.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 mb-1">
                        <h3
                          className="text-base font-bold tracking-wide"
                          style={{ fontFamily: "'JetBrains Mono', monospace", color: CHARCOAL }}
                        >
                          {agent.name}
                        </h3>
                        <span className="text-[10px] font-mono" style={{ color: "#9CA3AF" }}>
                          {agent.designation}
                        </span>
                      </div>
                      <p className="text-xs mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                        {agent.role}
                      </p>

                      <p
                        className="text-[12px] leading-relaxed mb-4 line-clamp-2"
                        style={{ color: "#4B5563", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {agent.tagline}
                      </p>

                      {/* Expertise chips */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {agent.expertise.slice(0, 3).map((e) => (
                          <span
                            key={e}
                            className="text-[10px] px-2 py-0.5 rounded-md"
                            style={{
                              background: "rgba(0,0,0,0.03)",
                              color: "#6B7280",
                              border: "1px solid rgba(0,0,0,0.04)",
                            }}
                          >
                            {e}
                          </span>
                        ))}
                        {agent.expertise.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5" style={{ color: "#9CA3AF" }}>
                            +{agent.expertise.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                          {agent.capCount} capabilities
                        </span>
                        <span
                          className="flex items-center gap-1 text-[11px] font-medium opacity-60 group-hover:opacity-100 transition-opacity"
                          style={{ color: accent }}
                        >
                          <MessageSquare size={11} /> Chat <ChevronRight size={11} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
