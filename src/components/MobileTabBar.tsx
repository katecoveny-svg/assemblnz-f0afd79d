import { Link, useLocation } from "react-router-dom";
import { Bot, CreditCard, Code2, LayoutDashboard, FileText } from "lucide-react";

const TABS = [
  { to: "/", label: "Team", icon: Bot },
  { to: "/content-hub", label: "Strategy", icon: FileText },
  { to: "/pricing", label: "Pricing", icon: CreditCard },
  { to: "/dashboard", label: "Intelligence", icon: LayoutDashboard },
];

const MobileTabBar = () => {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t"
      style={{
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(9, 9, 15, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-stretch justify-around h-14">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors"
              style={{ color: active ? '#E4E4EC' : 'rgba(255,255,255,0.3)' }}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-jakarta font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for phones with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" style={{ background: 'rgba(9, 9, 15, 0.92)' }} />
    </nav>
  );
};

export default MobileTabBar;
