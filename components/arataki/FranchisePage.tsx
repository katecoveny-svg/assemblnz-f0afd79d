import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { FranchiseContent } from '@/lib/arataki/franchises';

export function FranchisePage({ content }: { content: FranchiseContent }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_16%_0%,rgba(217,168,90,0.16),transparent_38%),radial-gradient(ellipse_at_86%_10%,rgba(43,107,87,0.13),transparent_34%),#FAF7F2] text-[#3D4250]">
      <section className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1180px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#2B6B57]">
            Arataki · franchise view
          </p>
          <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.5rem,8vw,6.8rem)] font-light leading-none text-[#3D4250]">
            {content.hero}
          </h1>
          <p className="mt-6 max-w-3xl text-[17px] leading-[1.65] text-[#5C6273] md:text-xl">
            {content.sub}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/operator/arataki/loan-cars" className="cta-primary inline-flex h-12 items-center px-6">
              See the operator surface <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link href="/pilot-sprint" className="btn-ghost inline-flex h-12 items-center px-6">
              Book a Pilot Sprint
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[#C8BBA9]/60 bg-white/38 px-6 py-12 md:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#2B6B57]">
            Brand pain panel
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {content.pains.map((pain) => (
              <article key={pain} className="rounded-[8px] border border-[#C8BBA9]/70 bg-[#FAF7F2]/78 p-5">
                <p className="text-sm leading-relaxed text-[#3D4250]">{pain}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-2">
          <Gallery title="Calculator quick-links" items={content.calculators} />
          <Gallery title="Workflow gallery" items={content.workflows} />
        </div>
      </section>

      <section className="px-6 pb-16 md:px-12 md:pb-24">
        <div className="mx-auto grid max-w-[1180px] gap-5 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-[8px] border border-[#2B6B57]/40 bg-white/62 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#2B6B57]">Diagnostic</p>
            <h2 className="mt-3 font-display text-5xl font-light leading-none">
              Take the diagnostic for your dealership.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5C6273]">
              Twenty questions across service conversion, workshop capacity, retention, lead response, F&I, and compliance.
            </p>
            <Link href="/kete/arataki/diagnostic" className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#2B6B57]">
              Start diagnostic <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </article>
          <article className="rounded-[8px] border border-[#C8BBA9]/70 bg-white/50 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9D8C7D]">Pilot note</p>
            <blockquote className="mt-4 font-display text-4xl font-light leading-tight text-[#3D4250]">
              Pilot testimonial reserved for the first dealer sprint.
            </blockquote>
          </article>
        </div>
      </section>
    </main>
  );
}

function Gallery({
  title,
  items,
}: {
  title: string;
  items: Array<{ title: string; href: string; description: string }>;
}) {
  return (
    <section>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#2B6B57]">{title}</p>
      <div className="mt-5 grid gap-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-[8px] border border-[#C8BBA9]/70 bg-white/62 p-5 transition hover:-translate-y-1 hover:border-[#2B6B57] hover:bg-white"
          >
            <h3 className="font-display text-3xl font-light leading-none text-[#3D4250]">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#5C6273]">{item.description}</p>
            <span className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#2B6B57]">
              Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
