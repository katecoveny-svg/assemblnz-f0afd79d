import Link from "next/link";
import { KETES } from "@/lib/kete";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[rgba(157,140,125,0.14)] bg-[rgba(247,243,238,0.6)]">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex flex-col items-start gap-3">
              {/* Brand-mark — Evidence Vessel mark.
                  TODO (Claude Code): replace /images/brand-mark.png binary with Evidence Vessel version:
                  curl -sL "https://pub.hyperagent.com/api/published/pbf01KQZNXVE1_NA5K5MPCQGCJEK7W/adfe1b92-a290-4c42-9a30-a79a2f2bd764.png" \
                    -o public/images/brand-mark.png
              */}
              <img
                src="/images/brand-mark.png"
                alt=""
                aria-hidden
                width={96}
                height={96}
                className="w-24 opacity-40 select-none pointer-events-none"
              />
              <span className="font-display text-2xl font-semibold lowercase text-[color:var(--text-primary)]">
                assembl
              </span>
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
                    className="text-[color:var(--text-primary)] hover:text-[color:var(--assembl-pounamu)]"
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
                <Link href="/about" className="text-[color:var(--text-primary)] hover:text-[color:var(--assembl-pounamu)]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[color:var(--text-primary)] hover:text-[color:var(--assembl-pounamu)]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[color:var(--text-primary)] hover:text-[color:var(--assembl-pounamu)]">
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
          <p>© {new Date().getFullYear()} assembl. All rights reserved.</p>
          <p className="font-mono">Evidence Vessel · v2.0</p>
        </div>
      </div>
    </footer>
  );
}

