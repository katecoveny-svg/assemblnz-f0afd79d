import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { assemblMark } from "@/assets/brand";
import {
  LayoutDashboard, Users, Bot, FlaskConical, FileCheck2,
  Sparkles, Megaphone, PenTool, FolderOpen, FileText,
  Activity, Heart, Mail, MessageSquare, Shield, BookOpen,
  Gauge, ChevronRight, LogOut, Image, Film,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const GOLD = "#D4A843";
const POUNAMU = "#3A7D6E";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Operations",
    items: [
      { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/admin/dashboard#activity", label: "Activity", icon: Activity },
      { to: "/admin/health", label: "Health", icon: Heart },
    ],
  },
  {
    title: "Agents",
    items: [
      { to: "/admin/dashboard#agents", label: "Agent Directory", icon: Bot },
      { to: "/admin/test-lab", label: "Testing Lab", icon: FlaskConical },
      { to: "/admin/test-reports", label: "Test Results", icon: FileCheck2 },
    ],
  },
  {
    title: "Production",
    items: [
      { to: "/admin/dashboard#creative", label: "Creative Studio", icon: Sparkles },
      { to: "/admin/dashboard#ads", label: "Ad Manager", icon: Megaphone },
      { to: "/admin/dashboard#copy", label: "Copy Studio", icon: PenTool },
      { to: "/admin/dashboard#images", label: "Image Studio", icon: Image },
    ],
  },
  {
    title: "Outputs",
    items: [
      { to: "/admin/dashboard#outputs", label: "Output Library", icon: FolderOpen },
      { to: "/admin/dashboard#evidence", label: "Evidence Packs", icon: FileText },
      { to: "/admin/dashboard#brand-assets", label: "Brand Assets", icon: Film },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/admin/dashboard#users", label: "Users & Roles", icon: Users },
      { to: "/admin/leads", label: "Leads", icon: Mail },
      { to: "/admin/compliance", label: "Compliance", icon: Shield },
      { to: "/admin/knowledge", label: "Knowledge Base", icon: BookOpen },
      { to: "/admin/messaging", label: "Messaging", icon: MessageSquare },
      { to: "/admin/analytics", label: "Analytics", icon: Gauge },
    ],
  },
];

export default function AdminCommandSidebar({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isHashActive = (to: string) => {
    if (to.includes("#")) {
      const hash = to.split("#")[1];
      return activeSection === hash;
    }
    return location.pathname === to;
  };

  const handleClick = (to: string, e: React.MouseEvent) => {
    if (to.includes("#")) {
      e.preventDefault();
      const hash = to.split("#")[1];
      onSectionChange(hash);
    }
  };

  return (
    <aside
      className="hidden lg:flex w-64 flex-col flex-shrink-0 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(8,12,24,0.97) 0%, rgba(6,10,20,0.99) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 100% 100% at 50% -30%, ${GOLD}08 0%, transparent 100%)`,
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}30, transparent)` }}
      />

      {/* Logo */}
      <div className="relative px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${GOLD}15, ${GOLD}05)`,
              border: `1px solid ${GOLD}20`,
              boxShadow: `0 4px 20px ${GOLD}08, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            <img src={assemblMark} alt="" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h2
              className="text-white/90 font-light uppercase tracking-[4px] text-[13px]"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              ASSEMBL
            </h2>
            <p
              className="text-[9px] tracking-[2px] uppercase"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(200,90,84,0.8)",
              }}
            >
              Command Centre
            </p>
          </div>
        </div>
      </div>

      <div
        className="mx-5 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
      />

      {/* Nav sections */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-hide">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p
              className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[3px]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isHashActive(item.to);
                return (
                  <a
                    key={item.to}
                    href={item.to.includes("#") ? item.to : undefined}
                    onClick={(e) => {
                      if (item.to.includes("#")) {
                        handleClick(item.to, e);
                      } else {
                        e.preventDefault();
                        navigate(item.to);
                      }
                    }}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] transition-all duration-200 cursor-pointer",
                      active
                        ? "text-foreground"
                        : "text-white/35 hover:text-white/60 hover:bg-white/[0.02]"
                    )}
                  >
                    {active && (
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
                          border: "1px solid rgba(255,255,255,0.06)",
                          boxShadow: `0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)`,
                        }}
                      />
                    )}
                    {active && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full"
                        style={{ background: GOLD, boxShadow: `0 0 10px ${GOLD}60` }}
                      />
                    )}
                    <item.icon
                      className="w-4 h-4 relative z-10 transition-colors"
                      style={{ color: active ? GOLD : undefined }}
                    />
                    <span
                      className="relative z-10 flex-1"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <ChevronRight
                        className="w-3 h-3 relative z-10"
                        style={{ color: `${GOLD}50` }}
                      />
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className="mx-5 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
      />

      {/* Footer */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center gap-2 text-[10px] text-white/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5AADA0]/80 animate-pulse" />
          <span>46 agents · 6 kete</span>
        </div>
        <button
          onClick={() => { signOut(); navigate("/"); }}
          className="flex items-center gap-2 text-[11px] text-white/25 hover:text-gray-500 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
