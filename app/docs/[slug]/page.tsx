import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAllDocs, getDoc } from '@/lib/docs';

type Params = { slug: string };

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const allDocs = getAllDocs();
  const currentIndex = allDocs.findIndex((item) => item.slug === doc.slug);
  const previous = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const next = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return (
    <div className="bg-[color:var(--assembl-paper)] px-5 py-12 text-[color:var(--text-primary)] md:px-10 md:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[260px_minmax(0,760px)_220px]">
        <aside className="hidden lg:block">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Docs home
          </Link>
          <nav className="mt-8 space-y-2">
            {allDocs.map((item) => (
              <Link
                key={item.slug}
                href={`/docs/${item.slug}`}
                className={[
                  'block rounded-[8px] px-3 py-2 text-sm transition-colors',
                  item.slug === doc.slug
                    ? 'bg-[color:var(--assembl-pounamu)] text-white'
                    : 'text-[color:var(--text-secondary)] hover:bg-white hover:text-[color:var(--text-primary)]',
                ].join(' ')}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-6 md:p-9">
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
            {doc.group}
          </p>
          <div className="mt-5 space-y-6">
            {doc.blocks.map((block, index) => {
              if (block.type === 'h1') {
                return (
                  <h1
                    key={`${block.type}-${index}`}
                    className="font-display text-[clamp(3rem,7vw,5.8rem)] font-light leading-[0.9]"
                  >
                    {block.text}
                  </h1>
                );
              }
              if (block.type === 'h2') {
                return (
                  <h2
                    key={`${block.type}-${index}`}
                    className="pt-4 font-display text-4xl font-light leading-none"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === 'ul') {
                return (
                  <ul key={`${block.type}-${index}`} className="space-y-2">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--assembl-gold)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p
                  key={`${block.type}-${index}`}
                  className="text-base leading-[1.8] text-[color:var(--text-body)]"
                >
                  {block.text}
                </p>
              );
            })}
          </div>
        </article>

        <aside className="space-y-3">
          {previous ? <PagerLink label="Previous" href={`/docs/${previous.slug}`} title={previous.title} /> : null}
          {next ? <PagerLink label="Next" href={`/docs/${next.slug}`} title={next.title} /> : null}
        </aside>
      </div>
    </div>
  );
}

function PagerLink({ label, href, title }: { label: string; href: string; title: string }) {
  return (
    <Link
      href={href}
      className="block rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-4 transition-colors hover:bg-white"
    >
      <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {label}
      </span>
      <span className="mt-2 block font-display text-2xl font-light leading-none">{title}</span>
    </Link>
  );
}
