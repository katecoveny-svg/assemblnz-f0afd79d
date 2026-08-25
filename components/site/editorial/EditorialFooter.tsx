import { EDITORIAL_FOOTER } from '@/lib/copy/editorial-home';

/**
 * The editorial footer — deliberately quiet after two poster screens and a
 * gallery. A big Cormorant italic sign-off, the reply address, a row of
 * lowercase Space Mono links, and the year. One champagne hairline on top to
 * close the page the way the hero opened it.
 *
 * `year` is passed in rather than computed — Date.now()/new Date() are
 * unavailable in some of our render contexts, and the footer is a server
 * component so a build-time constant is honest and stable.
 */
export function EditorialFooter({ year }: { year: number }) {
  const f = EDITORIAL_FOOTER;
  return (
    <footer className="relative w-full bg-[#FBFAF6] px-6 pb-12 pt-16 text-[#1A1918] sm:px-10 sm:pb-16 sm:pt-24 lg:px-16">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[#BFA37A]/50 sm:inset-x-10 lg:inset-x-16"
      />

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 sm:flex-row sm:items-end sm:justify-between">
        {/* sign-off + contact */}
        <div className="flex flex-col gap-4">
          <span
            className="text-5xl italic leading-none tracking-[-0.02em] text-[#1A1918] sm:text-6xl"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            {f.signoff}
          </span>
          <a
            href={`mailto:${f.contactEmail}`}
            className="group inline-flex w-fit flex-col gap-1"
          >
            <span
              className="text-[12px] uppercase tracking-[0.3em] text-[#1A1918]/55"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {f.contactLabel}
            </span>
            <span
              className="text-lg text-[#1A1918] underline decoration-[#BFA37A]/50 decoration-1 underline-offset-4 transition-colors group-hover:decoration-[#BFA37A]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {f.contactEmail}
            </span>
          </a>
        </div>

        {/* links + place + year */}
        <div className="flex flex-col gap-5 sm:items-end">
          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] uppercase tracking-[0.18em] text-[#1A1918]/70 sm:justify-end"
            style={{ fontFamily: 'var(--font-mono)' }}
            aria-label="Footer"
          >
            {f.links.map((l) => {
              const external = l.href.startsWith('http');
              return (
                <a
                  key={l.label}
                  href={l.href}
                  {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                  className="transition-colors hover:text-[#1A1918]"
                >
                  {l.label}
                </a>
              );
            })}
          </nav>
          <p
            className="text-[12px] uppercase tracking-[0.3em] text-[#1A1918]/45 sm:text-right"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {f.place} · {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
