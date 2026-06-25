"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { footerDisclaimer, footerKeteCutouts } from "@/lib/site-config";
import { AssemblWordmark } from "@/components/site/AssemblWordmark";
import { isAgentMarketplace, isAtlas, isDashMicrosite, isEcho } from "@/components/site/site-header";

export function SiteFooter() {
  const pathname = usePathname();
  // The /dash microsite, /agents marketplace and /atlas coach ship their own
  // footer; suppress the global one there.
  if (isDashMicrosite(pathname) || isAgentMarketplace(pathname) || isAtlas(pathname) || isEcho(pathname)) return null;

  return (
    <footer className="relative z-10 mt-24 border-t border-[rgba(58,56,50,0.10)] bg-[rgba(255,247,236,0.6)]">
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
              Marketplace
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { href: "/agents", label: "Browse all agents" },
                { href: "/agents#pricing", label: "Bundles & pricing" },
                { href: "/hapai", label: "Free tools" },
                { href: "/hui", label: "Meeting notes" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="rounded-sm text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
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
