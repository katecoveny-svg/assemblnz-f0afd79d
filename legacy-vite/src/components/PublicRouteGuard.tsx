import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * PublicRouteGuard
 *
 * Restricts access to legacy / unlinked pages so they only resolve for admins.
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

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix));
}

interface PublicRouteGuardProps {
  children: ReactNode;
}

export const PublicRouteGuard = ({ children }: PublicRouteGuardProps) => {
  const location = useLocation();
  const { isAdmin, loading } = useAuth();

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
