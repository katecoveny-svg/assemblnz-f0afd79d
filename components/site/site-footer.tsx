import Link from "next/link";
import { INDUSTRY_KETES } from "@/lib/kete";
import { footerDisclaimer, footerKeteCutouts } from "@/lib/site-config";
import { AssemblWordmark } from "@/components/site/AssemblWordmark";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[rgba(157,140,125,0.14)] bg-[rgba(247,243,238,0.6)]">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-5">
          <div>
            <Link
              href="/"
              className="inline-flex flex-col items-start gap-3 rounded-sm transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
            >
              <img
                src={footerKeteCutouts.waihanga}
                alt=""
                aria-hidden
                width={96}
                height={96}
                className="h-24 w-24 select-none object-contain opacity-80"
              />
              <AssemblWordmark className="text-2xl tracking-[-0.02em] text-[color:var(--text-primary)]" />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-[color:var(--text-secondary)]">
              Mahi that earns its proof. Built in Aotearoa.
            </p>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Kete packs
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {INDUSTRY_KETES.map((k) => (
                <li key={k.slug}>
                  <Link
                    href={`/kete/${k.slug}`}
                    className="inline-flex items-center gap-3 rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center">
                      <img
                        src={footerKeteCutouts[k.slug]}
                        alt=""
                        aria-hidden
                        width={32}
                        height={32}
                        loading="lazy"
                        className="max-h-8 max-w-8 object-contain"
                      />
                    </span>
                    <span>
                      <span className="block">{k.name}</span>
                      <span className="block text-xs text-[color:var(--text-secondary)]">
                        {k.englishName}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm">
              <Link
                href="/toro"
                className="rounded-sm text-[color:var(--text-secondary)] underline-offset-2 transition-colors hover:text-[color:var(--assembl-pounamu)] hover:underline focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
              >
                Looking for whānau life? Meet Tōro →
              </Link>
            </p>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Company
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/pilot-sprint"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Pilot Sprint
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/evidence-pack"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Evidence pack
                </Link>
              </li>
              <li>
                <Link
                  href="/data"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Data API
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Press
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Compliance
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/trust"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Trust Centre
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Privacy Statement
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-use"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  AI use disclosure
                </Link>
              </li>
              <li>
                <Link
                  href="/trust/soc2"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  SOC 2 posture
                </Link>
              </li>
              <li>
                <Link
                  href="/te-tiriti"
                  className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Te Tiriti statement
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Aotearoa
            </h2>
            <p className="mt-4 text-sm text-[color:var(--text-secondary)]">
              {footerDisclaimer}
            </p>
            <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[color:var(--text-secondary)]">
              <Link
                href="/legal/disclaimer"
                className="rounded-sm underline-offset-2 transition-colors hover:text-[color:var(--assembl-pounamu)] hover:underline focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
              >
                Disclaimer
              </Link>
              <span aria-hidden>·</span>
              <Link
                href="/legal/privacy"
                className="rounded-sm underline-offset-2 transition-colors hover:text-[color:var(--assembl-pounamu)] hover:underline focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
              >
                Privacy Policy
              </Link>
              <span aria-hidden>·</span>
              <Link
                href="/legal/terms"
                className="rounded-sm underline-offset-2 transition-colors hover:text-[color:var(--assembl-pounamu)] hover:underline focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
              >
                Terms of Use
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
