import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthSafe } from "@/hooks/useAuth";
import { User, ChevronDown, LogOut, CreditCard, Settings, Shield, Sun, Languages } from "lucide-react";
import { useHighContrast } from "@/components/chat/HighContrastProvider";
import { useLanguage } from "@/components/chat/TeReoProvider";

const roleBadge: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "hsl(var(--muted-foreground))" },
  starter: { label: "Starter", color: "hsl(43,100%,50%)" },
  pro: { label: "Pro", color: "hsl(153,100%,50%)" },
  business: { label: "Business", color: "hsl(189,100%,50%)" },
  admin: { label: "ADMIN", color: "hsl(0,84%,60%)" },
};

const AccountDropdown = () => {
  const auth = useAuthSafe();
  const user = auth?.user ?? null;
  const profile = auth?.profile ?? null;
  const role = auth?.role ?? null;
  const isAdmin = auth?.isAdmin ?? false;
  const signOut = auth?.signOut;
  const dailyMessageCount = auth?.dailyMessageCount ?? 0;
  const isPaid = auth?.isPaid ?? false;
  const dailyLimit = auth?.dailyLimit ?? 5;
  const { highContrast, toggleHighContrast } = useHighContrast();
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-full transition-all hover:-translate-y-px"
        style={{
          background: "#1F4D47",
          color: "#FAF6EF",
          boxShadow: "0 6px 18px -8px rgba(31,77,71,0.55)",
        }}
        aria-label="Sign in to your account"
      >
        <User size={12} aria-hidden="true" />
        Sign in
      </Link>
    );
  }

  const badge = roleBadge[role || "free"];
  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg border border-border hover:border-foreground/10 transition-colors"
      >
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: badge.color + "20" }}>
          {isAdmin ? <Shield size={10} style={{ color: badge.color }} /> : <User size={10} style={{ color: badge.color }} />}
        </div>
        <span className="text-foreground/80 max-w-[80px] truncate hidden sm:inline">{displayName}</span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: badge.color + "18", color: badge.color }}
        >
          {badge.label}
        </span>
        <ChevronDown size={12} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1 sm:bottom-auto sm:top-full sm:mt-1 sm:mb-0 w-56 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-card shadow-xl z-[10000] opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
          <div className="px-3 py-3 border-b border-border">
            <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            {!isPaid && !isAdmin && (
              <p className="text-[10px] mt-1.5" style={{ color: dailyMessageCount >= 8 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }}>
                {dailyLimit - dailyMessageCount} of {dailyLimit} free messages remaining today
              </p>
            )}
            {isAdmin && (
              <p className="text-[10px] mt-1.5 text-destructive font-medium">∞ Unlimited access</p>
            )}
          </div>

          <div className="py-1">
            {isAdmin && (
              <button
                onClick={() => { setOpen(false); navigate("/admin/dashboard"); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive/80 hover:text-destructive hover:bg-destructive/5 transition-colors"
              >
                <Shield size={12} /> Admin Dashboard
              </button>
            )}
            <button
              onClick={() => { setOpen(false); navigate("/dashboard"); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Settings size={12} /> My Account
            </button>
            <button
              onClick={() => { setOpen(false); navigate("/dashboard"); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <CreditCard size={12} /> My Plan
            </button>

            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
              aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
            >
              <Sun size={12} /> {highContrast ? "Standard contrast" : "High contrast"}
            </button>

            {/* Language Selector */}
            <button
              onClick={() => {
                const langs: Array<"en" | "mi" | "zh"> = ["en", "mi", "zh"];
                const idx = langs.indexOf(language as any);
                setLanguage(langs[(idx + 1) % langs.length]);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
              aria-label={`Current language: ${language === "en" ? "English" : language === "mi" ? "Te Reo Māori" : "简体中文"}`}
            >
              <Languages size={12} /> {language === "en" ? "Te Reo Māori" : language === "mi" ? "简体中文" : "English"}
            </button>

            <button
              onClick={() => { signOut?.(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive/80 hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;
