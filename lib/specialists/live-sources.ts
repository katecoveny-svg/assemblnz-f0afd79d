import 'server-only';
import { createHash } from 'node:crypto';
import { OFFICIAL_SOURCES, selectSources, type SourceDefinition, type SpecialistSlug } from './sources';

export type RetrievedSource = SourceDefinition & { status: 'retrieved'; retrievedAt: string; hash: string; excerpt: string; sourceDate: string | null };
export type FailedSource = SourceDefinition & { status: 'unavailable'; checkedAt: string; reason: string };
export type SourceCheck = RetrievedSource | FailedSource;
const hosts = new Set(OFFICIAL_SOURCES.flatMap(s => [s.url, ...(s.dataUrl ? [s.dataUrl] : [])]).map(url => new URL(url).hostname));
class SourceReadError extends Error {}

export function sourceText(html: string): string {
  const main = html.match(/<main\b(?:"[^"]*"|'[^']*'|[^'">])*?>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  return markupText(main.replace(/<(script|style|nav|footer|header|svg|form|aside)\b(?:"[^"]*"|'[^']*'|[^'">])*?>[\s\S]*?<\/\1>/gi, ''));
}

function markupText(markup: string): string {
  return markup.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/(p|li|h[1-6]|div|tr|section|heading|label|text|para|subprov|prov)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(?:"[^"]*"|'[^']*'|[^'">])*?>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => Number(n) < 0x110000 ? String.fromCodePoint(Number(n)) : '')
    .replace(/[\t \r]+/g, ' ').replace(/\n[ \t]+/g, '\n').replace(/\n\s*\n/g, '\n').trim();
}

export function legislationText(xml: string, sectionId?: string) {
  const root = xml.match(/<(act|regulation|bill)\b[^>]*>/)?.[0];
  const version = root?.match(/date\.as\.at="(\d{4}-\d{2}-\d{2})"/)?.[1];
  if (!root || !version || /<!ENTITY\b/i.test(xml)) throw new SourceReadError('The official XML did not contain a verifiable legislation version.');
  let content = xml;
  if (sectionId) {
    if (!/^[A-Z0-9]+$/.test(sectionId)) throw new SourceReadError('The requested legislation section is invalid.');
    const section = xml.match(new RegExp(`<prov\\b[^>]*\\bid="${sectionId}"[^>]*>[\\s\\S]*?<\\/prov>`))?.[0];
    if (!section) throw new SourceReadError('The requested section was not found in the current official XML.');
    const title = xml.match(/<title\b[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '';
    content = `${title}\n${section}`;
  }
  const sourceDate = `Version as at ${new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${version}T00:00:00Z`))}`;
  return { text: `${sourceDate}\n${markupText(content)}`, sourceDate };
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
    let url = source.dataUrl ?? source.url;
    let response: Response | undefined;
    const timeout = signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000);
    for (let redirects = 0; redirects < 4; redirects++) {
      const target = new URL(url);
      if (target.protocol !== 'https:' || !hosts.has(target.hostname) || target.port || target.username || target.password) throw new SourceReadError('The page redirected outside the approved official source catalogue.');
      response = await fetch(url, { cache: 'no-store', redirect: 'manual', signal: timeout, headers: { Accept: source.dataUrl ? 'application/xml, text/xml' : 'text/html', 'User-Agent': 'assembl-source-reader/1.0 (+https://www.assembl.co.nz)' } });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) throw new SourceReadError('The official page moved without providing a destination.');
        await response.body?.cancel(); url = new URL(location, url).href; continue;
      }
      break;
    }
    if (!response?.ok) throw new SourceReadError(`The official website returned HTTP ${response?.status ?? 'unavailable'}.`);
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.body || (source.dataUrl ? !/\b(?:application|text)\/xml\b/i.test(contentType) : !contentType.includes('text/html'))) throw new SourceReadError('The official source did not return the expected readable format.');
    const reader = response.body.getReader(); const decoder = new TextDecoder(); let html = ''; let size = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 4000000) { await reader.cancel(); throw new SourceReadError('The official page exceeded the size limit for this check.'); }
      html += decoder.decode(value, { stream: true });
    }
    const body = html + decoder.decode();
    const legislation = source.dataUrl ? legislationText(body, source.sectionId) : null;
    const text = legislation?.text ?? sourceText(body);
    if (/access denied|verify you are human|request rejected/i.test(text.slice(0, 700))) throw new SourceReadError('The official website returned an access or verification message.');
    if (text.length < 300) throw new SourceReadError('The official page provided too little readable text to verify.');
    const sourceDate = legislation?.sourceDate ?? text.match(/(?:[Ll]ast\s+(?:updated|modified)|[Vv]ersion\s+as\s+at|[Ee]ffective\s+from|[Uu]pdated\s+on)[\s:]*[0-9]{1,2}[ \t]+[A-Za-z]+[ \t]+[0-9]{4}/)?.[0]?.replace(/\s+/g, ' ') ?? null;
    return { ...source, url: source.dataUrl ? source.url : url, ...(source.dataUrl ? { dataUrl: url } : {}), status: 'retrieved', retrievedAt: checkedAt, hash: createHash('sha256').update(text).digest('hex'), excerpt: relevantExcerpt(text, query), sourceDate };
  } catch (error) {
    // Report only controlled public-source diagnostics, never raw network errors or response bodies.
    const reason = error instanceof SourceReadError ? error.message : error instanceof Error && ['AbortError', 'TimeoutError'].includes(error.name) ? 'The official source check timed out.' : 'Could not connect to the current official page.';
    return { ...source, status: 'unavailable', checkedAt, reason: `${reason} No cached facts have been substituted.` };
  }
}

export async function retrieveSpecialistSources(slug: SpecialistSlug, query: string, signal?: AbortSignal) {
  return Promise.all(selectSources(slug, query).map(s => retrieveSource(s, query, signal)));
}
