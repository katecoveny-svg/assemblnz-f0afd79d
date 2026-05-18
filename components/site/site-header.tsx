"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { nav, navCta } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const PROOF_LINE = "Mahi that earns its proof.";

function openCommandPalette() {
  window.dispatchEvent(new Event("assembl:open-command"));
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

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-[rgba(157,140,125,0.14)] bg-[rgba(247,243,238,0.78)] backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex h-[72px] w-full max-w-none items-center justify-between gap-4 px-6 md:gap-6 md:px-10 xl:px-14 2xl:px-20">
        <div className="flex min-w-0 items-baseline gap-3">
          <Link
            href="/"
            aria-label="assembl — home"
            className="shrink-0 rounded-sm text-[32px] font-normal leading-none lowercase tracking-[-0.03em] text-[color:var(--text-primary)] transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 md:text-[38px]"
            style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Garamond, Georgia, serif' }}
          >
            assembl
          </Link>
          <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] lg:inline">
            {PROOF_LINE}
          </span>
        </div>
        <nav className="hidden items-center gap-7 md:flex xl:gap-8" aria-label="Primary">
          {nav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-sm text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2",
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] transition hover:bg-white/60 hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 focus-visible:bg-white/60 focus-visible:text-[color:var(--text-primary)] lg:hidden"
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>
          {/* Desktop: labeled search pill with explicit kbd hint */}
          <button
            type="button"
            onClick={openCommandPalette}
            className="hidden items-center gap-2 rounded-full border border-[rgba(35,33,31,0.14)] bg-white/45 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--assembl-pounamu)] hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 focus-visible:border-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--text-primary)] lg:inline-flex"
          >
            <Search className="h-3.5 w-3.5" aria-hidden />
            <span>Search</span>
            <kbd className="ml-1 rounded-sm border border-[rgba(35,33,31,0.12)] bg-white/60 px-1.5 py-0.5 font-mono text-[9px]">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
          <Link
            href="/login"
            className={cn(
              "hidden rounded-sm text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 md:inline",
              pathname === "/login"
                ? "text-[color:var(--text-primary)] font-medium"
                : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            )}
          >
            Sign in
          </Link>
          <Link
            href={navCta.href}
            className="hidden cta-primary md:inline-flex h-11 items-center px-6 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
          >
            {navCta.label}
          </Link>
          {/* Mobile: hamburger that opens the nav drawer. Desktop hides this. */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] transition hover:bg-white/60 hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 focus-visible:bg-white/60 focus-visible:text-[color:var(--text-primary)] md:hidden"
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
              className="text-[30px] font-normal leading-none lowercase tracking-[-0.03em] text-[color:var(--text-primary)]"
              style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Garamond, Georgia, serif' }}
              onClick={() => setMobileNavOpen(false)}
            >
              assembl
            </Link>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] transition hover:bg-white/60 hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 focus-visible:bg-white/60 focus-visible:text-[color:var(--text-primary)]"
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
                        "flex min-h-[56px] items-center border-b border-[rgba(35,33,31,0.08)] font-display text-2xl font-light tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)]",
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
                  className="flex min-h-[56px] items-center border-b border-[rgba(35,33,31,0.08)] font-display text-2xl font-light tracking-tight text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
                >
                  Sign in
                </Link>
              </li>
            </ul>
            <Link
              href={navCta.href}
              className="cta-primary mt-8 inline-flex h-12 items-center justify-center px-7 text-base"
            >
              {navCta.label}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
