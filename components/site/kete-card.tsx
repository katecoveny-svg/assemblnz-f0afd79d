import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Kete } from "@/lib/kete";

export function KeteCard({ kete }: { kete: Kete }) {
  return (
    <Link
      href={`/kete/${kete.slug}`}
      data-kete={kete.slug}
      className="kete-card group relative block overflow-hidden p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-soft-gold)]"
      style={{ ["--kete-accent" as string]: kete.accent }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle, ${kete.accent} 0%, transparent 70%)`,
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]"
          >
            {kete.industry}
          </span>
          <ArrowUpRight
            className="h-4 w-4 text-[color:var(--text-secondary)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--text-primary)]"
            aria-hidden
          />
        </div>

        <h3 className="mt-4 font-display text-3xl text-[color:var(--text-primary)]">
          {kete.name}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
          {kete.tagline}
        </p>

        <div className="mt-6 flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: kete.accent }}
            aria-hidden
          />
          <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
            {kete.accentName}
          </span>
        </div>
      </div>
    </Link>
  );
}
