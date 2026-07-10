"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { nav, navCta } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { AssemblWordmark } from "@/components/site/AssemblWordmark";

const PROOF_LINE = "Mahi that earns its proof.";

function openCommandPalette() {
  window.dispatchEvent(new Event("assembl:open-command"));
}

/** True on the public Assembling microsite routes, which carry their own
 * chrome. /assembling/admin (operator dashboard) keeps the standard site chrome. */
export function isDashMicrosite(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/assembling") return true;
  return pathname.startsWith("/assembling/") && !pathname.startsWith("/assembling/admin");
}

/** True on the agent marketplace (App Store-style surface), which ships its own
 * Dash-aligned chrome. The legacy /agents/pick fleet browser keeps the standard
 * site chrome. */
export function isAgentMarketplace(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/agents/pick") return false;
  // Pilot (the agent maker) uses the marketplace chrome.
  if (pathname === "/pilot" || pathname.startsWith("/pilot/")) return true;
  return pathname === "/agents" || pathname.startsWith("/agents/");
}

/** Atlas — the free AI literacy coach — and its /journey game scene are
 *  immersive standalone surfaces with their own chrome (locked canon
 *  2026-06-23). Suppress the global site nav. */
export function isAtlas(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/atlas" ||
    pathname.startsWith("/atlas/") ||
    pathname === "/journey" ||
    pathname.startsWith("/journey/")
  );
}

/** Echo — Kate's private founder co-pilot — is a full-screen chat with its own
 *  in-page header (it reuses the marketplace AgentChat). Suppress global chrome. */
export function isEcho(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/echo" || pathname.startsWith("/echo/");
}

/** Signed-out auth surfaces (/login, /start/signup, anything under /auth/*) ship
 *  their own canon chrome (AuthHeader/AuthFooter) with an always-clickable
 *  wordmark — see app/login/layout.tsx. Suppress the global site chrome there so
 *  we never double up or leak the old kete-cutout footer mark onto auth pages. */
export function isAuthSurface(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/login" ||
    pathname === "/start/signup" ||
    pathname.startsWith("/auth/")
  );
}

/** The /admin operator hub (marketplace era) ships its own canon top nav and
 *  is gated to admins — suppress the global public site chrome there. */
export function isAdminHub(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** The Happy Tails × Keeper pilot workspace is a branded tenant instance —
 *  it renders its own Happy Tails chrome and must never show assembl site
 *  chrome inside the tenant (assembl attribution stays on Mana Receipts +
 *  a subtle "powered by assembl" footer only). */
export function isHappyTailsKeeper(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/customers/happy-tails/keeper" ||
    pathname.startsWith("/customers/happy-tails/keeper/")
  );
}
/** Hosted per-customer demo/pilot workspaces (e.g. Air NZ × Dash at
 *  /customers/air-nz/dash) render their customer's own app chrome inside a
 *  phone frame — suppress the global assembl site chrome there. */
export function isCustomerWorkspace(pathname: string | null): boolean {
  if (!pathname) return false;
  // /for/[slug] is a demo magic link — the middleware rewrites it into a
  // /customers/* workspace while the URL bar keeps the personal link, so it
  // must suppress the global chrome exactly like the workspace it serves.
  if (pathname === "/for" || pathname.startsWith("/for/")) return true;
  // Fred's public Living Site landing page is white-labelled the same way —
  // it is the customer's website, not an assembl marketing page.
  if (pathname.startsWith("/living-site/fred")) return true;
  return pathname === "/customers" || pathname.startsWith("/customers/");
}

/** Alphassembl (/alphassembl + /alphassembl/chat) is a distinct consumer brand
 *  — navy + amber, DM Sans + Inter, its own header/footer. It must NOT show the
 *  global assembl marketing chrome (that would double the header and muddy the
 *  brand). */
export function isAlphassembl(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/alphassembl" || pathname.startsWith("/alphassembl/");
}

/** Assembl Bills — the consumer bill-OS product surface at /bills. Like
 *  Alphassembl it carries its own visual identity (warm paper + teal, DM Sans +
 *  Inter) and its own header/footer + advisor dock, so the global marketing
 *  chrome (and the concierge widget, which would collide with the advisor
 *  button) must be suppressed across the whole /bills subtree. */
export function isAssemblBills(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/bills" || pathname.startsWith("/bills/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isMac, setIsMac] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  // Close mobile nav when route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (mobileNavOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileNavOpen]);

  // The /assembling microsite (Assembling), the /agents marketplace, and the
  // homepage hero (locked canon 2026-06-23) ship their own nav; suppress the
  // global site chrome there. /assembling/admin and /agents/pick keep the standard
  // chrome.
  if (isDashMicrosite(pathname) || isAgentMarketplace(pathname) || isAtlas(pathname) || isEcho(pathname) || isAuthSurface(pathname) || isAdminHub(pathname) || isCustomerWorkspace(pathname) || isAlphassembl(pathname) || isAssemblBills(pathname) || pathname === "/") return null;

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-[#E7E4DA] bg-[rgba(251,250,246,0.78)] backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex h-[72px] w-full max-w-none items-center justify-between gap-3 px-5 md:gap-4 md:px-8 xl:px-12 2xl:px-20">
        <div className="flex min-w-0 items-baseline gap-3">
          <Link
            href="/"
            aria-label="assembl — home"
            className="shrink-0 rounded-sm text-[31px] leading-none tracking-[-0.03em] text-[color:var(--text-primary)] transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 xl:text-[36px]"
          >
            <AssemblWordmark />
          </Link>
          <span className="hidden whitespace-nowrap font-mono text-[10px] font-light uppercase tracking-[0.18em] text-[color:var(--text-secondary)] 2xl:inline">
            {PROOF_LINE}
          </span>
        </div>
        <nav className="hidden items-center gap-4 lg:flex xl:gap-5 2xl:gap-7" aria-label="Primary">
          {nav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-sm text-[14px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 xl:text-[15px]",
                  isActive
                    ? "text-[color:var(--text-primary)] font-medium"
                    : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] focus-visible:text-[color:var(--text-primary)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 md:gap-4 lg:gap-5">
          {/* Mobile + tablet: touch-friendly search icon. Opens the same
              CommandPalette dialog the desktop ⌘K pill triggers. */}
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Search"
            title="Search"
            aria-haspopup="dialog"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] transition hover:bg-white/60 hover:text-[color:var(--text-primary)] focus-visible:bg-white/60 focus-visible:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 lg:hidden"
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>
          {/* Desktop: labeled search pill with explicit kbd hint */}
          <button
            type="button"
            onClick={openCommandPalette}
            aria-haspopup="dialog"
            title={isMac ? "Search (⌘K)" : "Search (Ctrl K)"}
            className="hidden items-center gap-2 rounded-full border border-[rgba(35,33,31,0.14)] bg-white/45 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--assembl-pounamu)] hover:text-[color:var(--text-primary)] focus-visible:border-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 lg:inline-flex"
          >
            <Search className="h-3.5 w-3.5" aria-hidden />
            <span>Search</span>
            <kbd className="ml-1 rounded-sm border border-[rgba(35,33,31,0.12)] bg-white/60 px-1.5 py-0.5 font-mono text-[10px]">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
          <Link
            href="/login"
            aria-current={pathname === "/login" ? "page" : undefined}
            className={cn(
              "btn-ghost hidden h-11 items-center whitespace-nowrap px-4 text-[14px] lowercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 lg:inline-flex xl:text-[15px]",
              pathname === "/login" && "text-[color:var(--text-primary)] font-medium"
            )}
          >
            sign in
          </Link>
          <Link
            href={navCta.href}
            className="hidden cta-charcoal lg:inline-flex h-11 items-center whitespace-nowrap px-5 text-[14px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 xl:px-6 xl:text-[15px]"
          >
            {navCta.label}
          </Link>
          {/* Mobile: hamburger that opens the nav drawer. Desktop hides this. */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] transition hover:bg-white/60 hover:text-[color:var(--text-primary)] focus-visible:bg-white/60 focus-visible:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer — full-screen, large tap targets, safe-area aware */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[color:var(--assembl-paper)] md:hidden"
          style={{
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="flex h-16 items-center justify-between px-5">
            <Link
              href="/"
              aria-label="assembl — home"
              className="rounded-sm text-[30px] leading-none tracking-[-0.03em] text-[color:var(--text-primary)] transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              onClick={() => setMobileNavOpen(false)}
            >
              <AssemblWordmark />
            </Link>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] transition hover:bg-white/60 hover:text-[color:var(--text-primary)] focus-visible:bg-white/60 focus-visible:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <nav className="flex flex-1 flex-col px-5 pb-8 pt-4" aria-label="Mobile primary">
            <ul className="flex flex-col">
              {nav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex min-h-[56px] items-center border-b border-[rgba(35,33,31,0.08)] font-display text-2xl font-light tracking-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
                        isActive
                          ? "text-[color:var(--text-primary)]"
                          : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/login"
                  className="flex min-h-[56px] items-center border-b border-[rgba(35,33,31,0.08)] font-display text-2xl font-light lowercase tracking-tight text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
                >
                  sign in
                </Link>
              </li>
            </ul>
            <Link
              href={navCta.href}
              className="cta-charcoal mt-8 inline-flex h-12 items-center justify-center px-7 text-base"
            >
              {navCta.label}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
