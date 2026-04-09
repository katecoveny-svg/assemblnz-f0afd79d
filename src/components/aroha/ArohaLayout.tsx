// ═══════════════════════════════════════════════════════════════
// Aroha — HR & Employment Law kete layout
//
// Sidebar layout matching the HangaLayout / AuahaLayout pattern.
// Renders an <Outlet /> for nested routes:
//   /aroha                → ArohaOverview (landing)
//   /aroha/contracts      → ArohaContracts
//   /aroha/onboarding     → ArohaOnboarding
//   /aroha/payroll        → ArohaPayroll
//   /aroha/recruitment    → ArohaRecruitment
//   /aroha/people         → ArohaPeopleCulture
//   /aroha/setup          → ArohaCompanySetup
//   /aroha/retention      → ArohaRetention
// ═══════════════════════════════════════════════════════════════

import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Heart,
  FileText,
  UserPlus,
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = "#FF6F91";

const AROHA_NAV = [
  { to: "/aroha", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/aroha/recruitment", label: "Recruitment", icon: UserPlus },
  { to: "/aroha/contracts", label: "Contracts", icon: FileText },
  { to: "/aroha/onboarding", label: "Onboarding", icon: Users },
  { to: "/aroha/payroll", label: "Payroll & Wages", icon: DollarSign },
  { to: "/aroha/people", label: "People & Culture", icon: Heart },
  { to: "/aroha/setup", label: "Company Setup", icon: Building2 },
  { to: "/aroha/retention", label: "Retention", icon: TrendingUp },
];

export default function ArohaLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#09090F] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-[rgba(15,15,26,0.7)] backdrop-blur-xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}44` }}
            >
              <Heart className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h2
                className="text-white font-light uppercase tracking-[3px] text-sm"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                AROHA
              </h2>
              <p
                className="text-white/50 text-xs"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                HR & Employment Law
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {AROHA_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-[rgba(255,111,145,0.15)] text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5",
                )
              }
            >
              <item.icon
                className="w-4 h-4"
                style={{
                  color:
                    location.pathname === item.to ||
                    (item.end && location.pathname === "/aroha")
                      ? ACCENT
                      : undefined,
                }}
              />
              <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-[10px] text-white/30 leading-relaxed">
            Aroha provides general guidance only — not legal advice. Always engage an employment
            lawyer for high-risk matters.
          </p>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[rgba(9,9,15,0.95)] backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Heart className="w-5 h-5" style={{ color: ACCENT }} />
          <span
            className="text-white text-sm uppercase tracking-[3px] font-light"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            AROHA
          </span>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
          {AROHA_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap",
                  isActive ? "text-black font-medium" : "text-white/50 bg-white/5",
                )
              }
              style={({ isActive }) => isActive ? { background: ACCENT } : undefined}
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
