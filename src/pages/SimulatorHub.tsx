import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  HardHat,
  Car,
  Truck,
  Sparkles,
  Play,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Radio,
  Loader2,
} from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { useLiveSimulator, type StepStatus } from "@/hooks/useLiveSimulator";
import { LIVE_PACKS } from "@/data/simulatorPacks";

const POUNAMU = "#3A7D6E";

const PACK_ICONS: Record<string, typeof UtensilsCrossed> = {
  manaaki: UtensilsCrossed,
  waihanga: HardHat,
  arataki: Car,
  pikau: Truck,
  auaha: Sparkles,
};

const statusIcon = (s: StepStatus) => {
  if (s === "pass") return <CheckCircle2 size={14} className="text-emerald-500" />;
  if (s === "warn") return <AlertTriangle size={14} className="text-amber-500" />;
  if (s === "fail") return <AlertTriangle size={14} className="text-rose-500" />;
  if (s === "running")
    return <Loader2 size={14} className="text-assembl-text/50 animate-spin" />;
  return <Clock size={14} className="text-assembl-text/30" />;
};

export default function SimulatorHub() {
  const { run, results, running, activePackId } = useLiveSimulator();
  const pack = LIVE_PACKS.find((p) => p.id === activePackId);

  return (
    <div style={{ minHeight: "100vh", background: "#FAFBFC" }}>
      <SEO
        title="Scenario Simulator | assembl"
        description="Run live NZ business scenarios using real weather, fuel prices, routes, and compliance feeds."
      />
      <BrandNav />

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[11px] font-medium"
            style={{
              background: "rgba(74,165,168,0.08)",
              color: POUNAMU,
              border: "1px solid rgba(74,165,168,0.2)",
            }}
          >
            <Radio size={11} className="animate-pulse" /> Live data · runs against real edge functions
          </div>
          <h1
            className="text-4xl md:text-5xl font-light tracking-tight mb-4 text-assembl-text"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            Scenario Simulator
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-assembl-text/60">
            Each step calls a real Supabase edge function — weather, fuel, routes,
            compliance, and the kete agents themselves. Live data when available,
            graceful fallback when not.
          </p>
        </motion.div>

        {/* Pack cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {LIVE_PACKS.map((p, i) => {
            const Icon = PACK_ICONS[p.id] ?? Sparkles;
            const isActive = activePackId === p.id;
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                disabled={running}
                onClick={() => run(p)}
                className="text-left rounded-2xl p-5 cursor-pointer group transition-all duration-300 disabled:opacity-60"
                style={{
                  background: isActive ? `${p.color}10` : "rgba(255,255,255,0.7)",
                  border: `1px solid ${isActive ? p.color + "55" : "rgba(0,0,0,0.06)"}`,
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${p.color}15` }}
                  >
                    <Icon size={18} style={{ color: p.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-assembl-text">{p.name}</h3>
                    <p className="text-[10px] text-assembl-text/50">{p.subtitle}</p>
                  </div>
                </div>
                <p className="text-xs text-assembl-text/70 mb-3 line-clamp-2">{p.scenario}</p>
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: p.color }}>
                  <Play size={10} /> {isActive && running ? "Running…" : "Run live"}
                  <ChevronRight size={10} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Active scenario */}
        <AnimatePresence mode="wait">
          {pack && (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl p-8"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(0,0,0,0.06)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                {(() => {
                  const Icon = PACK_ICONS[pack.id] ?? Sparkles;
                  return <Icon size={20} style={{ color: pack.color }} />;
                })()}
                <h2 className="text-xl font-light text-assembl-text">
                  {pack.name} — {pack.scenario}
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div>
                  <h4 className="text-xs font-semibold text-assembl-text/50 uppercase tracking-wider mb-3">
                    Inputs
                  </h4>
                  <ul className="space-y-1.5">
                    {pack.inputs.map((inp) => (
                      <li
                        key={inp}
                        className="text-xs text-assembl-text/70 flex items-start gap-2"
                      >
                        <ChevronRight size={10} className="text-assembl-text/30 mt-1 flex-shrink-0" />
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-assembl-text/50 uppercase tracking-wider mb-3">
                    Expected outputs
                  </h4>
                  <ul className="space-y-1.5">
                    {pack.outputs.map((out) => (
                      <li
                        key={out}
                        className="text-xs text-assembl-text/70 flex items-start gap-2"
                      >
                        <FileText size={10} className="text-assembl-text/30 mt-1 flex-shrink-0" />
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-assembl-text/50 uppercase tracking-wider mb-3">
                    Compliance lens
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {pack.compliance.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: `${pack.color}10`,
                          color: pack.color,
                          border: `1px solid ${pack.color}30`,
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {pack.steps.map((step, i) => {
                  const r = results[i];
                  const status: StepStatus = r?.status ?? "idle";
                  const isLive = r?.origin === "live";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: status === "idle" ? 0.4 : 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-xl transition-all"
                      style={{
                        background:
                          status === "idle"
                            ? "transparent"
                            : "rgba(255,255,255,0.6)",
                        border:
                          status === "idle"
                            ? "1px dashed rgba(0,0,0,0.06)"
                            : "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="mt-0.5">{statusIcon(status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-medium text-assembl-text">{step.label}</div>
                          {step.source && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide font-medium"
                              style={{
                                background: isLive ? "rgba(58,125,110,0.1)" : "rgba(0,0,0,0.04)",
                                color: isLive ? POUNAMU : "rgba(61,66,80,0.5)",
                              }}
                            >
                              {isLive ? "live" : step.source}
                            </span>
                          )}
                        </div>
                        {r?.detail && (
                          <p className="text-xs text-assembl-text/60 mt-1 leading-relaxed">
                            {r.detail}
                          </p>
                        )}
                      </div>
                      {r && status !== "running" && (
                        <span
                          className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                          style={{
                            background:
                              status === "pass"
                                ? "rgba(16,185,129,0.1)"
                                : status === "warn"
                                ? "rgba(245,158,11,0.1)"
                                : "rgba(239,68,68,0.1)",
                            color:
                              status === "pass"
                                ? "#059669"
                                : status === "warn"
                                ? "#D97706"
                                : "#DC2626",
                          }}
                        >
                          {status === "pass" ? "PASS" : status === "warn" ? "FLAG" : "FAIL"}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {!running && Object.keys(results).length === pack.steps.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 text-center"
                >
                  <Link
                    to={`/${pack.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white"
                    style={{
                      background: pack.color,
                      boxShadow: `0 4px 16px ${pack.color}40`,
                    }}
                  >
                    See what your evidence pack looks like <ChevronRight size={14} />
                  </Link>
                  <button
                    onClick={() => run(pack)}
                    className="block mx-auto mt-3 text-xs text-assembl-text/50 hover:text-assembl-text/80 transition-colors"
                  >
                    Replay scenario
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BrandFooter />
    </div>
  );
}
