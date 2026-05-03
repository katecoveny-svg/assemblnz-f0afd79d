import Link from "next/link";

const NAV = [
  { href: "/#kete", label: "Kete" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(157,140,125,0.14)] bg-[rgba(247,243,238,0.78)] backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tight text-[color:var(--text-primary)]"
        >
          assembl
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
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
          href="/contact"
          className="cta-primary inline-flex h-10 items-center px-5 text-sm"
        >
          Book a demo
        </Link>
      </div>
    </header>
  );
}
