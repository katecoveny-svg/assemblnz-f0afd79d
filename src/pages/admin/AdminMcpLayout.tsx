import { ReactNode } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Loader2,
  LayoutDashboard,
  Boxes,
  Wrench,
  ScrollText,
  Building2,
  ArrowRightLeft,
  ShieldCheck,
  Shield,
  Sparkles,
  Receipt,
  Server,
  KeyRound,
} from "lucide-react";
import BrandNav from "@/components/BrandNav";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/admin/mcp/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/mcp/migrate", label: "Migrate", icon: ArrowRightLeft },
  { to: "/admin/mcp/toolsets", label: "Toolsets", icon: Boxes },
  { to: "/admin/mcp/tools", label: "Tools", icon: Wrench },
  { to: "/admin/mcp/policy", label: "Policy", icon: ShieldCheck },
  { to: "/admin/mcp/logs", label: "Logs", icon: ScrollText },
  { to: "/admin/mcp/customers", label: "Customers", icon: Building2 },
  { to: "/admin/mcp/billing", label: "Billing", icon: Receipt },
  { to: "/admin/mcp/security", label: "Security", icon: Shield },
  { to: "/admin/mcp/housekeeping", label: "Housekeeping", icon: Sparkles },
  { to: "/admin/mcp/server", label: "Server", icon: Server },
  { to: "/admin/api-keys", label: "API Keys", icon: KeyRound },
];

export default function AdminMcpLayout({ children }: { children?: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground/60">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin" state={{ from: location.pathname }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>MCP Admin · Assembl</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <BrandNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.32em] text-foreground/55">Admin</p>
          <h1 className="font-display font-light uppercase tracking-[0.06em] text-3xl text-foreground mt-1">
            MCP Server v2
          </h1>
        </header>

        <nav className="mb-6 flex flex-wrap gap-1 rounded-xl bg-foreground/[0.04] border border-foreground/10 p-1 w-fit">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm transition",
                  isActive
                    ? "bg-white text-foreground shadow-sm"
                    : "text-foreground/65 hover:text-foreground hover:bg-white/60",
                ].join(" ")
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-6">{children ?? <Outlet />}</div>
      </div>
    </div>
  );
}
