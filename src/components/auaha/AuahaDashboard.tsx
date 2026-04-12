import { TrendingUp, TrendingDown, Eye, Heart, FileText, DollarSign, Palette, PenTool, Image, Video, Mic, Megaphone, Calendar, BarChart3, Pipette, Timer, ArrowRight, CreditCard, Zap, Sparkles, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import KeteBrainChat from "@/components/KeteBrainChat";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";
import { useAuahaDashboardMetrics, useRecentContentItems, useAuahaCampaigns } from "@/hooks/useAuahaData";
import SovereigntyPanel from "@/components/sovereignty/SovereigntyPanel";
import SovereigntySimulator from "@/components/sovereignty/SovereigntySimulator";
import KeteDocUpload from "@/components/shared/KeteDocUpload";
import { formatDistanceToNow } from "date-fns";

const ACCENT = "#F0D078";
const TEAL = "#5AADA0";

const sparkData = [
  { d: "Mon", v: 12400 }, { d: "Tue", v: 14200 }, { d: "Wed", v: 11800 },
  { d: "Thu", v: 16500 }, { d: "Fri", v: 18200 }, { d: "Sat", v: 22100 }, { d: "Sun", v: 19800 },
];

const PIPELINE_STAGES = [
  { key: "brief", label: "Brief", color: "#F0D078", agent: "Rautaki" },
  { key: "copy", label: "Copy", color: "#D4A843", agent: "Kōrero" },
  { key: "compliance", label: "Compliance", color: "#5AADA0", agent: "Mana Kupu" },
  { key: "design", label: "Design", color: "#3A7D6E", agent: "Toi" },
  { key: "schedule", label: "Schedule", color: "#3A6A9C", agent: "Whakahaere" },
  { key: "approve", label: "Approve", color: "#1A3A5C", agent: "Studio Director" },
  { key: "analyse", label: "Analyse", color: "#F0D078", agent: "Aro" },
];

const QUICK_LAUNCH = [
  { label: "Campaign Brief", desc: "Rautaki sequences the team", icon: Megaphone, route: "/auaha/campaign" },
  { label: "Copy Studio", desc: "Kōrero drafts sharp copy", icon: PenTool, route: "/auaha/copy" },
  { label: "Image Studio", desc: "Toi + Fal.ai + Runway", icon: Image, route: "/auaha/images" },
  { label: "Video Studio", desc: "Toi visual production", icon: Video, route: "/auaha/video" },
  { label: "Podcast Studio", desc: "Record with AI co-host", icon: Mic, route: "/auaha/podcast" },
  { label: "Ad Manager", desc: "Read-only connectors at pilot", icon: Megaphone, route: "/auaha/ads" },
  { label: "Content Calendar", desc: "Whakahaere schedules drafts", icon: Calendar, route: "/auaha/calendar" },
  { label: "Analytics Hub", desc: "Aro closes the loop", icon: BarChart3, route: "/auaha/analytics" },
];

const AGENTS = [
  { name: "Studio Director", role: "Orchestrator", icon: Zap, status: "active" },
  { name: "Rautaki", role: "Strategy", icon: Megaphone, status: "active" },
  { name: "Kōrero", role: "Content", icon: PenTool, status: "active" },
  { name: "Mana Kupu", role: "Compliance", icon: Palette, status: "monitoring" },
  { name: "Toi", role: "Creative", icon: Image, status: "active" },
  { name: "Whakahaere", role: "Campaigns", icon: Calendar, status: "active" },
  { name: "Whaikōrero-Ā-Hoko", role: "Lead gen", icon: Activity, status: "standby" },
  { name: "Aro", role: "Analytics", icon: BarChart3, status: "monitoring" },
  { name: "Reo Whare", role: "Internal comms", icon: Timer, status: "standby" },
];

const usageData = [
  { name: "Lovable AI", value: 42, color: "#5AADA0" },
  { name: "Fal.ai", value: 28, color: "#F0D078" },
  { name: "Runway", value: 15, color: "#E1306C" },
  { name: "TNZ SMS", value: 10, color: "#3A6A9C" },
  { name: "Other", value: 5, color: "#666" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" } }),
};

function GlassCard({ children, className = "", accent = false, onClick, glow = false }: { children: React.ReactNode; className?: string; accent?: boolean; onClick?: () => void; glow?: boolean }) {
  return (
    <div onClick={onClick}
      className={`relative rounded-2xl border backdrop-blur-xl transition-all duration-300 ${onClick ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg" : ""} ${className}`}
      style={{
        background: "rgba(15, 15, 26, 0.65)",
        borderColor: accent ? `${ACCENT}33` : "rgba(255,255,255,0.08)",
        boxShadow: glow ? `0 0 40px ${ACCENT}08, inset 0 1px 0 rgba(255,255,255,0.05)` : "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}>
      {children}
    </div>
  );
}

export default function AuahaDashboard() {
  const navigate = useNavigate();
  const { data: metrics } = useAuahaDashboardMetrics();
  const { data: recentItems } = useRecentContentItems(5);
  const { data: campaigns } = useAuahaCampaigns();

  const pipelineCounts = metrics?.pipelineCounts || {};
  const totalContent = metrics?.contentCount || 0;
  const totalCampaigns = metrics?.campaignCount || 0;
  const totalAssets = metrics?.assetCount || 0;

  const METRICS = [
    { label: "Content Items", value: String(totalContent), change: totalContent > 0 ? "live" : "—", up: totalContent > 0, icon: FileText, gradient: "from-emerald-500/20 to-teal-500/10" },
    { label: "Campaigns", value: String(totalCampaigns), change: totalCampaigns > 0 ? "active" : "—", up: totalCampaigns > 0, icon: Megaphone, gradient: "from-amber-500/20 to-orange-500/10" },
    { label: "Creative Assets", value: String(totalAssets), change: totalAssets > 0 ? "generated" : "—", up: totalAssets > 0, icon: Image, gradient: "from-rose-500/20 to-pink-500/10" },
    { label: "Pipeline Items", value: String(Object.values(pipelineCounts).reduce((a, b) => a + b, 0)), change: "across stages", up: true, icon: Activity, gradient: "from-blue-500/20 to-indigo-500/10" },
  ];

  return (
    <KeteDashboardShell name="Auaha" subtitle="Creative & Media Intelligence" accentColor={ACCENT} accentLight="#FFE866" variant="standard">
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-8 lg:p-10"
        style={{
          background: "linear-gradient(135deg, rgba(240,208,120,0.08) 0%, rgba(15,15,26,0.9) 40%, rgba(90,173,160,0.06) 100%)",
          border: "1px solid rgba(240,208,120,0.12)",
        }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-[80px]" style={{ background: ACCENT }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 blur-[60px]" style={{ background: TEAL }} />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30` }}>
                <Sparkles className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <p className="text-white/40 text-xs uppercase tracking-[3px]" style={{ fontFamily: 'Lato, sans-serif' }}>assembl &gt; auaha</p>
            </div>
            <h1 className="text-white text-3xl lg:text-4xl font-light uppercase tracking-[5px] mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              Creative Command Centre
            </h1>
            <p className="text-white/45 text-sm max-w-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              9 symbiotic agents orchestrating your creative pipeline — from brief to publish, powered by Lovable AI, Fal.ai & Runway.
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400/80 text-xs font-medium">All systems live</span>
            </div>
            <span className="text-white/25 text-[10px] font-mono">{totalContent} items • {totalCampaigns} campaigns</span>
          </div>
        </div>
      </motion.div>

      {/* Row 1 — Metrics (LIVE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => (
          <motion.div key={m.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
            <GlassCard className="p-5 group hover:border-white/15 transition-all">
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${m.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}12` }}>
                    <m.icon className="w-4 h-4 text-white/50" />
                  </div>
                  <span className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${m.up ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/40 bg-white/5'}`}>
                    {m.up ? <TrendingUp className="w-3 h-3" /> : null}
                    {m.change}
                  </span>
                </div>
                <p className="text-white text-2xl font-light" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{m.value}</p>
                <p className="text-white/35 text-xs mt-1.5 uppercase tracking-wider">{m.label}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Row 2 — Pipeline (LIVE counts) */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <GlassCard glow className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4" style={{ color: ACCENT }} />
              <h3 className="text-white/70 text-xs uppercase tracking-[3px] font-medium" style={{ fontFamily: 'Lato, sans-serif' }}>Creative Pipeline</h3>
            </div>
            <span className="text-[10px] text-white/25 bg-white/5 px-3 py-1 rounded-full">Live counts from your content items</span>
          </div>
          <div className="relative">
            <div className="absolute top-[22px] left-[40px] right-[40px] h-px" style={{ background: `linear-gradient(90deg, ${ACCENT}30, ${TEAL}30, ${ACCENT}30)` }} />
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {PIPELINE_STAGES.map((step, i) => (
                <motion.div key={step.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  className="flex flex-col items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/5 min-w-[80px] relative">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold relative z-10"
                    style={{ background: `${step.color}18`, color: step.color, border: `2px solid ${step.color}40`, boxShadow: `0 0 20px ${step.color}10` }}>
                    {pipelineCounts[step.key] || 0}
                  </div>
                  <span className="text-white/60 text-[10px] uppercase tracking-wider font-medium">{step.label}</span>
                  <span className="text-[8px] text-white/20 font-mono">{step.agent}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Row 3 — Quick Launch */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4" style={{ color: ACCENT }} />
          <h3 className="text-white/50 text-xs uppercase tracking-[3px]" style={{ fontFamily: 'Lato, sans-serif' }}>Quick Launch</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LAUNCH.map((item, i) => (
            <motion.div key={item.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
              <GlassCard className="p-5 group" onClick={() => navigate(item.route)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
                    <item.icon className="w-4.5 h-4.5" style={{ color: ACCENT }} />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-white text-sm font-medium mb-0.5">{item.label}</p>
                <p className="text-white/30 text-xs">{item.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Row 4 — Charts + Recent Activity (LIVE) */}
      <div className="grid lg:grid-cols-6 gap-4">
        {/* Reach chart */}
        <GlassCard className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white/60 text-xs uppercase tracking-[3px] font-medium" style={{ fontFamily: 'Lato, sans-serif' }}>Weekly Reach</h3>
            <span className="text-white/20 text-[10px] font-mono">Sample data — connect analytics</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="auahaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'rgba(15,15,26,0.95)', border: '1px solid rgba(240,208,120,0.2)', borderRadius: 12, color: '#fff', fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                formatter={(value: number) => [value.toLocaleString(), 'Reach']} />
              <Area type="monotone" dataKey="v" stroke={ACCENT} fill="url(#auahaGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* API Usage */}
        <GlassCard className="lg:col-span-1 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-3.5 h-3.5 text-white/30" />
            <h3 className="text-white/50 text-[10px] uppercase tracking-[2px] font-medium">API Spend</h3>
          </div>
          <p className="text-white text-xl font-light mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>$47.20</p>
          <p className="text-white/25 text-[10px] mb-4">this month</p>
          <ResponsiveContainer width="100%" height={80}>
            <PieChart>
              <Pie data={usageData} dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={36} paddingAngle={3} strokeWidth={0}>
                {usageData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {usageData.slice(0, 3).map((u) => (
              <div key={u.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: u.color }} />
                  <span className="text-white/40 text-[9px]">{u.name}</span>
                </div>
                <span className="text-white/50 text-[9px] font-mono">{u.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Activity — LIVE from content_items */}
        <GlassCard className="lg:col-span-2 p-6">
          <h3 className="text-white/60 text-xs uppercase tracking-[3px] font-medium mb-5" style={{ fontFamily: 'Lato, sans-serif' }}>Recent Activity</h3>
          <div className="space-y-4">
            {recentItems && recentItems.length > 0 ? (
              recentItems.map((item: any, i: number) => (
                <motion.div key={item.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  className="flex gap-3 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: ACCENT, opacity: 0.5 }} />
                    {i < (recentItems?.length || 0) - 1 && <div className="w-px flex-1 mt-1" style={{ background: `${ACCENT}15` }} />}
                  </div>
                  <div className="pb-1">
                    <p className="text-white/65 text-xs leading-relaxed group-hover:text-white/80 transition-colors">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-white/20 text-[10px] font-mono">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
                      {item.agent_attribution && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${ACCENT}10`, color: `${ACCENT}BB`, border: `1px solid ${ACCENT}15` }}>{item.agent_attribution}</span>
                      )}
                      <span className="text-[9px] px-2 py-0.5 rounded-full text-white/30 bg-white/5">{item.pipeline_stage}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-white/25 text-xs">No activity yet</p>
                <p className="text-white/15 text-[10px] mt-1">Create content in Copy Studio or Campaign Builder</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Row 5 — Agent Status */}
      <GlassCard glow className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4" style={{ color: ACCENT }} />
            <h3 className="text-white/60 text-xs uppercase tracking-[3px] font-medium" style={{ fontFamily: 'Lato, sans-serif' }}>Symbiotic Workforce</h3>
          </div>
          <span className="text-white/20 text-[10px] bg-white/5 px-3 py-1 rounded-full">Agents share context across every tool</span>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
          {AGENTS.map((a, i) => (
            <motion.div key={a.name} custom={i} initial="hidden" animate="visible" variants={fadeUp}
              className="flex flex-col items-center gap-2.5 p-4 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}12, ${ACCENT}06)`,
                    border: `1px solid ${ACCENT}25`,
                    boxShadow: a.status === 'active' ? `0 0 20px ${ACCENT}08` : 'none',
                  }}>
                  <a.icon className="w-5 h-5 transition-colors" style={{ color: a.status === 'active' ? ACCENT : `${ACCENT}66` }} />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0F0F1A] ${
                  a.status === 'active' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]' : a.status === 'monitoring' ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.3)]' : 'bg-white/20'
                }`} />
              </div>
              <span className="text-white/80 text-[10px] font-semibold tracking-widest">{a.name}</span>
              <span className="text-white/25 text-[9px]">{a.role}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-4">
        <SovereigntyPanel kete="auaha" accentColor="#F0D078" />
        <SovereigntySimulator kete="auaha" accentColor="#F0D078" />
      </div>

      <KeteDocUpload keteSlug="auaha" keteColor="#F0D078" keteName="Auaha — Creative & Media"
        docContext="Expect brand guidelines, creative briefs, media plans, campaign reports, analytics exports, and content calendars. Extract brand voice, colour palettes, and performance metrics." />

      <KeteBrainChat keteId="auaha" keteName="Auaha" keteNameEn="Creative" accentColor="#F0D078" />
    </KeteDashboardShell>
  );
}
