import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, breadcrumbNode, SITE_URL } from '@/lib/seo/schema';
import { NOTES } from '@/lib/notes/notes';
import './notes.css';

export const metadata: Metadata = {
  title: 'Notes from assembl — writing on agentic customer journeys',
  description:
    'Plain writing on agentic customer journeys, rewarded wait states and agentic CX in Aotearoa. Every number carries its source.',
  alternates: { canonical: '/notes', types: { 'application/rss+xml': '/notes/rss.xml' } },
  openGraph: { title: 'Notes from assembl', description: 'Writing on agentic customer journeys. Every number carries its source.' },
};

export default function NotesIndex() {
  return (
    <main className="nt">
      <JsonLd
        data={graph(
          {
            '@type': 'Blog',
            '@id': `${SITE_URL}/notes#blog`,
            name: 'Notes from assembl',
            description: 'Writing on agentic customer journeys, rewarded wait states and agentic CX in Aotearoa.',
            url: `${SITE_URL}/notes`,
            publisher: { '@id': `${SITE_URL}/#organization` },
            blogPost: NOTES.map((n) => ({
              '@type': 'BlogPosting',
              '@id': `${SITE_URL}/notes/${n.slug}#post`,
              headline: n.title,
              description: n.answer,
              datePublished: n.published,
              url: `${SITE_URL}/notes/${n.slug}`,
            })),
          },
          breadcrumbNode([
            { name: 'assembl', path: '/' },
            { name: 'Notes', path: '/notes' },
          ]),
        )}
      />
      <div className="nt-wrap">
        <p className="nt-kicker">assembl · intuitive agentic customer journeys</p>
        <h1>Notes from<br /><span className="metal">assembl.</span></h1>
        <p className="nt-lede">
          Writing on the waits inside customer journeys, and what to do with them. One question per
          note, answered plainly. Every number carries its source — if we cannot source it, we
          leave it out.
        </p>

        <ol className="nt-list">
          {NOTES.map((n) => (
            <li key={n.slug}>
              <Link href={`/notes/${n.slug}`}>
                <span className="nt-item-kick">{n.kicker} · {n.readMinutes} min</span>
                <h2>{n.title}</h2>
                <p>{n.answer}</p>
                <span className="nt-go">read →</span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="nt-foot">
          <div>
            <b>Get them as they land.</b>
            <p>
              Notes go out as they are written — no schedule, no filler. Subscribe by RSS, or
              start with the free tools and we will send the occasional one.
            </p>
          </div>
          <div className="nt-foot-row">
            <a className="nt-cta" href="/notes/rss.xml">RSS feed</a>
            <Link className="nt-cta ghost" href="/ai-ready">the free tools</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
