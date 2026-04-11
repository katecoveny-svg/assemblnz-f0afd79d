import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Palette, PenTool, Image, Video, Mic, Megaphone, Calendar, BarChart3, Fingerprint, Globe, LayoutDashboard, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const AUAHA_NAV = [
  { to: "/auaha", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/auaha/whaikorero", label: "Whaikōrero", icon: Target },
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
      <aside className="hidden lg:flex w-60 flex-col border-r border-white/[0.06] relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(12,12,20,0.95) 0%, rgba(9,9,15,0.98) 100%)",
        }}>
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 80% at 50% -20%, ${ACCENT}10 0%, transparent 100%)` }} />
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}40, transparent)` }} />

        <div className="relative p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ACCENT}18, ${ACCENT}08)`, border: `1px solid ${ACCENT}25`, boxShadow: `0 0 20px ${ACCENT}08` }}>
              <Palette className="w-4 h-4" style={{ color: ACCENT }} />
            </div>
            <div>
              <h2 className="text-white/90 font-light uppercase tracking-[3px] text-[13px]" style={{ fontFamily: 'Lato, sans-serif' }}>Auaha</h2>
              <p className="text-white/30 text-[10px] tracking-wide" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Creative Studio</p>
            </div>
          </div>
        </div>

        <div className="mx-4 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)` }} />

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {AUAHA_NAV.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && item.to !== "/auaha";
            const active = item.end ? location.pathname === item.to : isActive;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive: navActive }) => cn(
                  "group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200",
                  navActive
                    ? "text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                )}
              >
                {({ isActive: navActive }) => (
                  <>
                    {navActive && (
                      <div className="absolute inset-0 rounded-lg" style={{
                        background: `linear-gradient(135deg, ${ACCENT}12, ${ACCENT}06)`,
                        border: `1px solid ${ACCENT}15`,
                        boxShadow: `0 0 24px ${ACCENT}06`,
                      }} />
                    )}
                    {navActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}60` }} />
                    )}
                    <item.icon className="w-3.5 h-3.5 relative z-10 transition-colors" style={{ color: navActive ? ACCENT : undefined }} />
                    <span className="relative z-10 flex-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.label}</span>
                    {navActive && <ChevronRight className="w-3 h-3 relative z-10" style={{ color: `${ACCENT}60` }} />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mx-4 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)` }} />
        <div className="p-4">
          <div className="flex items-center gap-2 text-[10px] text-white/25 tracking-wide">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
            <span>9 agents active</span>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-white/[0.06]"
        style={{ background: "rgba(9,9,15,0.97)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <Palette className="w-4 h-4" style={{ color: ACCENT }} />
          <span className="text-white/80 text-[13px] uppercase tracking-[3px] font-light" style={{ fontFamily: 'Lato, sans-serif' }}>Auaha</span>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
          {AUAHA_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] transition-all whitespace-nowrap",
                isActive ? "text-[#09090F] font-medium" : "text-white/40 bg-white/[0.04]"
              )}
              style={({ isActive }) => isActive ? { background: ACCENT, boxShadow: `0 0 16px ${ACCENT}30` } : {}}
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
