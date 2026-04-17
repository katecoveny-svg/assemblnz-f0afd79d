import { Link, useLocation } from "react-router-dom";
import { Home, Layers, CreditCard, Phone, Sparkles } from "lucide-react";
import { useAuthSafe } from "@/hooks/useAuth";

const PUBLIC_TABS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/how-it-works", label: "Start", icon: Layers, exact: false },
  { to: "/pricing", label: "Pricing", icon: CreditCard, exact: false },
  { to: "/contact", label: "Contact", icon: Phone, exact: false },
];

const MobileTabBar = () => {
  const { pathname } = useLocation();
  const auth = useAuthSafe();
  const isAdmin = auth?.isAdmin ?? false;

  const openPalette = () => window.dispatchEvent(new Event("assembl:openCommand"));

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
      <div className="flex items-stretch justify-around h-14 relative">
        {PUBLIC_TABS.slice(0, 2).map(({ to, label, icon: Icon, exact }) => {
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
            </Link>
          );
        })}

        {/* Center "Ask" — admins open the command palette, public users go to Pricing */}
        {isAdmin ? (
          <button
            onClick={openPalette}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 -mt-4"
            aria-label="Open command palette"
          >
            <span
              className="flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "linear-gradient(145deg, #FFFFFF, #F4F5F7)",
                border: "1px solid rgba(58,125,110,0.18)",
                boxShadow:
                  "0 6px 16px rgba(58,125,110,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                color: "#3A7D6E",
              }}
            >
              <Sparkles size={20} strokeWidth={1.75} />
            </span>
            <span className="text-[10px] font-body font-medium" style={{ color: "#3A7D6E" }}>Ask</span>
          </button>
        ) : (
          <Link
            to="/pricing"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors duration-300"
            style={{ color: pathname.startsWith("/pricing") ? '#3D4250' : '#9CA3AF' }}
          >
            <CreditCard size={18} strokeWidth={pathname.startsWith("/pricing") ? 2 : 1.5} />
            <span className="text-[10px] font-body font-medium">Pricing</span>
          </Link>
        )}

        {PUBLIC_TABS.slice(isAdmin ? 2 : 3).map(({ to, label, icon: Icon, exact }) => {
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
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" style={{ background: 'rgba(255,255,255,0.65)' }} />
    </nav>
  );
};

export default MobileTabBar;
