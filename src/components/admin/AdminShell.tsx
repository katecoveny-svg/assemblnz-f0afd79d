/**
 * AdminShell — shared Mārama-branded wrapper for all admin pages.
 * Provides the whāriki background, branded header, and consistent typography.
 */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { assemblMark } from "@/assets/brand";
import { Button } from "@/components/ui/button";

interface AdminShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  /** Extra elements in header right side */
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Show back button */
  backTo?: string;
}

const AdminShell: React.FC<AdminShellProps> = ({ title, subtitle, icon, actions, children, backTo }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Whāriki weave background */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundImage: `
          linear-gradient(45deg, rgba(58,125,110,0.04) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(58,125,110,0.04) 1px, transparent 1px),
          linear-gradient(45deg, rgba(212,168,83,0.02) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(212,168,83,0.02) 1px, transparent 1px)`,
        backgroundSize: "24px 24px, 24px 24px, 48px 48px, 48px 48px",
      }} />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        background: "radial-gradient(ellipse 600px 400px at 20% 10%, rgba(58,125,110,0.06), transparent), radial-gradient(ellipse 500px 300px at 80% 90%, rgba(212,168,83,0.04), transparent)",
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 px-4 sm:px-6 py-3" style={{
        background: "rgba(14,20,34,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}>
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          {backTo && (
            <Button variant="ghost" size="icon" onClick={() => navigate(backTo)} className="shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}

          <Link to="/admin/dashboard" className="flex items-center gap-2 shrink-0">
            <img src={assemblMark} alt="Assembl" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(212,168,67,0.25)]" />
            <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}
              className="text-xs tracking-[3px] uppercase text-foreground hidden sm:inline">
              ASSEMBL
            </span>
          </Link>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider"
            style={{ background: "rgba(200,90,84,0.12)", color: "#C85A54" }}>
            <Shield size={9} /> ADMIN
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {icon}
              <div className="min-w-0">
                <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}
                  className="text-base sm:text-lg tracking-[2px] uppercase text-foreground truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    className="text-[11px] text-muted-foreground truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminShell;
