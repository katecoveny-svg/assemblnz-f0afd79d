import { useState } from "react";
import { Link } from "react-router-dom";
import { agents } from "@/data/agents";
import { KETE_CONFIG } from "@/components/kete/KeteConfig";
import AgentAvatar from "@/components/AgentAvatar";
import { MessageSquare, FlaskConical, Search, Filter } from "lucide-react";

// Map legacy/transitional pack ids in src/data/agents.ts to canonical KETE_CONFIG ids.
// Keeps the directory aligned to the 7 industry kete + Tōro source of truth.
const PACK_TO_KETE: Record<string, string> = {
  manaaki: "manaaki",
  waihanga: "waihanga",
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

const GOLD = "#4AA5A8";

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(74,165,168,0.12)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
};

export default function AdminAgentDirectory() {
  const [search, setSearch] = useState("");
  const [filterPack, setFilterPack] = useState("all");

  // Resolve every agent to a canonical kete id
  const agentKete = (a: typeof agents[number]) =>
    PACK_TO_KETE[a.pack ?? "core"] ?? "core";

  const filtered = agents.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase());
    const matchPack = filterPack === "all" || agentKete(a) === filterPack;
    return matchSearch && matchPack;
  });

  const keteCounts = agents.reduce<Record<string, number>>((acc, a) => {
    const k = agentKete(a);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  // Filter buttons: all canonical kete + a "Core" bucket for shared agents
  const filterButtons = [
    ...KETE_CONFIG.map((k) => ({ id: k.id, name: k.name, color: k.color })),
    { id: "core", name: "Shared Core", color: "#3D4250" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className="text-2xl font-light tracking-[3px] uppercase"
          style={{ fontFamily: "'Lato', sans-serif", color: "#3D4250" }}
        >
          Agent Directory
        </h2>
        <p className="text-sm mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
          {agents.length} specialist agents across {KETE_CONFIG.length} kete + shared core
        </p>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={GLASS}
        >
          <Search className="w-4 h-4" style={{ color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search agents by name or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#3D4250" }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterPack("all")}
            className={`px-4 py-2.5 rounded-2xl text-[11px] font-medium transition-all`}
            style={
              filterPack === "all"
                ? {
                    ...GLASS,
                    background: `linear-gradient(135deg, ${GOLD}12, ${GOLD}05)`,
                    border: `1px solid ${GOLD}25`,
                    color: "#3D4250",
                  }
                : { ...GLASS, color: "#6B7280" }
            }
          >
            All ({agents.length})
          </button>
          {filterButtons.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterPack(p.id)}
              className={`px-3 py-2.5 rounded-2xl text-[11px] font-medium transition-all`}
              style={
                filterPack === p.id
                  ? {
                      ...GLASS,
                      background: `linear-gradient(135deg, ${p.color}15, ${p.color}05)`,
                      border: `1px solid ${p.color}30`,
                      color: "#3D4250",
                    }
                  : { ...GLASS, color: "#6B7280" }
              }
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: p.color }}
                />
                {p.name} ({keteCounts[p.id] || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((agent) => {
          const keteId = agentKete(agent);
          const pack = filterButtons.find((p) => p.id === keteId);
          return (
            <div
              key={agent.id}
              className="group rounded-3xl p-5 transition-all duration-300 hover:translate-y-[-2px]"
              style={{
                ...GLASS,
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.1), 0 0 20px ${agent.color}15`;
                e.currentTarget.style.borderColor = `${agent.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = "rgba(74,165,168,0.12)";
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-[20%] right-[20%] h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(90deg, transparent, ${agent.color}40, transparent)`,
                }}
              />

              <div className="flex items-start gap-3 mb-3">
                <AgentAvatar
                  agentId={agent.id}
                  color={agent.color}
                  size={40}
                  showGlow={false}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold tracking-wide"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: "#2D3140" }}
                  >
                    {agent.name}
                  </p>
                  <p
                    className="text-[10px] font-mono"
                    style={{ color: "#9CA3AF" }}
                  >
                    {agent.designation}
                  </p>
                </div>
                {pack && (
                  <span
                    className="text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shrink-0"
                    style={{
                      background: `${pack.color}12`,
                      color: `${pack.color}`,
                      border: `1px solid ${pack.color}20`,
                    }}
                  >
                    {pack.name}
                  </span>
                )}
              </div>

              <p
                className="text-[11px] leading-relaxed mb-4 line-clamp-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}
              >
                {agent.role}
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Link
                  to={`/chat/${agent.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-medium transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${agent.color}15, ${agent.color}08)`,
                    border: `1px solid ${agent.color}25`,
                    color: agent.color,
                    boxShadow: `0 4px 16px ${agent.color}08`,
                  }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </Link>
                <Link
                  to={`/admin/test-lab?agent=${agent.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-medium transition-all duration-200"
                  style={{
                    ...GLASS,
                    color: "#6B7280",
                  }}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Test
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Filter className="w-8 h-8 mx-auto mb-3" style={{ color: "#D1D5DB" }} />
          <p className="text-sm" style={{ color: "#6B7280" }}>No agents match your search</p>
        </div>
      )}
    </div>
  );
}
