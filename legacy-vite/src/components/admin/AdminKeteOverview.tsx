import { Link } from "react-router-dom";
import { KETE_CONFIG, type KeteDefinition } from "@/components/kete/KeteConfig";
import { allAgents } from "@/data/agents";
import {
  MessageSquare, Smartphone, Globe, FlaskConical, Shield,
  ArrowUpRight, CheckCircle2, Clock, Bot,
} from "lucide-react";

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(74,165,168,0.12)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
};

// Map canonical KETE_CONFIG.id → pack ids that exist in src/data/agents.ts
// so we can correctly count specialist agents per kete during the
// agents.ts → KETE_CONFIG migration.
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

function countAgents(kete: KeteDefinition): number {
  const aliases = PACK_ALIASES[kete.id] ?? [kete.id];
  const live = allAgents.filter((a) => a.pack && aliases.includes(a.pack)).length;
  // Fall back to declared count when the agents.ts roster hasn't caught up
  return Math.max(live, kete.agentCount);
}

function StatusPill({ status, label }: { status: "active" | "coming-soon"; label: string }) {
  const isActive = status === "active";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
      style={{
        background: isActive ? "rgba(90,173,160,0.12)" : "rgba(208,165,67,0.10)",
        color: isActive ? "#3A7D6E" : "#A47A2C",
        border: `1px solid ${isActive ? "rgba(90,173,160,0.25)" : "rgba(208,165,67,0.25)"}`,
      }}
    >
      {isActive ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}

export default function AdminKeteOverview() {
  const totalAgents = KETE_CONFIG.reduce((sum, k) => sum + countAgents(k), 0);
  const liveSms = KETE_CONFIG.filter((k) => k.smsStatus === "active").length;
  const liveWa = KETE_CONFIG.filter((k) => k.whatsappStatus === "active").length;

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-light tracking-[3px] uppercase"
          style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250" }}
        >
          Kete Control Centre
        </h2>
        <p
          className="text-sm mt-1"
          style={{ fontFamily: "'Inter', sans-serif", color: "#6B7280" }}
        >
          {KETE_CONFIG.length} kete · {totalAgents} specialist agents · SMS live on {liveSms} ·
          WhatsApp live on {liveWa}
        </p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Industry kete", value: KETE_CONFIG.filter((k) => k.group === "business").length, color: "#3A7D6E", icon: Bot },
          { label: "Whānau kete", value: KETE_CONFIG.filter((k) => k.group === "whanau").length, color: "#4AA5A8", icon: Bot },
          { label: "SMS channels live", value: liveSms, color: "#5AADA0", icon: Smartphone },
          { label: "WhatsApp channels live", value: liveWa, color: "#3A6A9C", icon: MessageSquare },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl p-5" style={GLASS}>
            <s.icon className="w-4 h-4 mb-3" style={{ color: s.color }} />
            <p
              className="text-3xl font-bold tabular-nums mb-1"
              style={{ fontFamily: "'Inter', sans-serif", color: "#2D3140" }}
            >
              {s.value}
            </p>
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#9CA3AF" }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Kete grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {KETE_CONFIG.map((kete) => {
          const Icon = kete.icon;
          const agentCount = countAgents(kete);
          return (
            <div
              key={kete.id}
              className="group rounded-3xl p-6 transition-all duration-300 hover:translate-y-[-2px] relative overflow-hidden"
              style={{
                ...GLASS,
                borderColor: `${kete.color}20`,
              }}
            >
              <span
                className="absolute top-0 left-[10%] right-[10%] h-px opacity-50"
                style={{
                  background: `linear-gradient(90deg, transparent, ${kete.color}60, transparent)`,
                }}
              />

              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${kete.color}20, ${kete.color}08)`,
                    border: `1px solid ${kete.color}30`,
                    boxShadow: `0 4px 16px ${kete.color}15, inset 0 1px 0 rgba(255,255,255,0.6)`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: kete.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-base font-bold tracking-wide"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#2D3140" }}
                  >
                    {kete.name.toUpperCase()}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: "#9CA3AF" }}
                  >
                    {kete.nameEn}
                  </p>
                </div>
                <span
                  className="text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shrink-0"
                  style={{
                    background: `${kete.color}12`,
                    color: kete.color,
                    border: `1px solid ${kete.color}25`,
                  }}
                >
                  {kete.group}
                </span>
              </div>

              {/* Description */}
              <p
                className="text-[11px] leading-relaxed mb-4 line-clamp-2"
                style={{ fontFamily: "'Inter', sans-serif", color: "#6B7280" }}
              >
                {kete.description}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-xl px-2 py-2 text-center" style={{ background: "rgba(245,247,249,0.6)" }}>
                  <p className="text-base font-bold tabular-nums" style={{ color: "#2D3140" }}>
                    {agentCount}
                  </p>
                  <p className="text-[8px] uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                    agents
                  </p>
                </div>
                <div className="rounded-xl px-2 py-2 text-center" style={{ background: "rgba(245,247,249,0.6)" }}>
                  <Smartphone className="w-3 h-3 mx-auto mb-0.5" style={{ color: kete.smsStatus === "active" ? "#3A7D6E" : "#D1D5DB" }} />
                  <p className="text-[8px] uppercase tracking-wider font-bold" style={{ color: kete.smsStatus === "active" ? "#3A7D6E" : "#9CA3AF" }}>
                    SMS
                  </p>
                </div>
                <div className="rounded-xl px-2 py-2 text-center" style={{ background: "rgba(245,247,249,0.6)" }}>
                  <MessageSquare className="w-3 h-3 mx-auto mb-0.5" style={{ color: kete.whatsappStatus === "active" ? "#3A7D6E" : "#D1D5DB" }} />
                  <p className="text-[8px] uppercase tracking-wider font-bold" style={{ color: kete.whatsappStatus === "active" ? "#3A7D6E" : "#9CA3AF" }}>
                    WApp
                  </p>
                </div>
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                <StatusPill status={kete.smsStatus} label={`SMS ${kete.smsStatus === "active" ? "live" : "soon"}`} />
                <StatusPill status={kete.whatsappStatus} label={`WhatsApp ${kete.whatsappStatus === "active" ? "live" : "soon"}`} />
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={kete.route}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-medium transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${kete.color}15, ${kete.color}08)`,
                    border: `1px solid ${kete.color}25`,
                    color: kete.color,
                  }}
                >
                  <Globe className="w-3 h-3" />
                  Landing
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </Link>
                <Link
                  to={`/admin/test-lab?kete=${kete.id}`}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-medium transition-all"
                  style={{ ...GLASS, color: "#6B7280" }}
                >
                  <FlaskConical className="w-3 h-3" />
                  Test
                </Link>
                <Link
                  to={`/admin/messaging?kete=${kete.id}`}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-medium transition-all"
                  style={{ ...GLASS, color: "#6B7280" }}
                >
                  <MessageSquare className="w-3 h-3" />
                  Messaging
                </Link>
                <Link
                  to={`/admin/compliance?kete=${kete.id}`}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-medium transition-all"
                  style={{ ...GLASS, color: "#6B7280" }}
                >
                  <Shield className="w-3 h-3" />
                  Compliance
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
