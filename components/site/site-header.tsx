"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, navCta } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(157,140,125,0.14)] bg-[rgba(247,243,238,0.78)] backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="assembl — home"
          className="rounded-sm font-display text-2xl font-semibold lowercase tracking-tight text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
        >
          assembl
        </Link>
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
