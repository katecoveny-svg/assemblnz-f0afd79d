import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const PUBLIC_SITE_URL = "https://www.assembl.co.nz/";

/**
 * PublicRouteGuard
 *
 * Restricts access to legacy / unlinked pages so they only resolve for admins,
 * and keeps the app subdomain from rendering tenant-specific demos before a
 * visitor has signed in.
 *
 * App-host anonymous redirect (option B from the 2026-05-17 audit brief):
 * unauthenticated visitors landing on app.assembl.co.nz at anything other
 * than an explicit anonymous path (/login, /signup, /auth, /admin) are
 * hard-redirected to the marketing front door at www.assembl.co.nz. No
 * "closed door" gate; auth flows still render normally when arrived at
 * directly.
 *
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

/**
 * Renders a minimal spinner while the browser performs the hard redirect
 * to the marketing site. Keeps the page from flashing empty between the
 * React mount and the navigation.
 */
function PublicSiteRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.replace(PUBLIC_SITE_URL);
    }
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-[#2B6B57]"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      <span className="sr-only">Redirecting to assembl.co.nz</span>
    </div>
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
      return <PublicSiteRedirect />;
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
