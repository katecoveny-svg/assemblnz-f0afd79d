/**
 * HOKO Workflow Explorer — compact tabbed demo for the 5 non-flagship workflows.
 * Each tab shows the agent pipeline, the trigger, the output, and an evidence-pack receipt.
 * Pure UI; deterministic mock data so the brief is always presentable.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Users, Megaphone, ShieldCheck, BarChart3,
  Check, ChevronRight, Sparkles, Clock, FileCheck,
} from "lucide-react";

interface WorkflowTab {
  id: string;
  title: string;
  pipeline: string;
  icon: typeof Package;
  trigger: string;
  cadence: string;
  output: { label: string; lines: string[] };
  receipt: string;
}

const WORKFLOWS: WorkflowTab[] = [
  {
    id: "reorder",
    title: "Auto Re-Order Recommender",
    pipeline: "FLUX → LEDGER → APEX → AURA",
    icon: Package,
    trigger: "Monday 7:00am · POS velocity scan + supplier lead-time table",
    cadence: "Weekly · per-supplier grouped",
    output: {
      label: "Monday morning re-order brief",
      lines: [
        "Allpress · 1kg Espresso × 18 (12 wk avg = 14, +season factor)",
        "Macpac NZ · Hiking Sock M × 24 (sold-through 91% last 14d)",
        "Ecostore · 5L laundry × 6 (paused — slow mover, holding 11 wk cover)",
        "→ 3 POs drafted in your standard format · 1-tap to send",
      ],
    },
    receipt: "MANA · evidence pack 4f2a · POS export + lead-time refs attached",
  },
  {
    id: "customer",
    title: "Unified Customer View",
    pipeline: "PRISM → AURA → NOVA",
    icon: Users,
    trigger: "Match on email + phone + name/postcode across POS, MailChimp, IG DMs, loyalty",
    cadence: "Continuous · trigger-based outreach",
    output: {
      label: "Today's customer triggers",
      lines: [
        "Sarah K · LTV $3,840 · birthday in 12 days · favourite: Allpress",
        "→ Draft: \"Kia ora Sarah — your beans are in. We've held a 1kg for you.\"",
        "Mike R · 94 days since last visit · was monthly · churn risk ",
        "Dan T · first purchase 6 days ago · welcome flow stage 2 ready",
      ],
    },
    receipt: "MANA · consent verified per IPP 3A · channel chosen by recorded preference",
  },
  {
    id: "publisher",
    title: "Multi-Channel Product Publisher",
    pipeline: "NOVA → SOCIAL → AURA → PRISM",
    icon: Megaphone,
    trigger: "New SKU added in POS / Shopify with image + description",
    cadence: "On-add · scheduled across week at optimal times",
    output: {
      label: "Generated from one product input",
      lines: [
        "Website product page · 240 words · SEO meta + alt text",
        "Instagram reel script · 18s · 3 cuts · trending audio suggested",
        "Facebook post · 80 words · CTA to product page",
        "Google Business post · 100 words · local hook",
        "Email teaser · subject line A/B · 2 variants",
        "TikTok hook · 7s opener + CTA card",
      ],
    },
    receipt: "MANA · brand-voice match 94% · all claims passed FTA pre-lint",
  },
  {
    id: "compliance",
    title: "FTA / CGA Compliance Lint",
    pipeline: "ANCHOR → APEX → MANA",
    icon: ShieldCheck,
    trigger: "Any price tag, ad, sale banner or product claim before publish",
    cadence: "Pre-publish · blocking on critical issues",
    output: {
      label: "Lint findings on draft sale banner",
      lines: [
        "\"Was $129 / Now $79\" — no 28-day prior price evidence found",
        "   → Suggested: \"Save $50 vs RRP\" (verifiable)",
        "\"Only 2 left!\" — true at scan, but unverifiable on landing",
        "   → Suggested: \"2 in stock at Ponsonby\" (specific, defensible)",
        "\"NZ-stocked, ships today\" — verified against POS inventory",
      ],
    },
    receipt: "MANA · Fair Trading Act 1986 + Commerce Commission decisions corpus · audit-ready",
  },
  {
    id: "margin",
    title: "True Contribution Margin",
    pipeline: "LEDGER → AXIS → FLUX",
    icon: BarChart3,
    trigger: "Monthly · POS sales + Xero COGS + shelf-space allocation table",
    cadence: "Monthly · ranked recommendations",
    output: {
      label: "Hidden losers exposed (top 5)",
      lines: [
        "SKU-1421 · gross 38% · contribution -2% (high shrinkage + slow turn)",
        "SKU-0982 · gross 41% · contribution 4% (oversized shelf footprint)",
        "SKU-2210 · gross 44% · contribution 6% (staff time per unit high)",
        "→ Delist 2 · price-correct 2 · reposition 1 · projected +$1,840/mo",
      ],
    },
    receipt: "MANA · POS + Xero source rows attached · overhead allocation method documented",
  },
];

export default function HokoWorkflowExplorer({ accent }: { accent: string }) {
  const [activeId, setActiveId] = useState(WORKFLOWS[0].id);
  const active = WORKFLOWS.find((w) => w.id === activeId)!;
  const Icon = active.icon;

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-5">
      {/* Tab list */}
      <div className="space-y-2">
        <p
          className="text-[10px] tracking-[3px] uppercase mb-3"
          style={{ color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}
        >
          The other five workflows
        </p>
        {WORKFLOWS.map((w) => {
          const TabIcon = w.icon;
          const isActive = w.id === activeId;
          return (
            <button
              key={w.id}
              onClick={() => setActiveId(w.id)}
              className="w-full text-left rounded-xl p-3 transition-all flex items-start gap-3"
              style={{
                background: isActive ? `${accent}10` : "rgba(255,255,255,0.7)",
                border: isActive ? `1px solid ${accent}40` : "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <TabIcon
                size={16}
                style={{ color: isActive ? accent : "#9CA3AF", marginTop: 2, flexShrink: 0 }}
              />
              <div className="min-w-0">
                <div
                  className="text-[12px] font-medium leading-tight"
                  style={{ color: "#3D4250" }}
                >
                  {w.title}
                </div>
                <div
                  className="text-[10px] mt-1"
                  style={{
                    color: isActive ? accent : "#9CA3AF",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {w.pipeline}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {/* Header */}
            <div
              className="flex items-start justify-between gap-3 pb-4 mb-4 border-b"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}
                >
                  <Icon size={18} style={{ color: accent }} />
                </div>
                <div>
                  <h4 className="text-base font-medium" style={{ color: "#3D4250" }}>
                    {active.title}
                  </h4>
                  <p
                    className="text-[10px] tracking-wider uppercase mt-0.5"
                    style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {active.pipeline}
                  </p>
                </div>
              </div>
            </div>

            {/* Trigger + cadence */}
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(0,0,0,0.02)" }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ChevronRight size={11} style={{ color: accent }} />
                  <span
                    className="text-[9px] tracking-[2px] uppercase"
                    style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Trigger
                  </span>
                </div>
                <p className="text-[12px] leading-snug" style={{ color: "#3D4250" }}>
                  {active.trigger}
                </p>
              </div>
              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(0,0,0,0.02)" }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={11} style={{ color: accent }} />
                  <span
                    className="text-[9px] tracking-[2px] uppercase"
                    style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Cadence
                  </span>
                </div>
                <p className="text-[12px] leading-snug" style={{ color: "#3D4250" }}>
                  {active.cadence}
                </p>
              </div>
            </div>

            {/* Output */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: `${accent}08`, border: `1px solid ${accent}25` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} style={{ color: accent }} />
                <span
                  className="text-[10px] tracking-[2px] uppercase"
                  style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {active.output.label}
                </span>
              </div>
              <ul className="space-y-1.5">
                {active.output.lines.map((line, i) => (
                  <li
                    key={i}
                    className="text-[12.5px] leading-relaxed"
                    style={{ color: "#3D4250" }}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* Receipt */}
            <div
              className="flex items-center gap-2 pt-3 border-t"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <FileCheck size={12} style={{ color: "#3A7D6E" }} />
              <span
                className="text-[11px]"
                style={{
                  color: "#6B7280",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {active.receipt}
              </span>
              <Check size={12} style={{ color: "#3A7D6E", marginLeft: "auto" }} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
