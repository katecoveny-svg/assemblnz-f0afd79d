import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * PublicRouteGuard
 *
 * Restricts access to legacy / unlinked pages so they only resolve for admins,
 * and keeps the app subdomain from rendering tenant-specific demos before a
 * visitor has signed in.
 * Anything outside the canonical public allowlist (BrandNav, BrandFooter,
 * MobileTabBar, plus auth/onboarding/sharing/utility surfaces) bounces
 * non-admin visitors to /admin?from=<path>.
 *
 * Routing layer only — no business logic.
 */

// Exact paths that anyone (signed-in or not) may visit.
const PUBLIC_EXACT = new Set<string>([
  "/",
  "/next",
  "/how-it-works",
  "/pricing",
  "/about",
  "/founder",
  "/contact",
  "/showcase",
  "/migration",
  "/developers",
  "/status",
  "/evidence",
  "/data-sovereignty",
  "/security",
  "/privacy",
  "/terms",
  "/cookies",
  "/disclaimer",
  "/data-privacy",
  "/capabilities",
  "/roi",
  "/simulator",
  "/agents",
  "/hui",
  "/platform",
  "/learn",
  "/brand-guidelines",
  "/proposal",
  "/invest",
  "/dashboard",
  "/workspace",
  "/my-apps",
  "/command",
  "/onboarding",
  "/welcome",
  "/start",
  "/auth",
  "/login",
  "/signup",
  "/embed",
  "/kete",
  "/voyage",
  "/voyage/plan",
  "/voyage/command",
  "/voyage/italy",
  "/voyage/wanaka",
  "/aaaip",
  "/demos",
  // Kete landing pages
  "/manaaki",
  "/waihanga",
  "/waihanga/about",
  "/auaha",
  "/auaha/about",
  "/arataki",
  "/pikau",
  "/hoko",
  "/ako",
  "/toro",
]);

// Path prefixes (with trailing slash) that anyone may visit, including all subpaths.
const PUBLIC_PREFIXES: string[] = [
  "/admin", // login + entire admin tree
  "/demos/",
  "/aaaip/",
  "/embed/",
  "/sample/",
  "/evidence/share/",
  "/sign/",
  "/care/",
  "/chat/",
  "/agents/",
  "/app/",
  "/apps/",
  "/kete/",
  "/operator/",
  "/start/",
  "/workspace/",
  // Kete sub-routes (dashboards + tools)
  "/manaaki/",
  "/waihanga/",
  "/auaha/",
  "/arataki/",
  "/pikau/",
  "/hoko/",
  "/ako/",
  "/toro/",
];

const APP_HOSTNAMES = new Set(["app.assembl.co.nz"]);

const APP_HOST_ANONYMOUS_EXACT = new Set<string>([
  "/admin",
  "/auth",
  "/login",
  "/signup",
]);

const APP_HOST_ANONYMOUS_PREFIXES: string[] = [
  "/admin/",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix));
}

function isAppHost(): boolean {
  if (typeof window === "undefined") return false;
  return APP_HOSTNAMES.has(window.location.hostname);
}

function isAnonymousAppHostPath(pathname: string): boolean {
  if (APP_HOST_ANONYMOUS_EXACT.has(pathname)) return true;
  return APP_HOST_ANONYMOUS_PREFIXES.some((prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix));
}

function WorkspaceSignInGate() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#183D35] flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl border border-[#2B6B57]/18 bg-white/80 p-8 shadow-[0_24px_80px_rgba(24,61,53,0.10)] backdrop-blur">
        <div className="mb-8 flex items-center justify-between gap-4">
          <a href="https://www.assembl.co.nz/" className="font-serif text-2xl tracking-[-0.02em] text-[#2B6B57]">
            assembl
          </a>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2B6B57]/20 bg-[#FAF7F2] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#2B6B57]">
            <ShieldCheck size={14} aria-hidden="true" />
            Workspace gate
          </div>
        </div>

        <p className="mb-3 font-mono text-[12px] uppercase tracking-[0.08em] text-[#2B6B57]/70">
          app.assembl.co.nz
        </p>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-[-0.02em] text-[#183D35] md:text-5xl">
          Sign in to your workspace.
        </h1>
        <p className="mt-5 text-base leading-7 text-[#183D35]/72 md:text-lg md:leading-8">
          This subdomain is for active Assembl workspaces. If you were looking for the public site, head back to the marketing home.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2B6B57] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#235846]"
          >
            Sign in
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a
            href="https://www.assembl.co.nz/"
            className="inline-flex items-center justify-center rounded-full border border-[#2B6B57]/25 px-5 py-3 text-sm font-semibold text-[#2B6B57] transition hover:border-[#2B6B57]/50"
          >
            Visit the public site
          </a>
        </div>
      </section>
    </main>
  );
}

interface PublicRouteGuardProps {
  children: ReactNode;
}

export const PublicRouteGuard = ({ children }: PublicRouteGuardProps) => {
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();

  if (isAppHost() && !isAnonymousAppHostPath(location.pathname)) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center text-foreground/60">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      );
    }

    if (!user) {
      return <WorkspaceSignInGate />;
    }
  }

  if (isPublicPath(location.pathname)) {
    return <>{children}</>;
  }

  // Non-public path — only admins may proceed.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground/60">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  const fromParam = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/admin?from=${fromParam}`} replace />;
};
