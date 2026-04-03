import { TrendingUp, TrendingDown, Eye, Heart, FileText, DollarSign, Palette, PenTool, Image, Video, Mic, Megaphone, Calendar, BarChart3, Pipette, Timer, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const ACCENT = "#F0D078";

const sparkData = [
  { d: "Mon", v: 12400 }, { d: "Tue", v: 14200 }, { d: "Wed", v: 11800 },
  { d: "Thu", v: 16500 }, { d: "Fri", v: 18200 }, { d: "Sat", v: 22100 }, { d: "Sun", v: 19800 },
];

const METRICS = [
  { label: "Total Reach", value: "114,800", change: "+12.4%", up: true, icon: Eye },
  { label: "Engagement Rate", value: "4.7%", change: "+0.3%", up: true, icon: Heart },
  { label: "Content Published", value: "23/30", change: "77%", up: true, icon: FileText },
  { label: "Ad Spend", value: "$2,340", change: "$1,660 left", up: false, icon: DollarSign },
];

const PIPELINE_STEPS = [
  { label: "Brief", count: 3, color: "#F0D078" },
  { label: "Copy", count: 5, color: "#D4A843" },
  { label: "Design", count: 4, color: "#5AADA0" },
  { label: "Video", count: 2, color: "#3A7D6E" },
  { label: "Schedule", count: 6, color: "#3A6A9C" },
  { label: "Publish", count: 8, color: "#1A3A5C" },
  { label: "Analyse", count: 12, color: "#F0D078" },
  { label: "Iterate", count: 1, color: "#D4A843" },
];

const QUICK_LAUNCH = [
  { label: "Campaign Builder", desc: "Brief to publish", icon: Megaphone, route: "/auaha/campaign" },
  { label: "Copy Studio", desc: "Write & refine", icon: PenTool, route: "/auaha/copy" },
  { label: "Image Studio", desc: "Generate visuals", icon: Image, route: "/auaha/images" },
  { label: "Video Studio", desc: "Create video", icon: Video, route: "/auaha/video" },
  { label: "Podcast Studio", desc: "Record & publish", icon: Mic, route: "/auaha/podcast" },
  { label: "Ad Manager", desc: "Run campaigns", icon: Megaphone, route: "/auaha/ads" },
  { label: "Content Calendar", desc: "Schedule content", icon: Calendar, route: "/auaha/calendar" },
  { label: "Analytics Hub", desc: "Performance data", icon: BarChart3, route: "/auaha/analytics" },
];

const AGENTS = [
  { name: "PRISM", role: "Brand", icon: Palette, status: "monitoring" },
  { name: "MUSE", role: "Content", icon: PenTool, status: "active" },
  { name: "PIXEL", role: "Design", icon: Image, status: "active" },
  { name: "VERSE", role: "Audio", icon: Mic, status: "standby" },
  { name: "ECHO", role: "Video", icon: Video, status: "active" },
  { name: "FLUX", role: "Animation", icon: Video, status: "standby" },
  { name: "CHROMATIC", role: "Colour", icon: Pipette, status: "monitoring" },
  { name: "RHYTHM", role: "Production", icon: Timer, status: "active" },
];

const RECENT = [
  { time: "2 min ago", action: "MUSE drafted 4 LinkedIn posts for Q2 campaign", agents: ["MUSE"] },
  { time: "15 min ago", action: "PIXEL generated hero image for product launch", agents: ["PIXEL", "CHROMATIC"] },
  { time: "1 hr ago", action: "ECHO completed video edit for TikTok series", agents: ["ECHO", "FLUX"] },
  { time: "3 hrs ago", action: "RHYTHM scheduled 12 posts across 4 platforms", agents: ["RHYTHM"] },
  { time: "Yesterday", action: "PRISM flagged off-brand colour usage in ad creative", agents: ["PRISM", "CHROMATIC"] },
];

function GlassCard({ children, className = "", accent = false }: { children: React.ReactNode; className?: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border backdrop-blur-xl ${className}`}
      style={{
        background: "rgba(15, 15, 26, 0.7)",
        borderColor: accent ? `${ACCENT}33` : "rgba(255,255,255,0.1)",
      }}
    >
      {children}
    </div>
  );
}

export default function AuahaDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <p className="text-white/40 text-xs uppercase tracking-[3px] mb-1" style={{ fontFamily: 'Lato, sans-serif' }}>Assembl &gt; Auaha</p>
        <h1 className="text-white text-2xl lg:text-3xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>
          Creative Command Centre
        </h1>
        <p className="text-white/50 text-sm mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          8 agents working symbiotically across your creative pipeline
        </p>
      </div>

      {/* Row 1 — Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <GlassCard key={m.label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <m.icon className="w-4 h-4 text-white/40" />
              <span className={`text-xs flex items-center gap-1 ${m.up ? 'text-emerald-400' : 'text-white/40'}`}>
                {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {m.change}
              </span>
            </div>
            <p className="text-white text-2xl font-light" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{m.value}</p>
            <p className="text-white/40 text-xs mt-1">{m.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Row 2 — Pipeline */}
      <GlassCard accent className="p-6">
        <h3 className="text-white/60 text-xs uppercase tracking-[3px] mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>Creative Pipeline</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-shrink-0">
              <button
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg transition-all hover:bg-white/5 min-w-[80px]"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{ background: `${step.color}22`, color: step.color, border: `1px solid ${step.color}44` }}
                >
                  {step.count}
                </div>
                <span className="text-white/60 text-[10px] uppercase tracking-wider">{step.label}</span>
              </button>
              {i < PIPELINE_STEPS.length - 1 && <ArrowRight className="w-3 h-3 text-white/20 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Row 3 — Quick Launch */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_LAUNCH.map((item) => (
          <GlassCard key={item.label} className="p-5 cursor-pointer hover:border-[#F0D07844] transition-all group" accent>
            <button onClick={() => navigate(item.route)} className="w-full text-left">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${ACCENT}15` }}>
                <item.icon className="w-4 h-4" style={{ color: ACCENT }} />
              </div>
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
              <ArrowRight className="w-3 h-3 text-white/20 mt-2 group-hover:text-white/50 transition-colors" />
            </button>
          </GlassCard>
        ))}
      </div>

      {/* Row 4 — Reach chart + Recent activity */}
      <div className="grid lg:grid-cols-5 gap-4">
        <GlassCard className="lg:col-span-3 p-6">
          <h3 className="text-white/60 text-xs uppercase tracking-[3px] mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>Weekly Reach</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="auahaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'rgba(15,15,26,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(value: number) => [value.toLocaleString(), 'Reach']}
              />
              <Area type="monotone" dataKey="v" stroke={ACCENT} fill="url(#auahaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="lg:col-span-2 p-6">
          <h3 className="text-white/60 text-xs uppercase tracking-[3px] mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>Recent Activity</h3>
          <div className="space-y-3">
            {RECENT.map((r, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-1 rounded-full flex-shrink-0" style={{ background: ACCENT, opacity: 0.4 }} />
                <div>
                  <p className="text-white/70 text-xs leading-relaxed">{r.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/30 text-[10px]">{r.time}</span>
                    {r.agents.map((a) => (
                      <span key={a} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT }}>{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Row 5 — Agent Status */}
      <GlassCard className="p-6">
        <h3 className="text-white/60 text-xs uppercase tracking-[3px] mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>Symbiotic Workforce</h3>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {AGENTS.map((a) => (
            <div key={a.name} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/5 transition-all">
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}33` }}>
                  <a.icon className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#09090F] ${
                  a.status === 'active' ? 'bg-emerald-400' : a.status === 'monitoring' ? 'bg-amber-400' : 'bg-white/30'
                }`} />
              </div>
              <span className="text-white text-[10px] font-medium tracking-wider">{a.name}</span>
              <span className="text-white/30 text-[9px]">{a.role}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
