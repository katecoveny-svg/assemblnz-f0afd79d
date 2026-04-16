import { useState } from "react";
import { Link } from "react-router-dom";
import { agents, packs } from "@/data/agents";
import AgentAvatar from "@/components/AgentAvatar";
import { MessageSquare, FlaskConical, Search, Filter } from "lucide-react";

const GOLD = "#D4A843";

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.05)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
};

export default function AdminAgentDirectory() {
  const [search, setSearch] = useState("");
  const [filterPack, setFilterPack] = useState("all");

  const filtered = agents.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase());
    const matchPack = filterPack === "all" || a.pack === filterPack;
    return matchSearch && matchPack;
  });

  const packCounts = agents.reduce<Record<string, number>>((acc, a) => {
    const p = a.pack || "other";
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className="text-2xl font-light tracking-[3px] uppercase text-white/90"
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          Agent Directory
        </h2>
        <p className="text-sm text-white/40 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {agents.length} specialist agents across {packs.length} kete
        </p>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={GLASS}
        >
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents by name or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterPack("all")}
            className={`px-4 py-2.5 rounded-2xl text-[11px] font-medium transition-all ${
              filterPack === "all"
                ? "text-foreground"
                : "text-gray-400 hover:text-gray-500"
            }`}
            style={
              filterPack === "all"
                ? {
                    ...GLASS,
                    background: `linear-gradient(135deg, ${GOLD}12, ${GOLD}05)`,
                    border: `1px solid ${GOLD}25`,
                  }
                : GLASS
            }
          >
            All ({agents.length})
          </button>
          {packs.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterPack(p.id)}
              className={`px-3 py-2.5 rounded-2xl text-[11px] font-medium transition-all ${
                filterPack === p.id
                  ? "text-foreground"
                  : "text-gray-400 hover:text-gray-500"
              }`}
              style={
                filterPack === p.id
                  ? {
                      ...GLASS,
                      background: `linear-gradient(135deg, ${p.color}15, ${p.color}05)`,
                      border: `1px solid ${p.color}30`,
                    }
                  : GLASS
              }
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: p.color }}
                />
                {p.name} ({packCounts[p.id] || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((agent) => {
          const pack = packs.find((p) => p.id === agent.pack);
          return (
            <div
              key={agent.id}
              className="group rounded-3xl p-5 transition-all duration-300 hover:translate-y-[-2px]"
              style={{
                ...GLASS,
                boxShadow: `0 8px 32px rgba(0,0,0,0.25), 0 0 0 0 ${agent.color}00`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.35), 0 0 30px ${agent.color}10`;
                e.currentTarget.style.borderColor = `${agent.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.25)`;
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
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
                    className="text-sm font-bold text-white/90 tracking-wide"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {agent.name}
                  </p>
                  <p
                    className="text-[10px] text-gray-400 font-mono"
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
                className="text-[11px] text-white/40 leading-relaxed mb-4 line-clamp-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
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
                    border: `1px solid ${agent.color}20`,
                    color: agent.color,
                    boxShadow: `0 4px 16px ${agent.color}08, inset 0 1px 0 rgba(255,255,255,0.03)`,
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
                    color: "rgba(255,255,255,0.5)",
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
          <Filter className="w-8 h-8 mx-auto text-white/10 mb-3" />
          <p className="text-sm text-gray-400">No agents match your search</p>
        </div>
      )}
    </div>
  );
}
