import { z } from 'zod';

/** Inert provenance only. NEVER use this validator as permission to fetch a URL. */
export function cleanSourceUrl(raw: string): string {
  if (!raw.trim()) return '';
  if (raw.length > 2000) throw new Error('Keep the source link under 2,000 characters.');
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error('Use a public HTTPS source link.'); }
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') ||
    !host.includes('.') || /^[\d.]+$/.test(host) || host.includes(':') ||
    /(^|\.)(localhost|local|internal|lan|test|invalid)$/.test(host)) {
    throw new Error('Use a public HTTPS link without credentials or a private network address.');
  }
  url.search = ''; url.hash = '';
  return url.toString();
}
const source = z.string().max(2000).transform((value, ctx) => {
  try { return cleanSourceUrl(value); } catch (error) { ctx.addIssue({ code: 'custom', message: (error as Error).message }); return z.NEVER; }
});
export const saveIntentSchema = z.object({
  version: z.literal(1), kind: z.enum(['link', 'text', 'image', 'note']),
  title: z.string().trim().min(1).max(160), text: z.string().trim().max(6000), sourceUrl: source,
  tags: z.array(z.string().trim().max(32)).max(8).transform(values => [...new Set(values.filter(Boolean))]),
}).strict().superRefine((value, ctx) => {
  if (value.kind === 'link' && !value.sourceUrl) ctx.addIssue({ code: 'custom', message: 'Add a source link.' });
  if (['text', 'note'].includes(value.kind) && !value.text) ctx.addIssue({ code: 'custom', message: 'Add some text.' });
});
export type SaveIntent = z.infer<typeof saveIntentSchema>;
export type SavedItem = SaveIntent & { id: string; revision: number; createdAt: string; image?: string; fictional?: boolean };
export const MAX_BOARD_ITEMS = 80;
export function searchSaved(items: SavedItem[], query: string, kind: string) {
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter(item => (kind === 'all' || item.kind === kind) && words.every(word =>
    [item.title, item.text, item.sourceUrl, ...item.tags].join(' ').toLocaleLowerCase().includes(word)));
}
export function taskFromSaved(item: SavedItem, instruction: string) {
  if (!instruction.trim() || instruction.length > 1200) throw new Error('Describe the next step in 1–1,200 characters.');
  // Deliberately no image bytes, execution permission, hidden page content or truncation.
  return `${instruction.trim()}\n\nSource: ${item.title}\nSaved reference: ${item.id} · revision ${item.revision}\n${item.sourceUrl ? `Link (not fetched or verified): ${cleanSourceUrl(item.sourceUrl)}\n` : ''}${item.text ? `Selected note:\n${item.text}\n` : ''}\nPreparation only. Review before any external action.`;
}
