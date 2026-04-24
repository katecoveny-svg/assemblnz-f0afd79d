/**
 * HOKO Price Scanner — flagship interactive demo.
 * Mock data showing PRISM → LEDGER → NOVA → AURA pipeline.
 * Pure UI; not wired to a live scraper (yet).
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, Sparkles, Check, AlertTriangle, ChevronRight } from "lucide-react";

interface PriceRow {
  sku: string;
  name: string;
  yourPrice: number;
  competitors: { source: string; price: number; freight?: number; flag?: string }[];
  recommendation: string;
  severity: "critical" | "warning" | "ok";
}

const SAMPLE_DATA: PriceRow[] = [
  {
    sku: "AKL-CHRG-65W",
    name: "65W USB-C GaN Charger (Anker-equiv)",
    yourPrice: 79.00,
    competitors: [
      { source: "Temu (NZ delivery)", price: 22.50, freight: 6.90, flag: "Inc GST" },
      { source: "Amazon AU", price: 38.40, freight: 14.20 },
      { source: "PB Tech", price: 69.00 },
      { source: "Mighty Ape", price: 74.99 },
    ],
    recommendation: "Bundle with USB-C cable + 12mo replacement warranty at $89. Lead with NZ-stocked / next-day. Don't price-match Temu — race to the bottom.",
    severity: "critical",
  },
  {
    sku: "BRD-COFF-1KG",
    name: "Single-Origin Espresso 1kg",
    yourPrice: 52.00,
    competitors: [
      { source: "Coffee Supreme", price: 49.00 },
      { source: "Allpress (1kg)", price: 56.00 },
      { source: "Havana Coffee", price: 54.00 },
    ],
    recommendation: "Within market band. Loyalty-locked $48 for repeat customers protects margin and builds frequency.",
    severity: "ok",
  },
  {
    sku: "OUT-BOOT-M11",
    name: "Hiking Boot · Men's 11",
    yourPrice: 289.00,
    competitors: [
      { source: "Macpac", price: 299.99 },
      { source: "Bivouac", price: 279.00 },
      { source: "Amazon AU (delivered)", price: 219.00, freight: 38.00, flag: "Excl GST · sizing risk" },
    ],
    recommendation: "Honest comparison: Amazon arrives at $295 inc GST and delivery. You're at parity. Lead with free fitting + return swap.",
    severity: "warning",
  },
];

const STAGES = [
  { name: "PRISM", role: "Scanning", desc: "Live competitor scrape" },
  { name: "LEDGER", role: "Costing", desc: "Freight + GST math" },
  { name: "NOVA", role: "Drafting", desc: "Defensive response" },
  { name: "AURA", role: "Briefing", desc: "Owner one-tap brief" },
];

export default function HokoPriceScannerDemo({
  accent,
  accentLight,
}: {
  accent: string;
  accentLight: string;
}) {
  const [activeRow, setActiveRow] = useState(0);
  const [stage, setStage] = useState(3); // show end state by default
  const row = SAMPLE_DATA[activeRow];

  const sevColor = {
    critical: "#C66B5C",
    warning: "#4AA5A8",
    ok: "#3A7D6E",
  }[row.severity];

  const sevLabel = {
    critical: "Defensive action needed",
    warning: "Monitor — within parity",
    ok: "Competitive",
  }[row.severity];

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-5">
      {/* SKU picker */}
      <div className="space-y-2">
        <p className="text-[10px] tracking-[3px] uppercase mb-3" style={{ color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}>
          Top monitored SKUs
        </p>
        {SAMPLE_DATA.map((r, i) => {
          const sev = { critical: "#C66B5C", warning: "#4AA5A8", ok: "#3A7D6E" }[r.severity];
          return (
            <button
              key={r.sku}
              onClick={() => { setActiveRow(i); setStage(3); }}
              className="w-full text-left rounded-xl p-3 transition-all"
              style={{
                background: activeRow === i ? `${accent}10` : "rgba(255,255,255,0.7)",
                border: activeRow === i ? `1px solid ${accent}40` : "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sev }} />
                <span className="text-[10px] tracking-wider" style={{ color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}>
                  {r.sku}
                </span>
              </div>
              <div className="text-[12px] mt-1 leading-tight" style={{ color: "#3D4250" }}>
                {r.name}
              </div>
            </button>
          );
        })}

        <button
          onClick={() => setStage(0)}
          className="w-full mt-4 rounded-xl py-2.5 text-[11px] font-medium tracking-wider uppercase transition-all"
          style={{
            background: accent, color: "white",
            boxShadow: `0 6px 20px ${accent}40`,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          ▶ Re-run pipeline
        </button>
      </div>

      {/* Pipeline + result */}
      <div className="rounded-2xl p-6"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
        }}
      >
        {/* Stage stepper */}
        <div className="flex items-center gap-1 mb-6">
          {STAGES.map((s, i) => (
            <div key={s.name} className="flex items-center flex-1">
              <button
                onClick={() => setStage(i)}
                className="flex-1 text-left p-2 rounded-lg transition-all"
                style={{
                  background: stage >= i ? `${accent}12` : "transparent",
                  opacity: stage >= i ? 1 : 0.4,
                }}
              >
                <div className="text-[9px] tracking-[2px] uppercase" style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {s.name}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "#3D4250" }}>{s.role}</div>
                <div className="text-[10px]" style={{ color: "#9CA3AF" }}>{s.desc}</div>
              </button>
              {i < STAGES.length - 1 && (
                <ChevronRight size={12} style={{ color: stage > i ? accent : "#D1D5DB", flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>

        {/* Row header */}
        <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div>
            <div className="text-[10px] tracking-wider mb-1" style={{ color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}>
              {row.sku}
            </div>
            <h4 className="text-base font-medium" style={{ color: "#3D4250" }}>{row.name}</h4>
            <div className="mt-2 text-2xl font-light" style={{ color: accent, fontFamily: "'Inter', sans-serif" }}>
              ${row.yourPrice.toFixed(2)} <span className="text-xs" style={{ color: "#9CA3AF" }}>your retail price</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: `${sevColor}15`, color: sevColor, fontFamily: "'IBM Plex Mono', monospace" }}>
              {sevLabel}
            </span>
          </div>
        </div>

        {/* Competitor rows (PRISM + LEDGER stages) */}
        <AnimatePresence mode="wait">
          {stage >= 1 && (
            <motion.div
              key="competitors"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-2 mb-5"
            >
              <p className="text-[10px] tracking-[3px] uppercase mb-2" style={{ color: "#9CA3AF", fontFamily: "'IBM Plex Mono', monospace" }}>
                Competitor scan · honest comparison
              </p>
              {row.competitors.map((c, i) => {
                const allIn = c.price + (c.freight || 0);
                const gap = ((row.yourPrice - allIn) / row.yourPrice) * 100;
                return (
                  <motion.div
                    key={c.source}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg"
                    style={{ background: "rgba(0,0,0,0.02)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium" style={{ color: "#3D4250" }}>{c.source}</div>
                      {c.flag && (
                        <div className="text-[10px] mt-0.5" style={{ color: "#9CA3AF" }}>{c.flag}</div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-medium" style={{ color: "#3D4250" }}>
                        ${allIn.toFixed(2)}
                      </div>
                      {c.freight ? (
                        <div className="text-[10px]" style={{ color: "#9CA3AF" }}>
                          ${c.price.toFixed(2)} + ${c.freight.toFixed(2)} freight
                        </div>
                      ) : null}
                    </div>
                    <div className="w-16 text-right shrink-0">
                      <span className="text-[11px] font-medium" style={{
                        color: gap > 15 ? "#C66B5C" : gap > 0 ? "#4AA5A8" : "#3A7D6E",
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}>
                        {gap > 0 ? "+" : ""}{gap.toFixed(0)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* NOVA recommendation */}
        <AnimatePresence mode="wait">
          {stage >= 2 && (
            <motion.div
              key="rec"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl p-4 mb-5"
              style={{ background: `${accent}08`, border: `1px solid ${accent}25` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} style={{ color: accent }} />
                <span className="text-[10px] tracking-[2px] uppercase" style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}>
                  NOVA · Defensive recommendation
                </span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: "#3D4250" }}>
                {row.recommendation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AURA brief */}
        <AnimatePresence mode="wait">
          {stage >= 3 && (
            <motion.div
              key="aura"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between gap-3 pt-4 border-t"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}>
                <Check size={12} style={{ color: "#3A7D6E" }} />
                AURA: Brief queued for Monday 7:00am · evidence pack written to MANA
              </div>
              <button
                className="text-[11px] px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-90"
                style={{ background: accent, color: "white", fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Approve & ship →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
