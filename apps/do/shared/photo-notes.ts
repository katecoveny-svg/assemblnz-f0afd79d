import { z } from 'zod';
import type { DoVisionResult } from './vision';
import type { TranscriptionCompletion } from '@/lib/ai/completion';

export const PHOTO_NOTES_LIMIT = 3;
export const photoPageIdSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
export type PhotoNotePage = {
  id: string; name: string; image: string; text: string; reviewed: boolean;
  receipt?: DoVisionResult['receipt']; completion?: TranscriptionCompletion;
};
export type PhotoNotes = { version: 1; title: string; pages: PhotoNotePage[] };
export type PhotoNotesBusy = { kind: 'idle' } | { kind: 'upload' | 'import' } | { kind: 'transcribe'; pageId: string };
const completionSchema = z.object({
  status: z.enum(['provider-ended', 'incomplete', 'unverified']),
  finishReason: z.enum(['stop', 'length', 'content-filter', 'tool-calls', 'error', 'other', 'unknown']),
  rawFinishReason: z.string().max(80).nullable(), providerStatus: z.string().max(80).nullable(), incompleteReason: z.string().max(80).nullable(),
}).strict();
export const photoNotesSchema = z.object({
  version: z.literal(1), title: z.string().max(160),
  pages: z.array(z.object({
    id: photoPageIdSchema, name: z.string().max(160),
    image: z.string().max(2_666_700).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/),
    text: z.string().max(12_000), reviewed: z.boolean(), completion: completionSchema.optional(),
    receipt: z.object({ model: z.string().max(160), imageHash: z.string().max(100), outputHash: z.string().max(100), createdAt: z.string().max(80), boundary: z.string().max(2000) }).strict().optional(),
  }).strict()).max(PHOTO_NOTES_LIMIT),
}).strict().superRefine((value, ctx) => {
  if (new Set(value.pages.map(page => page.id)).size !== value.pages.length) ctx.addIssue({ code: 'custom', message: 'Duplicate pages' });
});

/** Bound JPEG dimensions before browser decoding can allocate large images. */
export function validateBackupJpeg(data: string): void {
  const payload = data.split(',')[1];
  const bytes = atob(payload);
  if (bytes.length > 2_000_000 || btoa(bytes) !== payload || bytes.charCodeAt(0) !== 255 || bytes.charCodeAt(1) !== 216) throw new Error('Invalid JPEG bytes.');
  const byte = (i: number) => bytes.charCodeAt(i);
  let offset = 2;
  while (offset < bytes.length) {
    if (byte(offset++) !== 255) break;
    while (byte(offset) === 255) offset++;
    const marker = byte(offset++);
    if (marker === 217 || marker === 218) break;
    if (marker === 1 || marker === 216 || (marker >= 208 && marker <= 215)) continue;
    const length = byte(offset) * 256 + byte(offset + 1);
    if (!Number.isFinite(length) || length < 2 || offset + length > bytes.length) break;
    if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
      if (length < 8) break;
      const height = byte(offset + 3) * 256 + byte(offset + 4);
      const width = byte(offset + 5) * 256 + byte(offset + 6);
      if (width > 0 && height > 0 && width <= 1600 && height <= 1600) return;
      break;
    }
    offset += length;
  }
  throw new Error('Backup images must be real JPEG pages up to 1600 px.');
}
export function importedNotes(value: unknown): PhotoNotes {
  const notes = photoNotesSchema.parse(value);
  notes.pages.forEach(page => validateBackupJpeg(page.image));
  return { ...notes, pages: notes.pages.map(page => ({ ...page, reviewed: false })) };
}
export function completionWarning(page: PhotoNotePage): string {
  if (page.completion?.status === 'incomplete') return 'This transcription is incomplete or interrupted. Supply any missing text from the photo before reviewing. No automatic retry was made.';
  if (page.completion?.status === 'provider-ended') return 'The provider ended normally. This does not verify the transcription; check every line and the end of the page.';
  return 'Provider completeness is unverified. Compare every line and the end of the page, and supply any missing text.';
}
export function notesReady(notes: PhotoNotes) {
  return notes.pages.length > 0 && notes.pages.every(page => page.reviewed && page.text.trim());
}
export function notesText(notes: PhotoNotes) {
  if (!notesReady(notes)) throw new Error('Review every page before downloading.');
  return `${notes.title.trim() || 'Typed notes'}\n\n${notes.pages.map(page => page.text.trim()).join('\n\n')}\n`;
}
export function notesHtml(notes: PhotoNotes) {
  const escape = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
  notesText(notes);
  return `<!doctype html><html lang="en-NZ"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(notes.title || 'Typed notes')}</title><style>body{max-width:46rem;margin:3rem auto;padding:0 1.25rem;font:18px/1.65 system-ui;color:#240b21;background:#fffdfb}p{white-space:pre-wrap}@media print{body{margin:0;color:black}}</style><h1>${escape(notes.title || 'Typed notes')}</h1>${notes.pages.map(page => `<p>${escape(page.text.trim())}</p>`).join('')}</html>`;
}
