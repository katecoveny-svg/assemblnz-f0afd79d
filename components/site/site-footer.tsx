import Link from "next/link";
import { KETES } from "@/lib/kete";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[rgba(157,140,125,0.14)] bg-[rgba(247,243,238,0.6)]">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="font-display text-2xl font-semibold text-[color:var(--text-primary)]"
            >
              Assembl
            </Link>
            <p className="mt-3 max-w-xs text-sm text-[color:var(--text-secondary)]">
              Quiet intelligence for Aotearoa. Industry-specific kete that cite
              legislation and produce evidence packs.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Kete
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {KETES.map((k) => (
                <li key={k.slug}>
                  <Link
                    href={`/kete/${k.slug}`}
                    className="text-[color:var(--text-primary)] hover:text-[color:var(--assembl-soft-gold)]"
                  >
                    {k.name}
                    <span className="ml-2 text-xs text-[color:var(--text-secondary)]">
                      {k.industry}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Company
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-[color:var(--text-primary)] hover:text-[color:var(--assembl-soft-gold)]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[color:var(--text-primary)] hover:text-[color:var(--assembl-soft-gold)]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[color:var(--text-primary)] hover:text-[color:var(--assembl-soft-gold)]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Aotearoa
            </h4>
            <p className="mt-4 text-sm text-[color:var(--text-secondary)]">
              Built in New Zealand. Grounded in NZ legislation, Te Tiriti
              principles, and provenance-watermarked outputs.
            </p>
          </div>
        </div>

        <div className="section-divider mt-12" />

        <div className="mt-6 flex flex-col gap-2 text-xs text-[color:var(--text-secondary)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Assembl. All rights reserved.</p>
          <p className="font-mono">Mārama Whenua · v1.0</p>
        </div>
      </div>
    </footer>
  );
}
