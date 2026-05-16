"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, navCta } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const PROOF_LINE = "Mahi that earns its proof.";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(157,140,125,0.14)] bg-[rgba(247,243,238,0.78)] backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-6">
        <div className="flex min-w-0 items-baseline gap-3">
          <Link
            href="/"
            aria-label="assembl — home"
            className="shrink-0 rounded-sm text-[34px] font-normal leading-none lowercase tracking-[-0.03em] text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
            style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Garamond, Georgia, serif' }}
          >
            assembl
          </Link>
          <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] lg:inline">
            {PROOF_LINE}
          </span>
        </div>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-sm text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2",
                  isActive
                    ? "text-[color:var(--text-primary)] font-medium"
                    : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4 md:gap-5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('assembl:open-command'))}
            className="hidden rounded-full border border-[rgba(35,33,31,0.14)] bg-white/45 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--assembl-pounamu)] lg:inline-flex"
          >
            press ⌘K
          </button>
          {/* Sign in — takes signed-in users straight through to /app
              (middleware refreshes the session), anonymous users land on
              the magic-link form. */}
          <Link
            href="/login"
            className={cn(
              "rounded-sm text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2",
              pathname === "/login"
                ? "text-[color:var(--text-primary)] font-medium"
                : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            )}
          >
            Sign in
          </Link>
          <Link
            href={navCta.href}
            className="cta-primary inline-flex h-10 items-center px-5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
          >
            {navCta.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
