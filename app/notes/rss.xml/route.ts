import { NOTES } from '@/lib/notes/notes';
import { SITE_URL } from '@/lib/seo/schema';

/** RSS for Notes from assembl — how readers and aggregators follow the writing. */
export async function GET() {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const items = NOTES.map((n) => `    <item>
      <title>${esc(n.title)}</title>
      <link>${SITE_URL}/notes/${n.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/notes/${n.slug}</guid>
      <pubDate>${new Date(n.published).toUTCString()}</pubDate>
      <description>${esc(n.answer)}</description>
    </item>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Notes from assembl</title>
    <link>${SITE_URL}/notes</link>
    <atom:link href="${SITE_URL}/notes/rss.xml" rel="self" type="application/rss+xml" />
    <description>Writing on agentic customer journeys, rewarded wait states and agentic CX in Aotearoa. Every number carries its source.</description>
    <language>en-NZ</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=600, s-maxage=3600',
    },
  });
}
