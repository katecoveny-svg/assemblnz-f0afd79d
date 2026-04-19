/**
 * AdminShell — Neumorphic light-mode wrapper for all admin pages.
 * Provides raised header, particles, weave bg, and consistent typography.
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
  actions?: React.ReactNode;
  children: React.ReactNode;
  backTo?: string;
}

const AdminShell: React.FC<AdminShellProps> = ({ title, subtitle, icon, actions, children, backTo }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative" style={{ background: "#FAFBFC", color: "#3D4250", ["--btn-glow" as string]: "58,125,110" } as React.CSSProperties}>
      {/* Whāriki weave background */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundImage: `
          linear-gradient(45deg, rgba(58,125,110,0.04) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(58,125,110,0.04) 1px, transparent 1px),
          linear-gradient(45deg, rgba(212,168,83,0.02) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(212,168,83,0.02) 1px, transparent 1px)`,
        backgroundSize: "24px 24px, 24px 24px, 48px 48px, 48px 48px",
      }} />

      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        opacity: 0.035,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
      }} />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        background: "radial-gradient(ellipse 600px 400px at 20% 10%, rgba(58,125,110,0.06), transparent), radial-gradient(ellipse 500px 300px at 80% 90%, rgba(212,168,83,0.04), transparent)",
      }} />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              background: i % 4 === 0 ? `rgba(212,168,83,0.3)` : `rgba(58,125,110,0.25)`,
              animation: `adminParticle ${14 + (i % 6) * 3}s ease-in-out infinite`,
              animationDelay: `${-(i * 1.3)}s`,
            }}
          />
        ))}
      </div>

      {/* Header — neumorphic raised */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 py-3" style={{
        background: "#FAFBFC",
        boxShadow: "0 4px 16px rgba(166,166,180,0.25), 0 1px 0 rgba(255,255,255,0.7)",
      }}>
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          {backTo && (
            <Button variant="ghost" size="icon" onClick={() => navigate(backTo)} className="shrink-0 text-[#3D4250]/60 hover:text-[#3D4250]">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}

          <Link to="/admin/dashboard" className="flex items-center gap-2 shrink-0">
            <img loading="lazy" decoding="async" src={assemblMark} alt="Assembl" className="w-6 h-6 object-contain" >
            <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}
              className="text-xs tracking-[3px] uppercase text-[#3D4250] hidden sm:inline">
              ASSEMBL
            </span>
          </Link>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider"
            style={{ background: "rgba(200,90,84,0.10)", color: "#C85A54" }}>
            <Shield size={9} /> ADMIN
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {icon}
              <div className="min-w-0">
                <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}
                  className="text-base sm:text-lg tracking-[2px] uppercase text-[#3D4250] truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    className="text-[11px] text-[#3D4250]/50 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </header>

      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[60]" style={{
        background: "linear-gradient(90deg, transparent 5%, rgba(58,125,110,0.3) 30%, #3A7D6E 50%, rgba(58,125,110,0.3) 70%, transparent 95%)",
        boxShadow: "0 0 12px rgba(58,125,110,0.15)",
      }} />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      <style>{`
        @keyframes adminParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          25% { transform: translateY(-25px) translateX(10px); opacity: 0.5; }
          50% { transform: translateY(-12px) translateX(-6px); opacity: 0.3; }
          75% { transform: translateY(-35px) translateX(8px); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default AdminShell;
