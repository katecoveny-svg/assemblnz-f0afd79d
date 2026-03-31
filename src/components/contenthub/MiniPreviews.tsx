/**
 * Live mini-dashboard preview components for the Content Hub.
 * Each renders a compact, interactive visual that demonstrates
 * what the agent actually produces — with real sample data.
 *
 * Brand palette: #5AADA0 (emerald), #3A6A9C (cyan), #3A6A9C (violet),
 *                #E040FB (magenta), #4FC3F7 (sky), #7E57C2 (deep purple)
 */

import { useState } from "react";

/* ── HAVEN: Compliance Dashboard ── */
export const HavenCompliancePreview = () => {
  const items = [
    { standard: "Heating", status: "pass", detail: "Heat pump 3.5kW" },
    { standard: "Ceiling Insulation", status: "pass", detail: "R3.2" },
    { standard: "Underfloor", status: "fail", detail: "Not installed" },
    { standard: "Ventilation", status: "partial", detail: "Bathroom fan broken" },
    { standard: "Drainage", status: "pass", detail: "Clear" },
    { standard: "Draught Stopping", status: "partial", detail: "2 window gaps" },
  ];
  const badge = (s: string) =>
    s === "pass"
      ? { bg: "rgba(0,255,136,0.15)", color: "#5AADA0", label: "PASS" }
      : s === "fail"
      ? { bg: "rgba(179,136,255,0.15)", color: "#3A6A9C", label: "FAIL" }
      : { bg: "rgba(0,229,255,0.15)", color: "#3A6A9C", label: "PARTIAL" };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono-jb text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          14 Rata St, Mt Eden
        </span>
        <span className="font-display font-bold text-[11px]" style={{ color: "#3A6A9C" }}>
          4/6
        </span>
      </div>
      {items.map((it) => {
        const b = badge(it.status);
        return (
          <div
            key={it.standard}
            className="flex items-center justify-between py-1 px-2 rounded"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <span className="font-body text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              {it.standard}
            </span>
            <span
              className="font-mono-jb text-[8px] px-1.5 py-0.5 rounded"
              style={{ background: b.bg, color: b.color }}
            >
              {b.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ── FLUX: Pipeline Dashboard ── */
export const FluxPipelinePreview = () => {
  const stages = [
    { name: "New", count: 23, value: "$184K", color: "#3A6A9C" },
    { name: "Qualified", count: 15, value: "$267K", color: "#4FC3F7" },
    { name: "Proposal", count: 8, value: "$412K", color: "#3A6A9C" },
    { name: "Won", count: 6, value: "$287K", color: "#5AADA0" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {stages.map((s) => (
          <div
            key={s.name}
            className="flex-1 rounded-lg p-2 text-center"
            style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}
          >
            <p className="font-display font-bold text-[11px]" style={{ color: s.color }}>
              {s.count}
            </p>
            <p className="font-mono-jb text-[7px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              {s.name}
            </p>
            <p className="font-body text-[8px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <span className="font-mono-jb text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Conversion
        </span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full" style={{ width: "26%", background: "#5AADA0" }} />
        </div>
        <span className="font-mono-jb text-[9px] font-bold" style={{ color: "#5AADA0" }}>
          26%
        </span>
      </div>
    </div>
  );
};

/* ── AROHA: Employment Cost Calculator ── */
export const ArohaCalculatorPreview = () => {
  const rows = [
    { label: "Gross salary", value: "$65,000", highlight: false },
    { label: "KiwiSaver (3%)", value: "$1,950", highlight: false },
    { label: "ACC levy", value: "$410", highlight: false },
    { label: "Leave accruals", value: "$10,385", highlight: false },
    { label: "TRUE COST", value: "$77,744", highlight: true },
  ];
  return (
    <div className="space-y-1">
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex justify-between py-1 px-2 rounded"
          style={{
            background: r.highlight ? "rgba(0,229,255,0.08)" : "rgba(255,255,255,0.02)",
            borderBottom: r.highlight ? "none" : "1px solid rgba(255,255,255,0.03)",
          }}
        >
          <span
            className="font-body text-[10px]"
            style={{ color: r.highlight ? "#3A6A9C" : "rgba(255,255,255,0.5)", fontWeight: r.highlight ? 700 : 400 }}
          >
            {r.label}
          </span>
          <span
            className="font-mono-jb text-[10px]"
            style={{ color: r.highlight ? "#3A6A9C" : "rgba(255,255,255,0.7)", fontWeight: r.highlight ? 700 : 400 }}
          >
            {r.value}
          </span>
        </div>
      ))}
      <div className="text-center pt-1">
        <span className="font-mono-jb text-[9px]" style={{ color: "#3A6A9C" }}>
          +19.6% above base
        </span>
      </div>
    </div>
  );
};

/* ── FORGE: Finance Comparison ── */
export const ForgeComparisonPreview = () => {
  const lenders = [
    { name: "Dealer", rate: "9.95%", monthly: "$912", total: "$65,115", best: false },
    { name: "Bank", rate: "8.49%", monthly: "$880", total: "$63,027", best: true },
    { name: "Finance Co.", rate: "11.95%", monthly: "$955", total: "$67,711", best: false },
  ];
  return (
    <div>
      <div className="grid grid-cols-4 gap-0.5 text-[8px] font-mono-jb mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
        <span />
        {lenders.map((l) => (
          <span key={l.name} className="text-center">{l.name}</span>
        ))}
      </div>
      {[
        { label: "Rate", key: "rate" as const },
        { label: "Monthly", key: "monthly" as const },
        { label: "Total", key: "total" as const },
      ].map((row) => (
        <div key={row.label} className="grid grid-cols-4 gap-0.5 py-1 text-[9px]" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
          <span className="font-body" style={{ color: "rgba(255,255,255,0.4)" }}>{row.label}</span>
          {lenders.map((l) => (
            <span
              key={l.name}
              className="text-center font-mono-jb"
              style={{ color: l.best && row.key === "total" ? "#5AADA0" : "rgba(255,255,255,0.6)" }}
            >
              {l[row.key]}
            </span>
          ))}
        </div>
      ))}
      <p className="text-center font-mono-jb text-[8px] mt-2" style={{ color: "#5AADA0" }}>
        Save $2,088 with Bank Loan
      </p>
    </div>
  );
};

/* ── ECHO: Content Queue ── */
export const EchoContentPreview = () => {
  const posts = [
    { platform: "IG", type: "Carousel", time: "7am", status: "ready", color: "#E040FB" },
    { platform: "LI", type: "Post", time: "8am", status: "ready", color: "#0A66C2" },
    { platform: "IG", type: "Reel", time: "12pm", status: "draft", color: "#E040FB" },
    { platform: "IG", type: "Stories", time: "6pm", status: "draft", color: "#E040FB" },
  ];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono-jb text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Today's Queue
        </span>
        <span className="font-mono-jb text-[9px]" style={{ color: "#E4A0FF" }}>
          4 posts
        </span>
      </div>
      {posts.map((p, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-1.5 px-2 rounded"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="font-mono-jb text-[8px] px-1.5 py-0.5 rounded"
              style={{ background: `${p.color}20`, color: p.color }}
            >
              {p.platform}
            </span>
            <span className="font-body text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              {p.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono-jb text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              {p.time}
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: p.status === "ready" ? "#5AADA0" : "#3A6A9C" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── PRISM: Campaign Overview ── */
export const PrismCampaignPreview = () => {
  const channels = [
    { name: "Email", items: 3, color: "#4FC3F7" },
    { name: "LinkedIn", items: 2, color: "#0A66C2" },
    { name: "Instagram", items: 4, color: "#E040FB" },
    { name: "Reel", items: 1, color: "#3A6A9C" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono-jb text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Campaign: FORGE Launch
        </span>
        <span className="font-mono-jb text-[9px]" style={{ color: "#E040FB" }}>
          14 days
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {channels.map((ch) => (
          <div
            key={ch.name}
            className="text-center rounded-lg py-2"
            style={{ background: `${ch.color}08`, border: `1px solid ${ch.color}15` }}
          >
            <p className="font-display font-bold text-sm" style={{ color: ch.color }}>
              {ch.items}
            </p>
            <p className="font-mono-jb text-[7px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              {ch.name}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-0.5 mt-1">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-2 rounded-sm"
            style={{
              background: [0, 2, 4, 6, 9, 13].includes(i)
                ? "rgba(224,64,251,0.4)"
                : "rgba(255,255,255,0.04)",
            }}
          />
        ))}
      </div>
      <p className="font-mono-jb text-[7px] text-right" style={{ color: "rgba(255,255,255,0.2)" }}>
        ← 14-day posting schedule
      </p>
    </div>
  );
};

/* ── LEDGER: PAYE Calculator ── */
export const LedgerPayePreview = () => {
  const bands = [
    { range: "$0–14K", rate: "10.5%", tax: "$1,470" },
    { range: "$14K–48K", rate: "17.5%", tax: "$5,950" },
    { range: "$48K–70K", rate: "30%", tax: "$6,600" },
    { range: "$70K–85K", rate: "33%", tax: "$4,950" },
  ];
  return (
    <div className="space-y-1">
      {bands.map((b) => (
        <div
          key={b.range}
          className="flex items-center justify-between py-1 px-2 rounded"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <span className="font-mono-jb text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            {b.range}
          </span>
          <span className="font-mono-jb text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            {b.rate}
          </span>
          <span className="font-mono-jb text-[9px]" style={{ color: "#4FC3F7" }}>
            {b.tax}
          </span>
        </div>
      ))}
      <div className="flex justify-between pt-2 px-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="font-body text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
          Net take-home
        </span>
        <span className="font-mono-jb text-[11px] font-bold" style={{ color: "#5AADA0" }}>
          $2,389/fn
        </span>
      </div>
    </div>
  );
};

/* ── VAULT: Mortgage Comparison ── */
export const VaultMortgagePreview = () => {
  const banks = [
    { name: "Bank A", rate: "5.29%", monthly: "$3,877", best: false },
    { name: "Bank B", rate: "5.19%", monthly: "$3,833", best: true },
    { name: "Bank C", rate: "5.39%", monthly: "$3,922", best: false },
    { name: "Bank D", rate: "5.25%", monthly: "$3,859", best: false },
  ];
  return (
    <div className="space-y-1">
      {banks.map((b) => (
        <div
          key={b.name}
          className="flex items-center justify-between py-1.5 px-2 rounded"
          style={{
            background: b.best ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.02)",
            border: b.best ? "1px solid rgba(0,255,136,0.15)" : "1px solid transparent",
          }}
        >
          <span className="font-body text-[10px] font-medium" style={{ color: b.best ? "#5AADA0" : "rgba(255,255,255,0.5)" }}>
            {b.name}
          </span>
          <span className="font-mono-jb text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            {b.rate}
          </span>
          <span className="font-mono-jb text-[10px]" style={{ color: b.best ? "#5AADA0" : "rgba(255,255,255,0.6)" }}>
            {b.monthly}
          </span>
        </div>
      ))}
      <p className="text-center font-mono-jb text-[8px] pt-1" style={{ color: "#5AADA0" }}>
        Bank B saves $32,040 over loan life
      </p>
    </div>
  );
};

/* ── SHIELD: Risk Assessment ── */
export const ShieldRiskPreview = () => {
  const risks = [
    { hazard: "Earthquake", level: "High", color: "#3A6A9C" },
    { hazard: "Flood", level: "Low", color: "#5AADA0" },
    { hazard: "Tsunami", level: "N/A", color: "rgba(255,255,255,0.2)" },
    { hazard: "Volcanic", level: "Mod", color: "#3A6A9C" },
  ];
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between mb-1">
        <span className="font-mono-jb text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Mt Eden, Auckland
        </span>
        <span className="font-mono-jb text-[10px] font-bold" style={{ color: "#7E57C2" }}>
          $609,400
        </span>
      </div>
      {risks.map((r) => (
        <div
          key={r.hazard}
          className="flex items-center gap-2 py-1 px-2 rounded"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: r.color }}
          />
          <span className="font-body text-[10px] flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            {r.hazard}
          </span>
          <span className="font-mono-jb text-[9px]" style={{ color: r.color }}>
            {r.level}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── APEX: Hazard Matrix ── */
export const ApexHazardPreview = () => {
  const hazards = [
    { name: "Heights", risk: 12, level: "High", color: "#3A6A9C" },
    { name: "Electrical", risk: 15, level: "High", color: "#3A6A9C" },
    { name: "Dust", risk: 9, level: "Med", color: "#3A6A9C" },
    { name: "Manual", risk: 6, level: "Med", color: "#3A6A9C" },
    { name: "Noise", risk: 6, level: "Med", color: "#4FC3F7" },
  ];
  return (
    <div className="space-y-1">
      {hazards.map((h) => (
        <div
          key={h.name}
          className="flex items-center gap-2 py-1 px-2 rounded"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <span className="font-body text-[10px] flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            {h.name}
          </span>
          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${(h.risk / 15) * 100}%`, background: h.color }}
            />
          </div>
          <span className="font-mono-jb text-[8px] w-6 text-right" style={{ color: h.color }}>
            {h.risk}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── ANCHOR: Contract Preview ── */
export const AnchorContractPreview = () => (
  <div className="space-y-2">
    <div className="text-center py-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="font-display font-bold text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
        INDIVIDUAL EMPLOYMENT AGREEMENT
      </p>
    </div>
    {[
      { label: "Position", value: "Marketing Coordinator" },
      { label: "Trial Period", value: "90 days (s67A ERA)" },
      { label: "Salary", value: "$65,000 p.a." },
      { label: "KiwiSaver", value: "3% employer" },
      { label: "Notice", value: "4 weeks" },
    ].map((r) => (
      <div key={r.label} className="flex justify-between px-1">
        <span className="font-mono-jb text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          {r.label}
        </span>
        <span className="font-body text-[9px]" style={{ color: "rgba(255,255,255,0.6)" }}>
          {r.value}
        </span>
      </div>
    ))}
    <p className="font-mono-jb text-[7px] text-center pt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
      ERA 2000 compliant
    </p>
  </div>
);

/* ── TŌROA: Weekly Dashboard ── */
export const HelmWeeklyPreview = () => {
  const days = [
    { day: "Mon", items: ["Swimming gear", "Library book"], color: "#3A6A9C" },
    { day: "Tue", items: ["Mufti day $2", "Cricket 3:30"], color: "#5AADA0" },
    { day: "Wed", items: ["Lunch order", "ICAS Maths"], color: "#4FC3F7" },
    { day: "Thu", items: ["School photos", "USB for Tech"], color: "#E040FB" },
    { day: "Fri", items: ["Assembly 2pm", "Early finish"], color: "#3A6A9C" },
  ];
  return (
    <div className="flex gap-1">
      {days.map((d) => (
        <div
          key={d.day}
          className="flex-1 rounded-lg p-1.5"
          style={{ background: `${d.color}06`, border: `1px solid ${d.color}12` }}
        >
          <p className="font-mono-jb text-[8px] text-center mb-1" style={{ color: d.color }}>
            {d.day}
          </p>
          {d.items.map((item) => (
            <p
              key={item}
              className="font-body text-[7px] leading-tight mb-0.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {item}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

/* ── AURA: Guest Dossier ── */
export const AuraGuestPreview = () => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-display font-bold text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
          Mr & Mrs Whitfield
        </p>
        <p className="font-mono-jb text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          The Lindis Lodge · 3 nights · Anniversary
        </p>
      </div>
      <span
        className="font-mono-jb text-[8px] px-2 py-0.5 rounded-full"
        style={{ background: "rgba(0,255,136,0.1)", color: "#5AADA0" }}
      >
        VIP
      </span>
    </div>
    {[
      " Anniversary card in suite",
      " Central Otago Pinot chilled",
      " Pescatarian menu cards",
      " Helicopter to Aoraki/Mt Cook",
      " Stargazing session",
    ].map((item) => (
      <p key={item} className="font-body text-[9px]" style={{ color: "rgba(255,255,255,0.45)" }}>
        {item}
      </p>
    ))}
    <p className="font-mono-jb text-[8px] text-right" style={{ color: "#5AADA0" }}>
      LTV: $18,500
    </p>
  </div>
);

/** Map of card IDs to their preview components */
export const PREVIEW_MAP: Record<string, React.FC> = {
  "haven-compliance": HavenCompliancePreview,
  "flux-pipeline": FluxPipelinePreview,
  "aroha-cost": ArohaCalculatorPreview,
  "forge-fi": ForgeComparisonPreview,
  "echo-carousel": EchoContentPreview,
  "prism-campaign": PrismCampaignPreview,
  "ledger-paye": LedgerPayePreview,
  "vault-mortgage": VaultMortgagePreview,
  "shield-insurance": ShieldRiskPreview,
  "shield-hazard": ShieldRiskPreview,
  "apex-safety": ApexHazardPreview,
  "apex-tender": AnchorContractPreview,
  "anchor-agreement": AnchorContractPreview,
  "anchor-privacy": AnchorContractPreview,
  "helm-dashboard": HelmWeeklyPreview,
  "helm-newsletter": HelmWeeklyPreview,
  "aura-dossier": AuraGuestPreview,
  "aura-itinerary": AuraGuestPreview,
  "echo-linkedin": EchoContentPreview,
  "ledger-gst": LedgerPayePreview,
  "vault-kiwisaver": VaultMortgagePreview,
};
