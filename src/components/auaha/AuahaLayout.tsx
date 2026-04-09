import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Palette, PenTool, Image, Video, Mic, Megaphone, Calendar, BarChart3, Fingerprint, Globe, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const AUAHA_NAV = [
  { to: "/auaha", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/auaha/campaign", label: "Campaigns", icon: Megaphone },
  { to: "/auaha/copy", label: "Copy Studio", icon: PenTool },
  { to: "/auaha/image-studio", label: "Image Studio", icon: Image },
  { to: "/auaha/video", label: "Video Studio", icon: Video },
  { to: "/auaha/podcast", label: "Podcast Studio", icon: Mic },
  { to: "/auaha/ads", label: "Ad Manager", icon: Megaphone },
  { to: "/auaha/calendar", label: "Calendar", icon: Calendar },
  { to: "/auaha/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/auaha/brand", label: "Brand Identity", icon: Fingerprint },
  { to: "/auaha/web", label: "Web Builder", icon: Globe },
];

const ACCENT = "#F0D078";

export default function AuahaLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#09090F] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-[rgba(15,15,26,0.7)] backdrop-blur-xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}44` }}>
              <Palette className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h2 className="text-white font-light uppercase tracking-[3px] text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>AUAHA</h2>
              <p className="text-white/50 text-xs" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Creative Intelligence</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {AUAHA_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-[rgba(240,208,120,0.15)] text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" style={{ color: location.pathname === item.to || (item.end && location.pathname === item.to) ? ACCENT : undefined }} />
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/30">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>8 agents active</span>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[rgba(9,9,15,0.95)] backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Palette className="w-5 h-5" style={{ color: ACCENT }} />
          <span className="text-white text-sm uppercase tracking-[3px] font-light">AUAHA</span>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
          {AUAHA_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap",
                isActive ? "text-black font-medium" : "text-white/50 bg-white/5"
              )}
              style={({ isActive }) => isActive ? { background: ACCENT } : {}}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-24">
        <Outlet />
      </main>
    </div>
  );
}
