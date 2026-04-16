import { Link, useLocation } from "react-router-dom";
import { Home, Layers, CreditCard, Phone } from "lucide-react";

const TABS = [
  { to: "/", label: "Platform", icon: Home, exact: true },
  { to: "/how-it-works", label: "How It Works", icon: Layers, exact: false },
  { to: "/pricing", label: "Pricing", icon: CreditCard, exact: false },
  { to: "/contact", label: "Contact", icon: Phone, exact: false },
];

const MobileTabBar = () => {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.9)',
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-stretch justify-around h-14">
        {TABS.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors duration-300"
              style={{ color: active ? '#3D4250' : '#9CA3AF' }}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-body font-medium">{label}</span>
              {active && (
                <span
                  className="absolute top-0 w-8 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, #4AA5A8, transparent)' }}
                />
              )}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" style={{ background: 'rgba(255,255,255,0.65)' }} />
    </nav>
  );
};

export default MobileTabBar;
