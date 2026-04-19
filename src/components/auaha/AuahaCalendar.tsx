import { Calendar as CalIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

const ACCENT = "#A8DDDB";
const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#E1306C", Facebook: "#1877F2", LinkedIn: "#0A66C2", TikTok: "#000000",
  YouTube: "#FF0000", X: "#666666", Email: "#5AADA0", Blog: "#4AA5A8",
};

const DEMO_POSTS = [
  { day: 3, platform: "Instagram", title: "Product launch carousel", status: "scheduled" },
  { day: 3, platform: "LinkedIn", title: "Industry insights thread", status: "published" },
  { day: 5, platform: "TikTok", title: "Behind the scenes", status: "draft" },
  { day: 7, platform: "Email", title: "Newsletter: April update", status: "scheduled" },
  { day: 8, platform: "Facebook", title: "Customer spotlight", status: "draft" },
  { day: 10, platform: "Instagram", title: "Reel: Quick tips", status: "scheduled" },
  { day: 12, platform: "YouTube", title: "Tutorial video", status: "draft" },
  { day: 14, platform: "LinkedIn", title: "Team feature", status: "scheduled" },
  { day: 18, platform: "Blog", title: "Monthly roundup", status: "draft" },
  { day: 21, platform: "Instagram", title: "Product demo", status: "draft" },
  { day: 25, platform: "Email", title: "Promo campaign", status: "scheduled" },
];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}>
      {children}
    </div>
  );
}

export default function AuahaCalendar() {
  const [month] = useState(new Date(2026, 3)); // April 2026
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#6B7280] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Content Calendar</p>
          <h1 className="text-foreground text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Content Calendar</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[#6B7280] hover:text-[#4A5160]"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-foreground text-sm font-mono">April 2026</span>
          <button className="text-[#6B7280] hover:text-[#4A5160]"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <GlassCard className="p-4 overflow-x-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2 min-w-[700px]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-[#6B7280] text-xs text-center py-2 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 min-w-[700px]">
          {blanks.map((b) => <div key={`blank-${b}`} className="min-h-[100px] rounded-lg bg-white/[0.02]" />)}
          {days.map((day) => {
            const posts = DEMO_POSTS.filter((p) => p.day === day);
            return (
              <div key={day} className="min-h-[100px] rounded-lg bg-white/[0.03] p-2 hover:bg-white/[0.06] transition-all group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#6B7280] text-xs">{day}</span>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3 text-[#6B7280]" />
                  </button>
                </div>
                <div className="space-y-1">
                  {posts.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] truncate cursor-pointer hover:opacity-80"
                      style={{ background: `${PLATFORM_COLORS[p.platform]}22`, color: PLATFORM_COLORS[p.platform] || "#fff" }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PLATFORM_COLORS[p.platform] }} />
                      <span className="truncate">{p.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
          <div key={platform} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[#6B7280] text-[10px]">{platform}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
