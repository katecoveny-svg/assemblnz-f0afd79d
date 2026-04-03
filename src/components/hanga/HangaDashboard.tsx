import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, AlertTriangle, DollarSign, Calendar, Plus, Shield, FileText,
  MapPin, TrendingUp, Activity, ChevronRight, Zap, HardHat, Brain
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import KeteOnboardingCard from "@/components/KeteOnboardingCard";
import HarakekePattern from "@/components/HarakekePattern";
import WorkflowCards from "@/components/WorkflowCards";
import VoiceFAB from "@/components/VoiceFAB";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";
const TANGAROA = "#1A3A5C";

const Glass = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <motion.div
    className={`rounded-2xl border backdrop-blur-md ${className}`}
    style={{
      background: "linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))",
      borderColor: glow ? "rgba(212,168,67,0.25)" : "rgba(255,255,255,0.06)",
      boxShadow: glow ? "0 0 30px rgba(212,168,67,0.08)" : "0 4px 24px rgba(0,0,0,0.3)",
    }}
    whileHover={{ boxShadow: "0 0 40px rgba(212,168,67,0.12)" }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const safetyData = [
  { week: "W1 Mar", reported: 8, resolved: 6 },
  { week: "W2 Mar", reported: 5, resolved: 7 },
  { week: "W3 Mar", reported: 12, resolved: 9 },
  { week: "W4 Mar", reported: 6, resolved: 8 },
];

const budgetData = [
  { name: "Claimed", value: 4200000, color: POUNAMU },
  { name: "Approved", value: 3800000, color: KOWHAI },
  { name: "Outstanding", value: 1200000, color: TANGAROA },
  { name: "Retention", value: 300000, color: "#E44D4D" },
];

const activities = [
  { id: "1", text: "ĀRAI flagged new hazard: Scaffold Level 4 edge protection gap", time: "12 min ago", type: "hazard", icon: AlertTriangle },
  { id: "2", text: "KAUPAPA: Payment claim PC-012 submitted ($245,000)", time: "1 hr ago", type: "payment", icon: DollarSign },
  { id: "3", text: "Site check-in: 47 workers currently on site", time: "2 hrs ago", type: "checkin", icon: MapPin },
  { id: "4", text: "PAI: Quality inspection Level 2 slab — PASSED", time: "3 hrs ago", type: "quality", icon: Shield },
  { id: "5", text: "WHAKAAĒ: Building consent amendment lodged with CCC", time: "5 hrs ago", type: "consent", icon: FileText },
  { id: "6", text: "ATA: 3 BIM clashes resolved in MEP coordination", time: "6 hrs ago", type: "bim", icon: Activity },
];

const kpis = [
  { label: "Active Workers", labelMi: "Kaimahi", value: "47", icon: Users, color: POUNAMU, trend: "+3 today" },
  { label: "Open Hazards", labelMi: "Mōrearea", value: "5", icon: AlertTriangle, color: "#E44D4D", trend: "2 critical" },
  { label: "Budget Health", labelMi: "Pūtea", value: "$4.2M", sub: "of $6.3M", icon: DollarSign, color: KOWHAI, progress: 67 },
  { label: "Days to Payment", labelMi: "Rā ki te Utu", value: "12", icon: Calendar, color: TANGAROA, trend: "PC-012" },
];

const quickActions = [
  { label: "Report Hazard", labelMi: "Pūrongo Mōrearea", icon: AlertTriangle, color: "#E44D4D", to: "/hanga/arai" },
  { label: "Payment Claim", labelMi: "Tono Utu", icon: DollarSign, color: KOWHAI, to: "/hanga/kaupapa" },
  { label: "Site Muster", labelMi: "Tae Mai", icon: MapPin, color: POUNAMU, to: "/hanga/site-checkin" },
  { label: "Generate Report", labelMi: "Pūrongo", icon: FileText, color: TANGAROA, to: "/hanga/docs" },
];

export default function HangaDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <HarakekePattern className="mb-2 rounded" />
      <KeteOnboardingCard packId="hanga" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${POUNAMU}, ${KOWHAI})` }}>
              <HardHat size={20} color="#fff" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Hanga Intelligence Hub</h1>
              <p className="text-xs text-white/40">Christchurch Metro Sports Facility</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(58,125,110,0.12)", border: "1px solid rgba(58,125,110,0.2)" }}>
          <Brain size={14} style={{ color: POUNAMU }} />
          <span className="text-[11px] text-white/50">IHO Active</span>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: POUNAMU }} />
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Glass className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                  <kpi.icon size={18} style={{ color: kpi.color }} />
                </div>
                {kpi.trend && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${kpi.color}15`, color: kpi.color }}>{kpi.trend}</span>}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white">{kpi.value}</div>
              {kpi.sub && <span className="text-xs text-white/30">{kpi.sub}</span>}
              <div className="text-[11px] text-white/40 mt-1">{kpi.label}</div>
              {kpi.progress !== undefined && (
                <div className="mt-2 h-1.5 rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${kpi.progress}%`, background: `linear-gradient(90deg, ${POUNAMU}, ${KOWHAI})` }} />
                </div>
              )}
            </Glass>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Safety Trend */}
        <Glass className="p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Safety Trends — Haumarutanga</h3>
          <p className="text-[11px] text-white/30 mb-4">Reported vs Resolved Hazards (4 weeks)</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safetyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }} />
                <Bar dataKey="reported" fill="#E44D4D" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" fill={POUNAMU} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Glass>

        {/* Budget */}
        <Glass className="p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Budget Breakdown — Pūtea</h3>
          <p className="text-[11px] text-white/30 mb-4">$6.3M Total Contract Value</p>
          <div className="flex items-center gap-6">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {budgetData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${(v / 1e6).toFixed(1)}M`} contentStyle={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {budgetData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-white/50">{d.name}</span>
                  <span className="text-xs text-white/70 ml-auto">${(d.value / 1e6).toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </div>
        </Glass>
      </div>

      {/* Workflows + Quick Actions + Activity */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-transparent border border-white/[0.06] p-1">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-white/[0.06]">Overview</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs data-[state=active]:bg-white/[0.06]">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            {/* Quick Actions */}
            <Glass className="p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map(a => (
                  <motion.a
                    key={a.label}
                    href={a.to}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={{ background: `${a.color}08`, border: `1px solid ${a.color}20` }}
                    whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${a.color}15` }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${a.color}15` }}>
                      <a.icon size={18} style={{ color: a.color }} />
                    </div>
                    <span className="text-[11px] text-white/60 text-center">{a.label}</span>
                  </motion.a>
                ))}
              </div>
            </Glass>

            {/* Activity Feed */}
            <Glass className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Activity Feed</h3>
                <span className="text-[10px] text-white/30">Live</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {activities.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <a.icon size={14} className="text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/70 leading-relaxed">{a.text}</p>
                      <span className="text-[10px] text-white/25">{a.time}</span>
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

      <VoiceFAB packId="hanga" />
    </div>
  );
}
