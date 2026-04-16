import { BarChart3, TrendingUp, Eye, Heart, MousePointer, Users, Sparkles } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";

const ACCENT = "#F0D078";

const reachData = [
  { d: "W1", ig: 8200, fb: 4100, li: 3200, tt: 6500 },
  { d: "W2", ig: 9100, fb: 4800, li: 3800, tt: 7200 },
  { d: "W3", ig: 11200, fb: 5200, li: 4100, tt: 8900 },
  { d: "W4", ig: 12800, fb: 5800, li: 4500, tt: 10200 },
];

const contentTypeData = [
  { type: "Image", engagement: 4200 },
  { type: "Video", engagement: 8900 },
  { type: "Carousel", engagement: 6100 },
  { type: "Text", engagement: 2100 },
  { type: "Reel", engagement: 11200 },
];

const METRICS = [
  { label: "Total Followers", value: "34,200", icon: Users, change: "+2.1%" },
  { label: "Monthly Reach", value: "114,800", icon: Eye, change: "+12.4%" },
  { label: "Engagement", value: "8,420", icon: Heart, change: "+8.7%" },
  { label: "Link Clicks", value: "1,240", icon: MousePointer, change: "+5.2%" },
  { label: "Avg Engagement Rate", value: "4.7%", icon: TrendingUp, change: "+0.3%" },
  { label: "Content ROI", value: "3.2x", icon: BarChart3, change: "+0.4x" },
];

const AI_INSIGHTS = [
  "Your video content gets 3.2× more engagement than images on Instagram",
  "Posts published between 7–8pm NZST perform 47% better",
  "Your audience responds most to posts about behind-the-scenes content",
  "LinkedIn carousels with data points outperform text posts by 2.8×",
];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}>
      {children}
    </div>
  );
}

export default function AuahaAnalytics() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <p className="text-[#6B7280] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Analytics</p>
        <h1 className="text-foreground text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Analytics Hub</h1>
        <p className="text-[#6B7280] text-sm mt-1">Unified performance across all platforms</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS.map((m) => (
          <GlassCard key={m.label} className="p-5">
            <div className="flex items-start justify-between mb-2">
              <m.icon className="w-4 h-4 text-[#6B7280]" />
              <span className="text-xs text-[#5AADA0]">{m.change}</span>
            </div>
            <p className="text-foreground text-xl font-light" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{m.value}</p>
            <p className="text-[#6B7280] text-xs mt-1">{m.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Reach chart */}
        <GlassCard className="p-6">
          <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px] mb-4">Reach by Platform</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={reachData}>
              <defs>
                <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E1306C" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#E1306C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ttGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F0D078" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F0D078" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(232,169,72,0.30)', color: '#1A1D29', boxShadow: '0 8px 32px rgba(26,29,41,0.12)', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="ig" stroke="#E1306C" fill="url(#igGrad)" strokeWidth={2} name="Instagram" />
              <Area type="monotone" dataKey="tt" stroke="#F0D078" fill="url(#ttGrad)" strokeWidth={2} name="TikTok" />
              <Area type="monotone" dataKey="li" stroke="#0A66C2" fill="none" strokeWidth={1.5} name="LinkedIn" />
              <Area type="monotone" dataKey="fb" stroke="#1877F2" fill="none" strokeWidth={1.5} name="Facebook" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Content type */}
        <GlassCard className="p-6">
          <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px] mb-4">Engagement by Content Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={contentTypeData}>
              <XAxis dataKey="type" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(232,169,72,0.30)', color: '#1A1D29', boxShadow: '0 8px 32px rgba(26,29,41,0.12)', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="engagement" radius={[4, 4, 0, 0]}>
                {contentTypeData.map((_, i) => <Cell key={i} fill={i === 4 ? ACCENT : `${ACCENT}55`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* AI Insights */}
      <GlassCard className="p-6" >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4" style={{ color: ACCENT }} />
          <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px]">AI Insights — MUSE + RHYTHM</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {AI_INSIGHTS.map((insight, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-[rgba(74,165,168,0.04)]">
              <div className="w-1 rounded-full flex-shrink-0" style={{ background: ACCENT, opacity: 0.4 }} />
              <p className="text-[#2A2F3D] text-sm">{insight}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
