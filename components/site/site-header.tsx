import Link from "next/link";
import { nav, navCta } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(157,140,125,0.14)] bg-[rgba(247,243,238,0.78)] backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="assembl — home"
          className="font-display text-2xl font-semibold lowercase tracking-tight text-[color:var(--text-primary)]"
        >
          assembl
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href={navCta.href}
          className="cta-primary inline-flex h-10 items-center px-5 text-sm"
        >
          {navCta.label}
        </Link>
      </div>
    </header>
  );
}
