import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, AlertTriangle, DollarSign, Calendar, Shield, FileText,
  MapPin, TrendingUp, Activity, ChevronRight, HardHat, Brain,
  BarChart3, CheckCircle, Clock, ExternalLink, ArrowUpRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from "recharts";
import KeteOnboardingCard from "@/components/KeteOnboardingCard";
import WorkflowCards from "@/components/WorkflowCards";
import KeteBrainChat from "@/components/KeteBrainChat";
import VoiceFAB from "@/components/VoiceFAB";
import KeteSmsExplainer from "@/components/sms/KeteSmsExplainer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";
import KeteDocUpload from "@/components/shared/KeteDocUpload";
import KeteEvidencePackPanel from "@/components/shared/KeteEvidencePackPanel";

const C = {
  bg: "#FAFBFC",
  text: "#3D4250",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  pounamu: "#3A7D6E",
  kowhai: "#D4A843",
  tangaroa: "#1A3A5C",
  pounamuLight: "#7ECFC2",
  lavender: "#E8E6F0",
};

const glass = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: "0 10px 40px -10px rgba(58,125,110,0.12), 0 4px 12px rgba(0,0,0,0.03)",
  borderRadius: "24px",
};

const tooltipStyle = { background: "#FFFFFF", border: "1px solid rgba(58,125,110,0.12)", borderRadius: 12, color: C.text, fontSize: 11 };

const Glass = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <div className={`rounded-3xl overflow-hidden ${className}`} style={{
    ...glass,
    boxShadow: glow
      ? `0 10px 40px -10px ${C.pounamu}20, 0 4px 12px rgba(0,0,0,0.04)`
      : glass.boxShadow,
  }}>
    {children}
  </div>
);

/* ── Static data ── */
const agents = [
  { name: "KAUPAPA", role: "PROGRAMME & CLAIMS", desc: "Critical path tracking & Form 1 claims.", status: "ANALYSING", color: C.kowhai, to: "/waihanga/kaupapa" },
  { name: "ĀRAI", role: "SAFETY & RISK", desc: "Site-specific H&S risk register.", status: "MONITORING", color: C.pounamu, to: "/waihanga/arai" },
  { name: "KAHU", role: "COMPLIANCE", desc: "CCA 2002 & Retention trust audit.", status: "IDLE", color: C.pounamuLight, to: "/waihanga/docs" },
];

const programmeData = [
  { day: "Mon", planned: 82, actual: 78 },
  { day: "Tue", planned: 84, actual: 80 },
  { day: "Wed", planned: 86, actual: 83 },
  { day: "Thu", planned: 88, actual: 82 },
  { day: "Fri", planned: 90, actual: 85 },
  { day: "Sat", planned: 90, actual: 86 },
];

const safetyDocsData = [
  { name: "SSSP", complete: 8, pending: 2 },
  { name: "Toolbox", complete: 12, pending: 3 },
  { name: "SWMS", complete: 6, pending: 4 },
  { name: "Induction", complete: 15, pending: 1 },
];

const riskHeatmapData = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 68 },
  { day: "Wed", score: 75 },
  { day: "Thu", score: 82 },
  { day: "Fri", score: 90 },
  { day: "Sat", score: 98 },
];

const kpis = [
  { label: "Active Workers", labelMi: "Kaimahi", value: "47", icon: Users, color: C.pounamu, trend: "+3 today" },
  { label: "Open Hazards", labelMi: "Mōrearea", value: "5", icon: AlertTriangle, color: "#E44D4D", trend: "2 critical" },
  { label: "Budget Health", labelMi: "Pūtea", value: "$4.2M", sub: "of $6.3M", icon: DollarSign, color: C.kowhai, progress: 67 },
  { label: "Days to Payment", labelMi: "Rā ki te Utu", value: "12", icon: Calendar, color: C.tangaroa, trend: "PC-012" },
];

const StatusBadge = ({ status, color }: { status: string; color: string }) => (
  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${color}12`, color }}>
    {status}
  </span>
);

export default function HangaDashboard() {
  return (
    <KeteDashboardShell
      name="Waihanga"
      subtitle="Construction Intelligence — Built for Aotearoa"
      accentColor={C.kowhai}
      accentLight="#FFE866"
      variant="standard"
    >
      <KeteOnboardingCard packId="waihanga" />

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-light tracking-[0.08em] uppercase" style={{ fontFamily: "'Lato', sans-serif", color: C.text }}>WAIHANGA</h1>
          <span className="text-[9px] font-bold tracking-[0.2em] px-3 py-1 rounded-full" style={{ background: `${C.kowhai}12`, color: C.kowhai, border: `1px solid ${C.kowhai}20` }}>
            CONSTRUCTION INTELLIGENCE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl" style={{ background: `${C.pounamu}08`, border: `1px solid ${C.pounamu}12` }}>
            <HardHat size={14} style={{ color: C.pounamu }} />
            <span className="text-[11px] font-medium" style={{ color: C.textSecondary }}>Christchurch Metro Sports</span>
            <ChevronRight size={12} style={{ color: C.textTertiary }} />
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold" style={{ background: `linear-gradient(135deg, ${C.kowhai}, ${C.pounamu})`, color: "#FFFFFF" }}>
            KH
          </div>
        </div>
      </motion.div>
      <p className="text-[11px] -mt-3" style={{ color: C.textTertiary }}>BUILT FOR AOTEAROA · CCA 2002 COMPLIANT · 3 APRIL 2026</p>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Glass className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${kpi.color}10` }}>
                  <kpi.icon size={18} style={{ color: kpi.color }} />
                </div>
                {kpi.trend && <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${kpi.color}10`, color: kpi.color }}>{kpi.trend}</span>}
              </div>
              <div className="text-2xl font-bold" style={{ color: C.text }}>{kpi.value}</div>
              {kpi.sub && <span className="text-[10px]" style={{ color: C.textTertiary }}>{kpi.sub}</span>}
              <div className="text-[10px] mt-0.5" style={{ color: C.textSecondary }}>{kpi.label}</div>
              {kpi.progress !== undefined && (
                <div className="mt-2 h-1.5 rounded-full" style={{ background: `${C.lavender}60` }}>
                  <div className="h-full rounded-full" style={{ width: `${kpi.progress}%`, background: `linear-gradient(90deg, ${C.pounamu}, ${C.kowhai})` }} />
                </div>
              )}
            </Glass>
          </motion.div>
        ))}
      </div>

      {/* ── Main grid: Agents + Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Symbiotic Workforce */}
        <Glass className="lg:col-span-3 p-5" glow>
          <h3 className="text-[11px] font-bold tracking-wider mb-4" style={{ color: C.textSecondary }}>SYMBIOTIC WORKFORCE</h3>
          <div className="space-y-3">
            {agents.map(a => (
              <Link key={a.name} to={a.to} className="block group">
                <div className="flex items-start gap-3 p-3 rounded-2xl transition-all hover:bg-white/50" style={{ border: `1px solid ${C.lavender}60` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${a.color}10` }}>
                    <Brain size={14} style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold" style={{ color: C.text }}>{a.name}</span>
                      <StatusBadge status={a.status} color={a.color} />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textTertiary }}>{a.role}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textSecondary }}>{a.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link to="/waihanga/tender" className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all hover:brightness-110" style={{ background: C.kowhai, color: "#FFFFFF" }}>
            NEW TENDER ANALYSIS <ArrowUpRight size={14} />
          </Link>
          <p className="text-[9px] mt-1.5 px-1" style={{ color: C.textTertiary }}>PRIORITY 1 HOOK · SAVE ~14 HOURS</p>

          <Link to="/waihanga/kaupapa" className="mt-3 flex items-center gap-2 text-[11px] font-medium transition-colors" style={{ color: C.textSecondary }}>
            <FileText size={13} /> DRAFT PAYMENT CLAIM (FORM 1)
          </Link>
        </Glass>

        {/* Charts column */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Programme Health */}
          <Glass className="p-5 md:col-span-1">
            <h3 className="text-xs font-bold mb-0.5" style={{ color: C.text }}>PROGRAMME HEALTH</h3>
            <p className="text-[10px] mb-3" style={{ color: C.textTertiary }}>CRITICAL PATH DELAY (-2 DAYS)</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={programmeData}>
                  <defs>
                    <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.kowhai} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={C.kowhai} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: C.textTertiary, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.textTertiary, fontSize: 10 }} axisLine={false} tickLine={false} domain={[60, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="actual" stroke={C.kowhai} fill="url(#progGrad)" strokeWidth={2} />
                  <Line type="monotone" dataKey="planned" stroke={C.textTertiary} strokeWidth={1} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Glass>

          {/* Site Safety Docs */}
          <Glass className="p-5 md:col-span-1">
            <h3 className="text-xs font-bold mb-0.5" style={{ color: C.text }}>SITE SAFETY DOCS</h3>
            <p className="text-[10px] mb-3" style={{ color: C.textTertiary }}>WEEKLY TOOLBOX PROGRESS</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safetyDocsData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: C.textTertiary, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.textTertiary, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="complete" fill={C.pounamu} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill={`${C.lavender}`} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Glass>

          {/* Retention Trust */}
          <Glass className="p-5 md:col-span-1" glow>
            <h3 className="text-xs font-bold mb-0.5" style={{ color: C.text }}>RETENTION TRUST</h3>
            <p className="text-[10px] mb-4" style={{ color: C.textTertiary }}>COMPLIANT VIA KAHU</p>
            <div className="space-y-4">
              <div className="flex items-baseline gap-4">
                <div>
                  <div className="text-xl font-bold" style={{ color: C.text }}>$124,500</div>
                  <div className="text-[10px]" style={{ color: C.textTertiary }}>HELD</div>
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ color: C.pounamu }}>82%</div>
                  <div className="text-[10px]" style={{ color: C.textTertiary }}>VERIFIED</div>
                </div>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: `${C.lavender}60` }}>
                <div className="h-full rounded-full" style={{ width: "82%", background: `linear-gradient(90deg, ${C.pounamu}, ${C.kowhai})` }} />
              </div>
              <Link to="/waihanga/docs" className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider transition-colors hover:brightness-125" style={{ color: C.kowhai }}>
                AUDIT RETENTION LEDGER <ExternalLink size={10} />
              </Link>
            </div>
          </Glass>

          {/* Project Risk Heatmap */}
          <Glass className="p-5 md:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold" style={{ color: C.text }}>PROJECT RISK HEATMAP</h3>
                <p className="text-[10px]" style={{ color: C.textTertiary }}>CROSS-AGENT SYMBIOTIC MONITORING</p>
              </div>
              <div className="flex gap-2">
                <button className="text-[9px] px-3 py-1 rounded-full" style={{ color: C.textSecondary, border: `1px solid ${C.lavender}` }}>ALL LEVELS</button>
                <button className="text-[9px] px-3 py-1 rounded-full font-bold" style={{ background: `${C.kowhai}12`, color: C.kowhai, border: `1px solid ${C.kowhai}20` }}>LIVE UPDATES</button>
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskHeatmapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: C.textTertiary, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.textTertiary, fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="score" stroke={C.kowhai} strokeWidth={2.5} dot={{ r: 3, fill: C.kowhai }} activeDot={{ r: 5, fill: C.kowhai, stroke: "#FFFFFF", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="text-[10px]" style={{ color: C.textTertiary }}>Sat</span>
              <span className="text-xs font-bold" style={{ color: C.pounamu }}>SCORE: 98</span>
            </div>
          </Glass>
        </div>
      </div>

      {/* ── Workflows Tab ── */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-transparent p-1" style={{ border: `1px solid ${C.lavender}` }}>
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-white/60">Overview</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs data-[state=active]:bg-white/60">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Quick Actions */}
            <Glass className="p-5">
              <h3 className="text-[11px] font-bold tracking-wider mb-4" style={{ color: C.textSecondary }}>QUICK ACTIONS</h3>
              <div className="space-y-2">
                {[
                  { label: "Report Hazard", labelMi: "Pūrongo Mōrearea", icon: AlertTriangle, color: "#E44D4D", to: "/waihanga/arai" },
                  { label: "Payment Claim", labelMi: "Tono Utu", icon: DollarSign, color: C.kowhai, to: "/waihanga/kaupapa" },
                  { label: "Site Muster", labelMi: "Tae Mai", icon: MapPin, color: C.pounamu, to: "/waihanga/site-checkin" },
                  { label: "Generate Report", labelMi: "Pūrongo", icon: FileText, color: C.tangaroa, to: "/waihanga/docs" },
                ].map(a => (
                  <Link key={a.label} to={a.to} className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-white/50" style={{ border: `1px solid ${C.lavender}60` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${a.color}10` }}>
                      <a.icon size={14} style={{ color: a.color }} />
                    </div>
                    <div>
                      <span className="text-xs font-medium" style={{ color: C.text }}>{a.label}</span>
                      <p className="text-[9px]" style={{ color: C.textTertiary }}>{a.labelMi}</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto" style={{ color: C.textTertiary }} />
                  </Link>
                ))}
              </div>
            </Glass>

            {/* Today's Priorities */}
            <Glass className="p-5">
              <h3 className="text-[11px] font-bold tracking-wider mb-4" style={{ color: C.textSecondary }}>TODAY'S PRIORITIES</h3>
              <div className="space-y-2">
                {[
                  { text: "Review 2 critical hazards flagged by ĀRAI", agent: "ĀRAI", urgent: true },
                  { text: "Payment claim PC-012 response due in 3 days", agent: "KAUPAPA", urgent: false },
                  { text: "Scaffold inspection Level 4 overdue", agent: "PAI", urgent: true },
                  { text: "Building consent amendment status update", agent: "WHAKAAĒ", urgent: false },
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: p.urgent ? "rgba(228,77,77,0.04)" : `${C.lavender}30`, border: `1px solid ${p.urgent ? "rgba(228,77,77,0.1)" : C.lavender + "60"}` }}>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${p.urgent ? "animate-pulse" : ""}`} style={{ background: p.urgent ? "#E44D4D" : C.textTertiary }} />
                    <div>
                      <p className="text-[11px] leading-relaxed" style={{ color: C.textSecondary }}>{p.text}</p>
                      <span className="text-[9px] font-bold tracking-wider" style={{ color: C.kowhai }}>{p.agent}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>

            {/* Live Activity */}
            <Glass className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold tracking-wider" style={{ color: C.textSecondary }}>LIVE ACTIVITY</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.pounamu }} />
                  <span className="text-[9px]" style={{ color: C.textTertiary }}>LIVE</span>
                </div>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {[
                  { text: "ĀRAI flagged hazard: Scaffold L4 edge gap", time: "12m ago", icon: AlertTriangle },
                  { text: "KAUPAPA: PC-012 submitted ($245,000)", time: "1hr ago", icon: DollarSign },
                  { text: "47 workers on site check-in", time: "2hr ago", icon: MapPin },
                  { text: "PAI: Level 2 slab inspection — PASSED", time: "3hr ago", icon: CheckCircle },
                  { text: "WHAKAAĒ: Consent amendment lodged", time: "5hr ago", icon: FileText },
                ].map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/50 transition-colors">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${C.lavender}60` }}>
                      <a.icon size={12} style={{ color: C.textTertiary }} />
                    </div>
                    <div>
                      <p className="text-[10px] leading-relaxed" style={{ color: C.textSecondary }}>{a.text}</p>
                      <span className="text-[9px]" style={{ color: C.textTertiary }}>{a.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Glass>
          </div>
        </TabsContent>

        <TabsContent value="workflows">
          <div className="mt-4">
            <WorkflowCards packId="waihanga" />
          </div>
        </TabsContent>
      </Tabs>

      {/* SMS & WhatsApp Explainer */}
      <KeteSmsExplainer
        keteName="Waihanga"
        keteNameEn="Construction"
        accentColor="#3A7D6E"
        conversations={[]}
      />

      <KeteEvidencePackPanel
        keteSlug="waihanga"
        keteName="Waihanga — Construction"
        accentColor={C.kowhai}
        agentId="apex"
        agentName="APEX"
        packTemplates={[
          { label: "Building Consent Pack", description: "Building Act 2004 consent evidence", packType: "building-consent-pack", complianceChecks: [
            { check: "Building Act 2004 — consent docs complete", status: "pass" },
            { check: "Architectural drawings verified", status: "pass" },
            { check: "Structural calculations attached", status: "pass" },
            { check: "Fire engineering report filed", status: "pass" },
          ]},
          { label: "H&S Site Pack", description: "HSWA site safety documentation", packType: "hs-site-pack", complianceChecks: [
            { check: "SSSP current and signed", status: "pass" },
            { check: "Hazard register reviewed this week", status: "pass" },
            { check: "Toolbox talks logged", status: "pass" },
          ]},
        ]}
      />

      <KeteDocUpload
        keteSlug="waihanga"
        keteName="Waihanga"
        keteColor={C.kowhai}
      />
    </KeteDashboardShell>
  );
}
