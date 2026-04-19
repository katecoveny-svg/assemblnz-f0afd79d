import React from "react";
import { TrendingUp, TrendingDown, Eye, Heart, FileText, DollarSign, Palette, PenTool, Image, Video, Mic, Megaphone, Calendar, BarChart3, Pipette, Timer, ArrowRight, CreditCard, Zap, Sparkles, Activity, MonitorPlay } from "lucide-react";
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
import KeteEvidencePackPanel from "@/components/shared/KeteEvidencePackPanel";
import { formatDistanceToNow } from "date-fns";

// Auaha palette — light theme
const ACCENT = "#E8A948";       // ochre (deeper for contrast on white)
const ACCENT_SOFT = "#F0D078";  // soft ochre tint
const TEAL = "#4AA5A8";         // pounamu teal
const TEXT_PRIMARY = "#1A1D29";
const TEXT_SECONDARY = "#3D4250";
const TEXT_MUTED = "#6B7280";
const TEXT_FAINT = "#9CA3AF";

const sparkData = [
  { d: "Mon", v: 12400 }, { d: "Tue", v: 14200 }, { d: "Wed", v: 11800 },
  { d: "Thu", v: 16500 }, { d: "Fri", v: 18200 }, { d: "Sat", v: 22100 }, { d: "Sun", v: 19800 },
];

const PIPELINE_STAGES = [
  { key: "brief", label: "Brief", color: "#E8A948", agent: "Rautaki" },
  { key: "copy", label: "Copy", color: "#D4A843", agent: "Kōrero" },
  { key: "compliance", label: "Compliance", color: "#4AA5A8", agent: "Mana Kupu" },
  { key: "design", label: "Design", color: "#3A7D6E", agent: "Toi" },
  { key: "schedule", label: "Schedule", color: "#5A7A9C", agent: "Whakahaere" },
  { key: "approve", label: "Approve", color: "#1A3A5C", agent: "Studio Director" },
  { key: "analyse", label: "Analyse", color: "#E8A948", agent: "Aro" },
];

const QUICK_LAUNCH = [
  { label: "Campaign Brief", desc: "Rautaki sequences the team", icon: Megaphone, route: "/auaha/campaign" },
  { label: "Copy Studio", desc: "Kōrero drafts sharp copy", icon: PenTool, route: "/auaha/copy" },
  { label: "Image Studio", desc: "Toi + Fal.ai generation", icon: Image, route: "/auaha/image-studio" },
  { label: "Video Studio", desc: "Toi visual production", icon: Video, route: "/auaha/video" },
  { label: "Loom Studio", desc: "Record & embed walkthroughs", icon: MonitorPlay, route: "/auaha/loom" },
  { label: "Podcast Studio", desc: "Record with AI co-host", icon: Mic, route: "/auaha/podcast" },
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
  { name: "Lovable AI", value: 42, color: "#4AA5A8" },
  { name: "Fal.ai", value: 28, color: "#E8A948" },
  { name: "Runway", value: 15, color: "#C85A54" },
  { name: "TNZ SMS", value: 10, color: "#5A7A9C" },
  { name: "Other", value: 5, color: "#9CA3AF" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" } }),
};

/**
 * Light glass card — white surface, soft shadow, charcoal text.
 * Mouse-follow ochre highlight.
 */
function GlassCard({ children, className = "", accent = false, onClick, glow = false }: { children: React.ReactNode; className?: string; accent?: boolean; onClick?: () => void; glow?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    ref.current.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };
  return (
    <div ref={ref} onClick={onClick} onMouseMove={handleMouseMove}
      className={`relative rounded-2xl transition-all duration-300 group/gc ${onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg" : "hover:-translate-y-0.5"} ${className}`}
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${accent ? `${ACCENT}40` : glow ? `${ACCENT}30` : "rgba(74,165,168,0.12)"}`,
        boxShadow: glow
          ? `0 4px 24px rgba(0,0,0,0.06), 0 0 30px ${ACCENT}15`
          : "0 4px 24px rgba(0,0,0,0.06)",
      }}>
      {/* Specular top edge */}
      <div className="absolute top-0 left-[10%] right-[10%] h-[1px] rounded-full opacity-50 group-hover/gc:opacity-90 transition-opacity duration-500"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)" }} />
      {glow && <div className="absolute top-0 left-4 right-4 h-px rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}80, transparent)` }} />}
      {/* Mouse-follow glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/gc:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), ${ACCENT}12, transparent 40%)` }} />
      <div className="relative">{children}</div>
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
    { label: "Content Items", value: String(totalContent), change: totalContent > 0 ? "live" : "—", up: totalContent > 0, icon: FileText },
    { label: "Campaigns", value: String(totalCampaigns), change: totalCampaigns > 0 ? "active" : "—", up: totalCampaigns > 0, icon: Megaphone },
    { label: "Creative Assets", value: String(totalAssets), change: totalAssets > 0 ? "generated" : "—", up: totalAssets > 0, icon: Image },
    { label: "Pipeline Items", value: String(Object.values(pipelineCounts).reduce((a, b) => a + b, 0)), change: "across stages", up: true, icon: Activity },
  ];

  return (
    <KeteDashboardShell name="Auaha" subtitle="Creative & Media Intelligence" accentColor={ACCENT} accentLight={ACCENT_SOFT} variant="standard">
      {/* Hero Header — light glass */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-8 lg:p-10"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(232,169,72,0.06) 50%, rgba(74,165,168,0.05) 100%)`,
          border: `1px solid ${ACCENT}30`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
        }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-25 blur-[80px]" style={{ background: ACCENT }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-20 blur-[60px]" style={{ background: TEAL }} />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}>
                <Sparkles className="w-5 h-5" style={{ color: "#B8860B" }} />
              </div>
              <p className="text-xs uppercase tracking-[3px]" style={{ fontFamily: 'Lato, sans-serif', color: TEXT_MUTED }}>assembl &gt; auaha</p>
            </div>
            <h1 className="text-3xl lg:text-4xl font-light uppercase tracking-[5px] mb-2" style={{ fontFamily: 'Lato, sans-serif', color: TEXT_PRIMARY }}>
              Creative Command Centre
            </h1>
            <p className="text-sm max-w-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: TEXT_SECONDARY }}>
              9 symbiotic agents orchestrating your creative pipeline — from brief to publish, powered by Lovable AI, Fal.ai & Runway.
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${TEAL}15`, border: `1px solid ${TEAL}30` }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: TEAL }} />
              <span className="text-xs font-medium" style={{ color: TEAL }}>All systems live</span>
            </div>
            <span className="text-[10px] font-mono" style={{ color: TEXT_FAINT }}>{totalContent} items • {totalCampaigns} campaigns</span>
          </div>
        </div>
      </motion.div>

      {/* Row 1 — Metrics (LIVE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => (
          <motion.div key={m.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
            <GlassCard className="p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                  <m.icon className="w-4 h-4" style={{ color: "#B8860B" }} />
                </div>
                <span className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full" style={{
                  color: m.up ? TEAL : TEXT_MUTED,
                  background: m.up ? `${TEAL}12` : "rgba(26,29,41,0.04)",
                }}>
                  {m.up ? <TrendingUp className="w-3 h-3" /> : null}
                  {m.change}
                </span>
              </div>
              <p className="text-2xl font-light" style={{ fontFamily: 'JetBrains Mono, monospace', color: TEXT_PRIMARY }}>{m.value}</p>
              <p className="text-xs mt-1.5 uppercase tracking-wider" style={{ color: TEXT_MUTED }}>{m.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Row 2 — Pipeline (LIVE counts) */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <GlassCard glow className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4" style={{ color: "#B8860B" }} />
              <h3 className="text-xs uppercase tracking-[3px] font-medium" style={{ fontFamily: 'Lato, sans-serif', color: TEXT_SECONDARY }}>Creative Pipeline</h3>
            </div>
            <span className="text-[10px] px-3 py-1 rounded-full" style={{ color: TEXT_MUTED, background: "rgba(26,29,41,0.04)" }}>Live counts from your content items</span>
          </div>
          <div className="relative">
            <div className="absolute top-[22px] left-[40px] right-[40px] h-px" style={{ background: `linear-gradient(90deg, ${ACCENT}50, ${TEAL}50, ${ACCENT}50)` }} />
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {PIPELINE_STAGES.map((step, i) => (
                <motion.div key={step.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  className="flex flex-col items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-black/[0.03] min-w-[80px] relative">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold relative z-10"
                    style={{ background: "#FFFFFF", color: step.color, border: `2px solid ${step.color}`, boxShadow: `0 0 20px ${step.color}25` }}>
                    {pipelineCounts[step.key] || 0}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: TEXT_SECONDARY }}>{step.label}</span>
                  <span className="text-[8px] font-mono" style={{ color: TEXT_FAINT }}>{step.agent}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Row 3 — Quick Launch */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4" style={{ color: "#B8860B" }} />
          <h3 className="text-xs uppercase tracking-[3px]" style={{ fontFamily: 'Lato, sans-serif', color: TEXT_SECONDARY }}>Quick Launch</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LAUNCH.map((item, i) => (
            <motion.div key={item.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
              <GlassCard className="p-5 group" onClick={() => navigate(item.route)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
                    <item.icon className="w-4 h-4" style={{ color: "#B8860B" }} />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-all" style={{ color: TEXT_FAINT }} />
                </div>
                <p className="text-sm font-medium mb-0.5" style={{ color: TEXT_PRIMARY }}>{item.label}</p>
                <p className="text-xs" style={{ color: TEXT_MUTED }}>{item.desc}</p>
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
            <h3 className="text-xs uppercase tracking-[3px] font-medium" style={{ fontFamily: 'Lato, sans-serif', color: TEXT_SECONDARY }}>Weekly Reach</h3>
            <span className="text-[10px] font-mono" style={{ color: TEXT_FAINT }}>Sample data — connect analytics</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="auahaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: TEXT_MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.98)', border: `1px solid ${ACCENT}40`, borderRadius: 12, color: TEXT_PRIMARY, fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: TEXT_SECONDARY }}
                formatter={(value: number) => [value.toLocaleString(), 'Reach']} />
              <Area type="monotone" dataKey="v" stroke={ACCENT} fill="url(#auahaGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* API Usage */}
        <GlassCard className="lg:col-span-1 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />
            <h3 className="text-[10px] uppercase tracking-[2px] font-medium" style={{ color: TEXT_SECONDARY }}>API Spend</h3>
          </div>
          <p className="text-xl font-light mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', color: TEXT_PRIMARY }}>$47.20</p>
          <p className="text-[10px] mb-4" style={{ color: TEXT_FAINT }}>this month</p>
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
                  <span className="text-[9px]" style={{ color: TEXT_MUTED }}>{u.name}</span>
                </div>
                <span className="text-[9px] font-mono" style={{ color: TEXT_SECONDARY }}>{u.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Activity — LIVE from content_items */}
        <GlassCard className="lg:col-span-2 p-6">
          <h3 className="text-xs uppercase tracking-[3px] font-medium mb-5" style={{ fontFamily: 'Lato, sans-serif', color: TEXT_SECONDARY }}>Recent Activity</h3>
          <div className="space-y-4">
            {recentItems && recentItems.length > 0 ? (
              recentItems.map((item: any, i: number) => (
                <motion.div key={item.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  className="flex gap-3 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: ACCENT }} />
                    {i < (recentItems?.length || 0) - 1 && <div className="w-px flex-1 mt-1" style={{ background: `${ACCENT}30` }} />}
                  </div>
                  <div className="pb-1">
                    <p className="text-xs leading-relaxed transition-colors" style={{ color: TEXT_PRIMARY }}>{item.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-mono" style={{ color: TEXT_FAINT }}>
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
                      {item.agent_attribution && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${ACCENT}15`, color: "#B8860B", border: `1px solid ${ACCENT}30` }}>{item.agent_attribution}</span>
                      )}
                      <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ color: TEXT_MUTED, background: "rgba(26,29,41,0.05)" }}>{item.pipeline_stage}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-xs" style={{ color: TEXT_MUTED }}>No activity yet</p>
                <p className="text-[10px] mt-1" style={{ color: TEXT_FAINT }}>Create content in Copy Studio or Campaign Builder</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Row 5 — Agent Status */}
      <GlassCard glow className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4" style={{ color: "#B8860B" }} />
            <h3 className="text-xs uppercase tracking-[3px] font-medium" style={{ fontFamily: 'Lato, sans-serif', color: TEXT_SECONDARY }}>Symbiotic Workforce</h3>
          </div>
          <span className="text-[10px] px-3 py-1 rounded-full" style={{ color: TEXT_MUTED, background: "rgba(26,29,41,0.04)" }}>Agents share context across every tool</span>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
          {AGENTS.map((a, i) => (
            <motion.div key={a.name} custom={i} initial="hidden" animate="visible" variants={fadeUp}
              className="flex flex-col items-center gap-2.5 p-4 rounded-xl hover:bg-black/[0.03] transition-all cursor-pointer group">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}18, ${ACCENT}08)`,
                    border: `1px solid ${ACCENT}40`,
                    boxShadow: a.status === 'active' ? `0 2px 12px ${ACCENT}25` : 'none',
                  }}>
                  <a.icon className="w-5 h-5 transition-colors" style={{ color: a.status === 'active' ? "#B8860B" : `${ACCENT}` }} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                  style={{
                    border: "2px solid #FAFBFC",
                    background: a.status === 'active' ? TEAL : a.status === 'monitoring' ? "#E8A948" : "#9CA3AF",
                    boxShadow: a.status === 'active'
                      ? `0 0 6px ${TEAL}60`
                      : a.status === 'monitoring'
                        ? "0 0 6px rgba(232,169,72,0.5)"
                        : "none",
                  }}
                />
              </div>
              <span className="text-[10px] font-semibold tracking-widest text-center" style={{ color: TEXT_PRIMARY }}>{a.name}</span>
              <span className="text-[9px]" style={{ color: TEXT_MUTED }}>{a.role}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <SovereigntySimulator kete="auaha" accentColor={ACCENT} />

      <KeteEvidencePackPanel
        keteSlug="auaha"
        keteName="Auaha — Creative & Media"
        accentColor={ACCENT}
        agentId="prism"
        agentName="PRISM"
        packTemplates={[
          { label: "Brand Compliance Pack", description: "Brand guideline adherence evidence", packType: "brand-compliance-pack", complianceChecks: [
            { check: "Brand voice consistency verified", status: "pass" },
            { check: "Colour palette compliance", status: "pass" },
            { check: "ASA advertising standards", status: "pass" },
          ]},
          { label: "Content Audit Pack", description: "FTA 1986 · advertising claims audit", packType: "content-audit-pack", complianceChecks: [
            { check: "FTA 1986 — no misleading claims", status: "pass" },
            { check: "Cultural sensitivity (Kahu) reviewed", status: "pass" },
            { check: "Tā audit trail complete", status: "pass" },
          ]},
          { label: "Campaign Evidence Pack", description: "Full campaign compliance trail", packType: "campaign-evidence-pack", complianceChecks: [
            { check: "Privacy Act 2020 — consent for data use", status: "pass" },
            { check: "GDPR/Spam Act compliance", status: "pass" },
            { check: "Performance metrics documented", status: "pass" },
          ]},
        ]}
      />

      <KeteDocUpload keteSlug="auaha" keteColor={ACCENT} keteName="Auaha — Creative & Media"
        docContext="Expect brand guidelines, creative briefs, media plans, campaign reports, analytics exports, and content calendars. Extract brand voice, colour palettes, and performance metrics." />

      <KeteBrainChat keteId="auaha" keteName="Auaha" keteNameEn="Creative" accentColor={ACCENT} />
    </KeteDashboardShell>
  );
}
