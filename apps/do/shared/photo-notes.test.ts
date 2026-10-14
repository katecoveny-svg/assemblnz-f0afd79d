import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { notesReady, notesText, notesHtml, photoNotesSchema, importedNotes, completionWarning, type PhotoNotes } from './photo-notes';
const notes: PhotoNotes = { version: 1, title: '<script>notes</script>', pages: [1,2,3].map(n => ({ id: `00000000-0000-4000-8000-00000000000${n}`, name: `Synthetic page ${n}`, image: 'data:image/jpeg;base64,YWJj', text: `Page ${n}\nSecond line`, reviewed: true })) };
describe('photo notes review and recovery', () => {
  it('requires all pages and actual text to be reviewed', () => {
    expect(notesReady({ ...notes, pages: [] })).toBe(false);
    expect(() => notesText({ ...notes, pages: notes.pages.map((p,i) => ({ ...p, reviewed: i !== 1 })) })).toThrow();
    expect(notesReady({ ...notes, pages: [{ ...notes.pages[0], text: ' ' }] })).toBe(false);
  });
  it('exports exact reviewed text in page order and safely escapes HTML', () => {
    const reordered = { ...notes, pages: [...notes.pages].reverse() };
    expect(notesText(reordered)).toContain('Page 3\nSecond line\n\nPage 2');
    expect(notesHtml(notes)).toContain('&lt;script&gt;notes&lt;/script&gt;');
    expect(notesHtml(notes)).not.toContain('<script>');
  });
  it('rejects empty/noncanonical IDs that could collide with idle/cleared consent', () => {
    for (const id of ['', 'upload', 'restore', '  ', '123', '00000000-0000-4000-8000-000000000001 '.trimEnd() + ' ']) expect(photoNotesSchema.safeParse({ ...notes, pages: [{ ...notes.pages[0], id }] }).success).toBe(false);
  });
  it('import rejects JPEG labels containing invalid bytes and warnings never claim verified content', () => {
    expect(() => importedNotes(notes)).toThrow();
    expect(completionWarning(notes.pages[0])).toContain('unverified');
  });
  it('valid JPEG import clears review; disguised non-JPEG and oversized dimensions are rejected', async () => {
    const image = await sharp({ create: { width: 40, height: 30, channels: 3, background: '#fffdfb' } }).jpeg().toBuffer();
    const value = { ...notes, pages: [{ ...notes.pages[0], image: `data:image/jpeg;base64,${image.toString('base64')}` }] };
    expect(importedNotes(value).pages[0].reviewed).toBe(false);
    const png = await sharp(image).png().toBuffer();
    expect(() => importedNotes({ ...value, pages: [{ ...value.pages[0], image: `data:image/jpeg;base64,${png.toString('base64')}` }] })).toThrow();
    const large = await sharp({ create: { width: 1601, height: 1, channels: 3, background: '#fffdfb' } }).jpeg().toBuffer();
    expect(() => importedNotes({ ...value, pages: [{ ...value.pages[0], image: `data:image/jpeg;base64,${large.toString('base64')}` }] })).toThrow();
  });
  it('backup roundtrip retains photos, text and order, rejects unsupported images and over-limit pages', () => {
    expect(photoNotesSchema.parse(JSON.parse(JSON.stringify(notes)))).toEqual(notes);
    expect(photoNotesSchema.safeParse({ ...notes, pages: [...notes.pages, { ...notes.pages[0], id:'00000000-0000-4000-8000-000000000004' }] }).success).toBe(false);
    expect(photoNotesSchema.safeParse({ ...notes, pages: [{ ...notes.pages[0], image: 'https://example.com/private' }] }).success).toBe(false);
    expect(photoNotesSchema.safeParse({ ...notes, pages: [notes.pages[0], notes.pages[0]] }).success).toBe(false);
  });
});
