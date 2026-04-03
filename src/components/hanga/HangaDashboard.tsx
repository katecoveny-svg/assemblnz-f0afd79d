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
import HarakekePattern from "@/components/HarakekePattern";
import WorkflowCards from "@/components/WorkflowCards";
import KeteBrainChat from "@/components/KeteBrainChat";
import VoiceFAB from "@/components/VoiceFAB";
import KeteSmsExplainer from "@/components/sms/KeteSmsExplainer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";
const TANGAROA = "#1A3A5C";

/* ── Glass card ── */
const Glass = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <div
    className={`rounded-2xl border backdrop-blur-md ${className}`}
    style={{
      background: "linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))",
      borderColor: glow ? "rgba(212,168,67,0.25)" : "rgba(255,255,255,0.06)",
      boxShadow: glow ? "0 0 30px rgba(212,168,67,0.08)" : "0 4px 24px rgba(0,0,0,0.3)",
    }}
  >
    {children}
  </div>
);

/* ── Static data ── */
const agents = [
  { name: "KAUPAPA", role: "PROGRAMME & CLAIMS", desc: "Critical path tracking & Form 1 claims.", status: "ANALYSING", color: KOWHAI, to: "/hanga/kaupapa" },
  { name: "ĀRAI", role: "SAFETY & RISK", desc: "Site-specific H&S risk register.", status: "MONITORING", color: POUNAMU, to: "/hanga/arai" },
  { name: "KAHU", role: "COMPLIANCE", desc: "CCA 2002 & Retention trust audit.", status: "IDLE", color: "#6B7280", to: "/hanga/docs" },
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
  { label: "Active Workers", labelMi: "Kaimahi", value: "47", icon: Users, color: POUNAMU, trend: "+3 today" },
  { label: "Open Hazards", labelMi: "Mōrearea", value: "5", icon: AlertTriangle, color: "#E44D4D", trend: "2 critical" },
  { label: "Budget Health", labelMi: "Pūtea", value: "$4.2M", sub: "of $6.3M", icon: DollarSign, color: KOWHAI, progress: 67 },
  { label: "Days to Payment", labelMi: "Rā ki te Utu", value: "12", icon: Calendar, color: TANGAROA, trend: "PC-012" },
];

const StatusBadge = ({ status, color }: { status: string; color: string }) => (
  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
    {status}
  </span>
);

export default function HangaDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px] mx-auto">
      <HarakekePattern className="mb-1 rounded" />
      <KeteOnboardingCard packId="hanga" />

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>HANGA</h1>
          <span className="text-[9px] font-bold tracking-[0.2em] px-3 py-1 rounded-full" style={{ background: `${KOWHAI}18`, color: KOWHAI, border: `1px solid ${KOWHAI}30` }}>
            CONSTRUCTION INTELLIGENCE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(58,125,110,0.12)", border: "1px solid rgba(58,125,110,0.2)" }}>
            <HardHat size={14} style={{ color: POUNAMU }} />
            <span className="text-[11px] text-white/60 font-medium">Christchurch Metro Sports</span>
            <ChevronRight size={12} className="text-white/30" />
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold" style={{ background: `linear-gradient(135deg, ${KOWHAI}, ${POUNAMU})`, color: "#fff" }}>
            KH
          </div>
        </div>
      </motion.div>
      <p className="text-[11px] text-white/30 -mt-3">BUILT FOR AOTEAROA · CCA 2002 COMPLIANT · 3 APRIL 2026</p>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Glass className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}12` }}>
                  <kpi.icon size={16} style={{ color: kpi.color }} />
                </div>
                {kpi.trend && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${kpi.color}12`, color: kpi.color }}>{kpi.trend}</span>}
              </div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              {kpi.sub && <span className="text-[10px] text-white/25">{kpi.sub}</span>}
              <div className="text-[10px] text-white/35 mt-0.5">{kpi.label}</div>
              {kpi.progress !== undefined && (
                <div className="mt-2 h-1 rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${kpi.progress}%`, background: `linear-gradient(90deg, ${POUNAMU}, ${KOWHAI})` }} />
                </div>
              )}
            </Glass>
          </motion.div>
        ))}
      </div>

      {/* ── Main grid: Agents + Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Symbiotic Workforce */}
        <Glass className="lg:col-span-3 p-4" glow>
          <h3 className="text-[11px] font-bold text-white/50 tracking-wider mb-3">SYMBIOTIC WORKFORCE</h3>
          <div className="space-y-3">
            {agents.map(a => (
              <Link key={a.name} to={a.to} className="block group">
                <div className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white/[0.03]" style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}12` }}>
                    <Brain size={14} style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-white">{a.name}</span>
                      <StatusBadge status={a.status} color={a.color} />
                    </div>
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{a.role}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{a.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA: Tender Analysis */}
          <Link to="/hanga/tender" className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-black transition-all hover:brightness-110" style={{ background: KOWHAI }}>
            NEW TENDER ANALYSIS <ArrowUpRight size={14} />
          </Link>
          <p className="text-[9px] text-white/25 mt-1.5 px-1">PRIORITY 1 HOOK · SAVE ~14 HOURS</p>

          {/* CTA: Payment Claim */}
          <Link to="/hanga/kaupapa" className="mt-3 flex items-center gap-2 text-white/50 hover:text-white/80 text-[11px] font-medium transition-colors">
            <FileText size={13} /> DRAFT PAYMENT CLAIM (FORM 1)
          </Link>
        </Glass>

        {/* Charts column */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Programme Health */}
          <Glass className="p-4 md:col-span-1">
            <h3 className="text-xs font-bold text-white mb-0.5">PROGRAMME HEALTH</h3>
            <p className="text-[10px] text-white/30 mb-3">CRITICAL PATH DELAY (-2 DAYS)</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={programmeData}>
                  <defs>
                    <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={KOWHAI} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={KOWHAI} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[60, 100]} />
                  <Tooltip contentStyle={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 11 }} />
                  <Area type="monotone" dataKey="actual" stroke={KOWHAI} fill="url(#progGrad)" strokeWidth={2} />
                  <Line type="monotone" dataKey="planned" stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Glass>

          {/* Site Safety Docs */}
          <Glass className="p-4 md:col-span-1">
            <h3 className="text-xs font-bold text-white mb-0.5">SITE SAFETY DOCS</h3>
            <p className="text-[10px] text-white/30 mb-3">WEEKLY TOOLBOX PROGRESS</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safetyDocsData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 11 }} />
                  <Bar dataKey="complete" fill={POUNAMU} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Glass>

          {/* Retention Trust */}
          <Glass className="p-4 md:col-span-1" glow>
            <h3 className="text-xs font-bold text-white mb-0.5">RETENTION TRUST</h3>
            <p className="text-[10px] text-white/30 mb-4">COMPLIANT VIA KAHU</p>
            <div className="space-y-4">
              <div className="flex items-baseline gap-4">
                <div>
                  <div className="text-xl font-bold text-white">$124,500</div>
                  <div className="text-[10px] text-white/30">HELD</div>
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ color: POUNAMU }}>82%</div>
                  <div className="text-[10px] text-white/30">VERIFIED</div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/5">
                <div className="h-full rounded-full" style={{ width: "82%", background: `linear-gradient(90deg, ${POUNAMU}, ${KOWHAI})` }} />
              </div>
              <Link to="/hanga/docs" className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider transition-colors hover:brightness-125" style={{ color: KOWHAI }}>
                AUDIT RETENTION LEDGER <ExternalLink size={10} />
              </Link>
            </div>
          </Glass>

          {/* Project Risk Heatmap - full width */}
          <Glass className="p-4 md:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-white">PROJECT RISK HEATMAP</h3>
                <p className="text-[10px] text-white/30">CROSS-AGENT SYMBIOTIC MONITORING</p>
              </div>
              <div className="flex gap-2">
                <button className="text-[9px] px-3 py-1 rounded-full text-white/50" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>ALL LEVELS</button>
                <button className="text-[9px] px-3 py-1 rounded-full font-bold" style={{ background: `${KOWHAI}18`, color: KOWHAI, border: `1px solid ${KOWHAI}30` }}>LIVE UPDATES</button>
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskHeatmapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 11 }} />
                  <Line type="monotone" dataKey="score" stroke={KOWHAI} strokeWidth={2.5} dot={{ r: 3, fill: KOWHAI }} activeDot={{ r: 5, fill: KOWHAI, stroke: "#0F0F1A", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="text-[10px] text-white/30">Sat</span>
              <span className="text-xs font-bold" style={{ color: POUNAMU }}>SCORE: 98</span>
            </div>
          </Glass>
        </div>
      </div>

      {/* ── Workflows Tab ── */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-transparent border border-white/[0.06] p-1">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-white/[0.06]">Overview</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs data-[state=active]:bg-white/[0.06]">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Quick Actions */}
            <Glass className="p-4">
              <h3 className="text-[11px] font-bold text-white/50 tracking-wider mb-3">QUICK ACTIONS</h3>
              <div className="space-y-2">
                {[
                  { label: "Report Hazard", labelMi: "Pūrongo Mōrearea", icon: AlertTriangle, color: "#E44D4D", to: "/hanga/arai" },
                  { label: "Payment Claim", labelMi: "Tono Utu", icon: DollarSign, color: KOWHAI, to: "/hanga/kaupapa" },
                  { label: "Site Muster", labelMi: "Tae Mai", icon: MapPin, color: POUNAMU, to: "/hanga/site-checkin" },
                  { label: "Generate Report", labelMi: "Pūrongo", icon: FileText, color: TANGAROA, to: "/hanga/docs" },
                ].map(a => (
                  <Link key={a.label} to={a.to} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/[0.03]" style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${a.color}12` }}>
                      <a.icon size={14} style={{ color: a.color }} />
                    </div>
                    <div>
                      <span className="text-xs text-white/70 font-medium">{a.label}</span>
                      <p className="text-[9px] text-white/25">{a.labelMi}</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-white/15" />
                  </Link>
                ))}
              </div>
            </Glass>

            {/* Today's Priorities */}
            <Glass className="p-4">
              <h3 className="text-[11px] font-bold text-white/50 tracking-wider mb-3">TODAY'S PRIORITIES</h3>
              <div className="space-y-2">
                {[
                  { text: "Review 2 critical hazards flagged by ĀRAI", agent: "ĀRAI", urgent: true },
                  { text: "Payment claim PC-012 response due in 3 days", agent: "KAUPAPA", urgent: false },
                  { text: "Scaffold inspection Level 4 overdue", agent: "PAI", urgent: true },
                  { text: "Building consent amendment status update", agent: "WHAKAAĒ", urgent: false },
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: p.urgent ? "rgba(228,77,77,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${p.urgent ? "rgba(228,77,77,0.12)" : "rgba(255,255,255,0.04)"}` }}>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${p.urgent ? "animate-pulse" : ""}`} style={{ background: p.urgent ? "#E44D4D" : "rgba(255,255,255,0.15)" }} />
                    <div>
                      <p className="text-[11px] text-white/60 leading-relaxed">{p.text}</p>
                      <span className="text-[9px] font-bold tracking-wider" style={{ color: KOWHAI }}>{p.agent}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>

            {/* Live Activity */}
            <Glass className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold text-white/50 tracking-wider">LIVE ACTIVITY</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: POUNAMU }} />
                  <span className="text-[9px] text-white/25">LIVE</span>
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
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <a.icon size={12} className="text-white/30" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 leading-relaxed">{a.text}</p>
                      <span className="text-[9px] text-white/20">{a.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Glass>
          </div>
        </TabsContent>

        <TabsContent value="workflows">
          <div className="mt-4">
            <WorkflowCards packId="hanga" />
          </div>
        </TabsContent>
      </Tabs>

      {/* SMS & WhatsApp Explainer */}
      <KeteSmsExplainer
        keteName="Hanga"
        keteNameEn="Construction"
        accentColor="#3A7D6E"
        conversations={[]}
      />

      <KeteBrainChat keteId="hanga" keteName="Hanga" keteNameEn="Construction" accentColor="#3A7D6E" />
    </div>
  );
}
