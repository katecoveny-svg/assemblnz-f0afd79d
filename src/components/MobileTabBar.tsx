import { Link, useLocation } from "react-router-dom";
import { Bot, CreditCard, LayoutDashboard, FileText, Palette } from "lucide-react";

const TABS = [
  { to: "/", label: "Agents", icon: Bot },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/content-hub", label: "Content", icon: FileText },
  { to: "/pricing", label: "Pricing", icon: CreditCard },
  { to: "/brand-guidelines", label: "Brand", icon: Palette },
];

const MobileTabBar = () => {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
      style={{
        borderTop: '1px solid hsl(228 10% 13% / 0.5)',
        background: 'hsl(228 14% 4% / 0.85)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
      }}
    >
      <div className="flex items-stretch justify-around h-14">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors duration-300"
              style={{ color: active ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.4)' }}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-body font-medium">{label}</span>
              {active && (
                <span
                  className="absolute top-0 w-8 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), transparent)' }}
                />
              )}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" style={{ background: 'hsl(228 14% 4% / 0.85)' }} />
    </nav>
  );
};

export default MobileTabBar;
