import 'server-only';
import { createHash } from 'node:crypto';
import { OFFICIAL_SOURCES, selectSources, type SourceDefinition, type SpecialistSlug } from './sources';

export type RetrievedSource = SourceDefinition & { status: 'retrieved'; retrievedAt: string; hash: string; excerpt: string; sourceDate: string | null };
export type FailedSource = SourceDefinition & { status: 'unavailable'; checkedAt: string; reason: string };
export type SourceCheck = RetrievedSource | FailedSource;
const hosts = new Set(OFFICIAL_SOURCES.map(s => new URL(s.url).hostname));

export function sourceText(html: string): string {
  const main = html.match(/<main\b(?:"[^"]*"|'[^']*'|[^'">])*?>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  return main.replace(/<(script|style|nav|footer|header|svg|form|aside)\b(?:"[^"]*"|'[^']*'|[^'">])*?>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(p|li|h[1-6]|div|tr|section)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(?:"[^"]*"|'[^']*'|[^'">])*?>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => Number(n) < 0x110000 ? String.fromCodePoint(Number(n)) : '')
    .replace(/[\t \r]+/g, ' ').replace(/\n[ \t]+/g, '\n').replace(/\n\s*\n/g, '\n').trim();
}

export function relevantExcerpt(text: string, query: string, max = 18000): string {
  if (text.length <= max) return text;
  const words = Array.from(new Set(query.toLowerCase().match(/[a-z]{4,}/g) ?? []));
  const chunks = text.match(/[\s\S]{1,1800}/g) ?? [];
  const selected = chunks.map((value, i) => ({ value, i, score: words.reduce((n, w) => n + (value.toLowerCase().includes(w) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score || a.i - b.i).slice(0, 8).sort((a, b) => a.i - b.i);
  return `${text.slice(0, 1800)}\n[Selected passages; intervening text omitted]\n${selected.filter(c => c.i !== 0).map(c => c.value).join('\n[... ]\n')}`.slice(0, max);
}

export async function retrieveSource(source: SourceDefinition, query: string, signal?: AbortSignal): Promise<SourceCheck> {
  const checkedAt = new Date().toISOString();
  try {
    let url = source.url;
    let response: Response | undefined;
    const timeout = signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000);
    for (let redirects = 0; redirects < 4; redirects++) {
      const target = new URL(url);
      if (target.protocol !== 'https:' || !hosts.has(target.hostname) || target.port || target.username || target.password) throw new Error('source redirect is outside the official catalogue');
      response = await fetch(url, { cache: 'no-store', redirect: 'manual', signal: timeout, headers: { Accept: 'text/html', 'User-Agent': 'assembl-source-reader/1.0 (+https://www.assembl.co.nz)' } });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) throw new Error('source moved without an address');
        await response.body?.cancel(); url = new URL(location, url).href; continue;
      }
      break;
    }
    if (!response?.ok || !response.body || !response.headers.get('content-type')?.includes('text/html')) throw new Error('official page did not return readable content');
    const reader = response.body.getReader(); const decoder = new TextDecoder(); let html = ''; let size = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 4000000) { await reader.cancel(); throw new Error('official page is too large to verify in this request'); }
      html += decoder.decode(value, { stream: true });
    }
    const text = sourceText(html + decoder.decode());
    if (text.length < 300 || /access denied|verify you are human|request rejected/i.test(text.slice(0, 700))) throw new Error('official page could not be verified');
    const sourceDate = text.match(/(?:[Ll]ast\s+(?:updated|modified)|[Vv]ersion\s+as\s+at|[Ee]ffective\s+from|[Uu]pdated\s+on)[\s:]*[0-9]{1,2}[ \t]+[A-Za-z]+[ \t]+[0-9]{4}/)?.[0]?.replace(/\s+/g, ' ') ?? null;
    return { ...source, url, status: 'retrieved', retrievedAt: checkedAt, hash: createHash('sha256').update(text).digest('hex'), excerpt: relevantExcerpt(text, query), sourceDate };
  } catch {
    return { ...source, status: 'unavailable', checkedAt, reason: 'Could not read the current official page. No cached facts have been substituted.' };
  }
}

export async function retrieveSpecialistSources(slug: SpecialistSlug, query: string, signal?: AbortSignal) {
  return Promise.all(selectSources(slug, query).map(s => retrieveSource(s, query, signal)));
}
