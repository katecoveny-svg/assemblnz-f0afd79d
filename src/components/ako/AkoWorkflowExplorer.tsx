/**
 * AKO Workflow Explorer — tabbed view for the 2 non-flagship MVP workflows:
 * Transparency Pack Generator + Graduated Enforcement Readiness Report.
 *
 * Mirrors HokoWorkflowExplorer pattern. Pure UI, deterministic mock data.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Gauge, Check, ChevronRight, Sparkles, Clock, FileCheck,
} from "lucide-react";

interface WorkflowTab {
  id: string;
  title: string;
  pipeline: string;
  icon: typeof FileText;
  trigger: string;
  cadence: string;
  output: { label: string; lines: string[] };
  receipt: string;
}

const WORKFLOWS: WorkflowTab[] = [
  {
    id: "transparency",
    title: "Transparency Pack Generator",
    pipeline: "NOVA-AKO → ANCHOR → MANA",
    icon: FileText,
    trigger: "Centre profile created · or any time licensing criteria are updated",
    cadence: "On-demand · auto-refresh on next login when criteria change",
    output: {
      label: "Four whānau-facing documents · centre voice · reading age 12",
      lines: [
        "Complaints procedure — plain English · includes Director of Regulation pathway",
        "ERO report access — where to find the latest review · how to request earlier",
        "Licensing status statement — current licence + conditions + last review date",
        "Operational document summary — every policy held + how to request to read",
        "→ All four diff-marked when criteria change. Nothing rewritten silently.",
      ],
    },
    receipt: "MANA · transparency pack v2026-04-20 · Education and Training Act 2020 references attached",
  },
  {
    id: "readiness",
    title: "Graduated Enforcement Readiness Report",
    pipeline: "MANA-AKO → APEX → AROHA",
    icon: Gauge,
    trigger: "Daily evidence sweep across policies, sleep-check log, ratio captures, staff register",
    cadence: "Daily snapshot · weekly head-teacher brief · pre-visit deep scan",
    output: {
      label: "Today's readiness snapshot · Tūi & Pīwakawaka ECC",
      lines: [
        "64 GREEN · compliant with evidence",
        "11 AMBER · compliant but evidence weak",
        "3 RED · gap or no evidence",
        "",
        "TOP 3 PRIORITIES (Director of Regulation focus areas)",
        "1. HS17 sleep-check log — only 84% of checks evidenced this week (target 100%)",
        "2. S9 ratio snapshots — pick-up transition missed 4 days in last 14",
        "3. P14 outdoor inspection — last log 9 days ago (weekly cadence required)",
        "→ Trend vs last week: improving · next review 25 Apr 2026",
      ],
    },
    receipt: "MANA-AKO · readiness snapshot #ak-r-1142 · immutable · Director of Regulation export-ready",
  },
];

export default function AkoWorkflowExplorer({ accent }: { accent: string }) {
  const [activeId, setActiveId] = useState(WORKFLOWS[0].id);
  const active = WORKFLOWS.find((w) => w.id === activeId)!;
  const Icon = active.icon;

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-5">
      {/* Tab list */}
      <div className="space-y-2">
        <p
          className="text-[10px] tracking-[3px] uppercase mb-3"
          style={{ color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}
        >
          The other two workflows
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
                    fontFamily: "'IBM Plex Mono', monospace",
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
                    style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {active.pipeline}
                  </p>
                </div>
              </div>
            </div>

            {/* Trigger + cadence */}
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.02)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <ChevronRight size={11} style={{ color: accent }} />
                  <span className="text-[9px] tracking-[2px] uppercase" style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}>
                    Trigger
                  </span>
                </div>
                <p className="text-[12px] leading-snug" style={{ color: "#3D4250" }}>
                  {active.trigger}
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.02)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={11} style={{ color: accent }} />
                  <span className="text-[9px] tracking-[2px] uppercase" style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}>
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
                <span className="text-[10px] tracking-[2px] uppercase" style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {active.output.label}
                </span>
              </div>
              <ul className="space-y-1.5">
                {active.output.lines.map((line, i) => (
                  <li
                    key={i}
                    className="text-[12.5px] leading-relaxed whitespace-pre-wrap"
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
                style={{ color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}
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
