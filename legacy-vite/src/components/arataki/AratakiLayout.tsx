import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Car, Wrench, Calendar, Package, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

const ACCENT = "#D5C0C8"; // Dusky Rose

const NAV = [
  { label: "Workshop jobs", to: "/arataki/dashboard", icon: Wrench, end: true },
  { label: "Loan cars", to: "/arataki/dashboard/loan-cars", icon: Car },
  { label: "WoF/CoF calendar", to: "/arataki/dashboard/wof-calendar", icon: Calendar },
  { label: "Parts & service", to: "/arataki/dashboard/parts", icon: Package },
];

export default function AratakiLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to);

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-[#D8C8B4]/30">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${ACCENT}55, ${ACCENT}22)` }}
          >
            <Car size={20} className="text-[#9D8C7D]" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-display text-lg text-[#6F6158] tracking-wide">ARATAKI</h2>
              <p className="font-body text-[10px] text-[#9D8C7D]">Automotive & fleet</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item.to, item.end);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all ${
                active
                  ? "bg-[#EEE7DE] text-[#6F6158] font-medium"
                  : "text-[#9D8C7D] hover:text-[#6F6158] hover:bg-[#EEE7DE]"
              }`}
            >
              <item.icon size={collapsed ? 18 : 16} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="hidden lg:block p-3 border-t border-[#D8C8B4]/30">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[#9D8C7D] hover:text-[#6F6158] hover:bg-[#EEE7DE] transition-colors text-xs font-body"
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Collapse</>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F3EE]">
      <aside
        className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300 bg-white/70 backdrop-blur-xl border-r border-[#D8C8B4]/30"
        style={{ width: collapsed ? 64 : 240 }}
      >
        <Sidebar />
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/80 backdrop-blur-md border border-[#D8C8B4]/30"
        aria-label="Open menu"
      >
        <Menu size={20} className="text-[#6F6158]" />
      </button>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 z-[70] w-[260px] bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#9D8C7D]"
            >
              <X size={18} />
            </button>
            <Sidebar />
          </aside>
        </>
      )}

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
