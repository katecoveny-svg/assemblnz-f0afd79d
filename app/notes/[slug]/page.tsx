import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, breadcrumbNode, faqPageNode, SITE_URL } from '@/lib/seo/schema';
import { NOTES, getNote } from '@/lib/notes/notes';
import '../notes.css';

export function generateStaticParams() {
  return NOTES.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return {};
  return {
    title: note.title,
    description: note.answer.slice(0, 174),
    alternates: { canonical: `/notes/${note.slug}` },
    openGraph: {
      title: note.title,
      description: note.answer.slice(0, 174),
      type: 'article',
      publishedTime: note.published,
      url: `${SITE_URL}/notes/${note.slug}`,
    },
  };
}

/**
 * A note. Written to be cited.
 *
 * The page emits BOTH BlogPosting and FAQPage structured data from the same
 * content: search engines index the article, and answer engines lift the
 * question/answer pairs. The visible headings are the same questions, so what
 * a model quotes is exactly what a human reads — no hidden SEO layer.
 */
export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  return (
    <main className="nt">
      <JsonLd
        data={graph(
          {
            '@type': 'BlogPosting',
            '@id': `${SITE_URL}/notes/${note.slug}#post`,
            headline: note.title,
            description: note.answer,
            datePublished: note.published,
            dateModified: note.updated ?? note.published,
            url: `${SITE_URL}/notes/${note.slug}`,
            author: { '@id': `${SITE_URL}/#organization` },
            publisher: { '@id': `${SITE_URL}/#organization` },
            inLanguage: 'en-NZ',
            isAccessibleForFree: true,
            citation: note.sources.map((s) => s.source),
          },
          faqPageNode(
            note.sections.map((s) => ({ question: s.q, answer: s.a.join(' ') })),
            `${SITE_URL}/notes/${note.slug}#faq`,
          ),
          breadcrumbNode([
            { name: 'assembl', path: '/' },
            { name: 'Notes', path: '/notes' },
            { name: note.title, path: `/notes/${note.slug}` },
          ]),
        )}
      />
      <article className="nt-wrap nt-article">
        <p className="nt-kicker">
          <Link href="/notes">notes</Link> · {note.kicker} · {note.readMinutes} min
        </p>
        <h1>{note.title}</h1>

        {/* The extractable answer — first thing a person reads, first thing a model lifts. */}
        <p className="nt-answer">{note.answer}</p>

        {note.sections.map((s) => (
          <section key={s.q} className="nt-section">
            <h2>{s.q}</h2>
            {s.a.map((p, i) => <p key={i}>{p}</p>)}
          </section>
        ))}

        <section className="nt-sources">
          <h2>Where these numbers come from</h2>
          <ul>
            {note.sources.map((src) => (
              <li key={src.fact}>
                <span>{src.fact}</span>
                {src.url ? (
                  <a href={src.url} rel="noopener">{src.source}</a>
                ) : (
                  <em>{src.source}</em>
                )}
              </li>
            ))}
          </ul>
          <p className="nt-sources-note">
            If a claim on this page has no source under it, treat it as an opinion — that is the
            rule we hold ourselves to.
          </p>
        </section>

        <footer className="nt-end">
          <p className="nt-end-by">
            Written by assembl — intuitive agentic customer journeys, Aotearoa New Zealand.
            Published {new Date(note.published).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
          <div className="nt-foot-row">
            {note.next && <a className="nt-cta" href={note.next.href}>{note.next.label} →</a>}
            <Link className="nt-cta ghost" href="/notes">more notes</Link>
          </div>
        </footer>
      </article>
    </main>
  );
}
