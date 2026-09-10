import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllDocs, getDocGroups } from '@/lib/docs';
import { DocsSearch } from './DocsSearch';

export const metadata: Metadata = {
  title: 'Docs',
  description: 'Customer docs for assembl kete, evidence packs, integrations, and compliance workflows.',
};

export default function DocsPage() {
  const docs = getAllDocs();
  const groups = getDocGroups(docs);

  return (
    <div className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              assembl docs
            </p>
            <h1 className="mt-5 max-w-[11ch] font-display text-[clamp(3.2rem,8vw,7rem)] font-light leading-[0.9]">
              Specialist agents for NZ work that needs proof.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-[1.75] text-[color:var(--text-body)]">
              Set up a kete, connect the operating record, review drafts, and
              file the evidence pack behind consequential work.
            </p>
          </div>
          <DocsSearch
            docs={docs.map((doc) => ({
              slug: doc.slug,
              title: doc.title,
              description: doc.description,
              group: doc.group,
              order: doc.order,
              searchText: doc.searchText,
            }))}
          />
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {groups.map(({ group, items }) => (
            <section
              key={group}
              className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5"
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                {group}
              </p>
              <div className="mt-4 space-y-3">
                {items.map((doc) => (
                  <Link
                    key={doc.slug}
                    href={`/docs/${doc.slug}`}
                    className="group block border-t border-[rgba(35,33,31,0.08)] pt-3 first:border-t-0 first:pt-0"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-display text-3xl font-light leading-none">
                        {doc.title}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-[color:var(--text-secondary)] transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-[color:var(--text-secondary)]">
                      {doc.description}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
