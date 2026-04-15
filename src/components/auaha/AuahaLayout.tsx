import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Palette, PenTool, Image, Video, Mic, Megaphone, Calendar, BarChart3, Globe, LayoutDashboard, Target, ChevronRight, Sparkles, Shield, BookOpen, Grid3X3, MonitorPlay, Eye, Zap, AudioLines, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandDnaProvider, useBrandDna } from "@/contexts/BrandDnaContext";

const AUAHA_NAV = [
  { group: "Workspace", items: [
    { to: "/auaha", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/auaha/brand-scan", label: "Brand Scanner", icon: Eye },
    { to: "/auaha/brand", label: "Brand Identity", icon: Fingerprint },
  ]},
  { group: "Create", items: [
    { to: "/auaha/generate", label: "Image Gen", icon: Sparkles },
    { to: "/auaha/speech-image", label: "Speech → Image", icon: AudioLines },
    { to: "/auaha/image-studio", label: "Image Studio", icon: Image },
    { to: "/auaha/video", label: "Video Producer", icon: Video },
    { to: "/auaha/loom", label: "Loom Studio", icon: MonitorPlay },
    { to: "/auaha/podcast", label: "Podcast Studio", icon: Mic },
    { to: "/auaha/copy", label: "Kia Ora Copywriter", icon: PenTool },
  ]},
  { group: "Manage", items: [
    { to: "/auaha/campaign", label: "Campaigns", icon: Megaphone },
    { to: "/auaha/ads", label: "Ad Manager", icon: Megaphone },
    { to: "/auaha/calendar", label: "Calendar", icon: Calendar },
    { to: "/auaha/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/auaha/gallery", label: "Gallery", icon: Grid3X3 },
  ]},
  { group: "Build", items: [
    { to: "/auaha/app-spark", label: "App SPARK", icon: Zap },
    { to: "/auaha/web", label: "Web Builder", icon: Globe },
  ]},
  { group: "System", items: [
    { to: "/auaha/audit", label: "Tā Audit", icon: Shield },
    { to: "/auaha/prompts", label: "Prompts", icon: BookOpen },
    { to: "/auaha/whaikorero", label: "Whaikōrero", icon: Target },
  ]},
];

const OBSIDIAN = "#0A0A0A";
const POUNAMU = "#00A86B";
const TEAL = "#00CED1";

function BrandDnaBadge() {
  try {
    const { brand } = useBrandDna();
    if (!brand) return null;
    return (
      <div className="mx-4 mb-3 px-3 py-2 rounded-lg text-[10px]" style={{
        background: `${POUNAMU}08`,
        border: `1px solid ${POUNAMU}15`,
      }}>
        <div className="flex items-center gap-1.5 text-white/50">
          <div className="w-2 h-2 rounded-full" style={{ background: brand.colors.primary }} />
          <span className="truncate">{brand.businessName}</span>
        </div>
        <span className="text-white/25 text-[9px]">Brand DNA active across all modules</span>
      </div>
    );
  } catch {
    return null;
  }
}

function AuahaLayoutInner() {
  const location = useLocation();
  const allItems = AUAHA_NAV.flatMap(g => g.items);

  return (
    <div className="min-h-screen flex" style={{ background: OBSIDIAN }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${OBSIDIAN}F8 0%, ${OBSIDIAN} 100%)`,
          borderColor: "rgba(255,255,255,0.04)",
        }}>
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none" style={{
          background: `radial-gradient(ellipse 80% 80% at 50% -20%, ${POUNAMU}08 0%, transparent 100%)`,
        }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: `linear-gradient(90deg, transparent, ${POUNAMU}40, ${TEAL}30, transparent)`,
        }} />

        {/* Logo */}
        <div className="relative p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: `linear-gradient(135deg, ${POUNAMU}20, ${TEAL}10)`,
              border: `1px solid ${POUNAMU}25`,
              boxShadow: `0 0 30px ${POUNAMU}08`,
            }}>
              <Palette className="w-5 h-5" style={{ color: POUNAMU }} />
            </div>
            <div>
              <h2 className="text-white/90 font-light uppercase tracking-[4px] text-[14px]" style={{ fontFamily: "Lato, sans-serif" }}>
                AUAHA NZ
              </h2>
              <p className="text-white/25 text-[10px] tracking-wide" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                Creative Suite
              </p>
            </div>
          </div>
        </div>

        <div className="mx-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)" }} />

        <BrandDnaBadge />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide space-y-4">
          {AUAHA_NAV.map((group) => (
            <div key={group.group}>
              <span className="block px-3 mb-1.5 text-[9px] uppercase tracking-[2px] text-white/20 font-medium" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                {group.group}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.end
                    ? location.pathname === item.to
                    : location.pathname === item.to || (location.pathname.startsWith(item.to + "/") && item.to !== "/auaha");

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={() => cn(
                        "group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200",
                        isActive ? "text-white" : "text-white/35 hover:text-white/60 hover:bg-white/[0.02]"
                      )}
                    >
                      {isActive && (
                        <>
                          <div className="absolute inset-0 rounded-lg" style={{
                            background: `linear-gradient(135deg, ${POUNAMU}10, ${TEAL}05)`,
                            border: `1px solid ${POUNAMU}12`,
                            boxShadow: `0 0 20px ${POUNAMU}05`,
                          }} />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full" style={{
                            background: `linear-gradient(180deg, ${POUNAMU}, ${TEAL})`,
                            boxShadow: `0 0 8px ${POUNAMU}60`,
                          }} />
                        </>
                      )}
                      <item.icon className="w-3.5 h-3.5 relative z-10 transition-colors" style={{ color: isActive ? POUNAMU : undefined }} />
                      <span className="relative z-10 flex-1" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{item.label}</span>
                      {isActive && <ChevronRight className="w-3 h-3 relative z-10" style={{ color: `${POUNAMU}50` }} />}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Status */}
        <div className="mx-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }} />
        <div className="p-4">
          <div className="flex items-center gap-2 text-[10px] text-white/20 tracking-wide">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: POUNAMU }} />
            <span>AUAHA NZ — All Systems Active</span>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b"
        style={{ background: `${OBSIDIAN}F7`, backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <Palette className="w-4 h-4" style={{ color: POUNAMU }} />
          <span className="text-white/80 text-[13px] uppercase tracking-[3px] font-light" style={{ fontFamily: "Lato, sans-serif" }}>AUAHA NZ</span>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
          {allItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] transition-all whitespace-nowrap",
                isActive ? "text-[#0A0A0A] font-medium" : "text-white/40 bg-white/[0.04]"
              )}
              style={({ isActive }) => isActive ? { background: POUNAMU, boxShadow: `0 0 16px ${POUNAMU}30` } : {}}
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

export default function AuahaLayout() {
  return <AuahaLayoutInner />;
}
