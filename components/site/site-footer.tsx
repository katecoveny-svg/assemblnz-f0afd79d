import Link from "next/link";
import { KETES } from "@/lib/kete";
import { footerDisclaimer, heroVessel, ketes as keteImagery } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[rgba(157,140,125,0.14)] bg-[rgba(247,243,238,0.6)]">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="inline-flex flex-col items-start gap-3 rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
            >
              <img
                src={heroVessel.mark}
                alt=""
                aria-hidden
                width={96}
                height={96}
                className="w-24 opacity-50 select-none pointer-events-none"
              />
              <span className="font-display text-2xl font-semibold lowercase text-[color:var(--text-primary)]">
                assembl
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-[color:var(--text-secondary)]">
              Mahi that earns its proof. Built in Aotearoa.
              Time is the thing. We give it back.
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
                    className="inline-flex items-center gap-3 rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                  >
                    <img
                      src={keteImagery[k.slug].square}
                      alt=""
                      aria-hidden
                      width={24}
                      height={24}
                      loading="lazy"
                      className="h-6 w-6 flex-none rounded-[2px] object-cover"
                    />
                    <span>
                      {k.name}
                      <span className="ml-2 text-xs text-[color:var(--text-secondary)]">
                        {k.industry}
                      </span>
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
                <Link
                  href="/pilot-sprint"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Pilot Sprint
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/evidence-pack"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Evidence pack
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
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
              {footerDisclaimer}
            </p>
            <p className="mt-4 text-xs text-[color:var(--text-secondary)]">
              <Link
                href="/legal/disclaimer"
                className="rounded-sm underline-offset-2 transition-colors hover:text-[color:var(--assembl-pounamu)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
              >
                Full disclaimer
              </Link>
            </p>
          </div>
        </div>

        <div className="section-divider mt-12" />

        <div className="mt-6 flex flex-col gap-2 text-xs text-[color:var(--text-secondary)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} assembl. All rights reserved.</p>
          <p className="font-mono">Built in Aotearoa</p>
        </div>
      </div>
    </footer>
  );
}
