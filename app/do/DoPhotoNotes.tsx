"use client";

import { useEffect, useRef, useState } from 'react';
import { PHOTO_NOTES_LIMIT, notesReady, notesText, notesHtml, importedNotes, completionWarning, photoPageIdSchema, type PhotoNotes, type PhotoNotePage, type PhotoNotesBusy } from '@/apps/do/shared/photo-notes';
import { transcriptionCompletion } from '@/lib/ai/completion';
import type { DoVisionResult } from '@/apps/do/shared/vision';
import styles from './do-vision.module.css';

const empty = (): PhotoNotes => ({ version: 1, title: 'Typed notes', pages: [] });
function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function decode(image: HTMLImageElement) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([image.decode(), new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error('Image decoding timed out. Try a smaller screenshot.')), 8000);
    })]);
  } finally { clearTimeout(timeout); }
}
async function prepare(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10_000_000) throw new Error(`${file.name}: use PNG, JPEG or WebP under 10 MB. Convert HEIC to JPEG or use a screenshot.`);
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url; await decode(image);
    if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error(`${file.name}: use a smaller image.`);
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas'); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext('2d'); if (!context) throw new Error('Image preparation is unavailable.');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/jpeg', .85);
    if ((data.split(',')[1].length * .75) > 2_000_000) throw new Error(`${file.name}: crop or use a smaller image.`);
    return data;
  } finally { URL.revokeObjectURL(url); }
}
export function DoPhotoNotes({ active = true }: { active?: boolean }) {
  const [notes, setNotes] = useState<PhotoNotes>(empty);
  const notesRef = useRef<PhotoNotes>(empty());
  const [busy, setBusy] = useState<PhotoNotesBusy>({ kind: 'idle' });
  const dispatch = useRef<PhotoNotesBusy>({ kind: 'idle' });
  const [consent, setConsent] = useState<string | null>(null);
  const consentRef = useRef<string | null>(null);
  const [notice, setNotice] = useState('');
  const upload = useRef<HTMLInputElement>(null);
  const restore = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const pending = busy.kind !== 'idle';
  function revokeConsent() { consentRef.current = null; setConsent(null); }
  function replace(value: PhotoNotes) { notesRef.current = value; setNotes(value); }
  function update(id: string, change: Partial<PhotoNotePage>) {
    replace({ ...notesRef.current, pages: notesRef.current.pages.map(page => page.id === id ? { ...page, ...change } : page) });
  }
  function begin(state: Exclude<PhotoNotesBusy, { kind: 'idle' }>): number | null {
    // Synchronous ref lock closes rapid-click/reentrant state-update races.
    if (!active || dispatch.current.kind !== 'idle') return null;
    dispatch.current = state; setBusy(state); return ++generation.current;
  }
  function finish(attempt: number) {
    if (attempt !== generation.current) return;
    controller.current = null; dispatch.current = { kind: 'idle' }; setBusy({ kind: 'idle' }); revokeConsent();
  }
  function stop() {
    generation.current++; controller.current?.abort(); controller.current = null;
    dispatch.current = { kind: 'idle' }; setBusy({ kind: 'idle' }); revokeConsent();
    setNotice('Stopped on this device. Photos and text remain. A call already started may still use one task.');
  }
  useEffect(() => {
    if (!active) {
      // Retain data across switches, but invalidate permission and late results immediately.
      generation.current++; controller.current?.abort(); controller.current = null;
      dispatch.current = { kind: 'idle' }; consentRef.current = null;
    }
    const frame = requestAnimationFrame(() => {
      // Reconcile on both hide and reveal, including switches before the previous frame ran.
      setBusy(dispatch.current); setConsent(consentRef.current);
      if (!active) setNotice('Tool switched. Photos and text remain. Any started call may still use one task; confirm again before retrying.');
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);
  useEffect(() => () => { generation.current++; controller.current?.abort(); }, []);

  async function add(files: File[]) {
    if (files.length + notesRef.current.pages.length > PHOTO_NOTES_LIMIT) { setNotice('Up to three pages. Remove a page before adding more. Nothing was replaced.'); return; }
    const attempt = begin({ kind: 'upload' }); if (attempt === null) return;
    revokeConsent(); const added: PhotoNotePage[] = []; const errors: string[] = [];
    try {
      for (const file of files) {
        try { added.push({ id: crypto.randomUUID(), name: file.name.slice(0, 160), image: await prepare(file), text: '', reviewed: false }); }
        catch (error) { errors.push(error instanceof Error ? error.message : `${file.name}: image could not be opened.`); }
        if (attempt !== generation.current) return;
      }
      replace({ ...notesRef.current, pages: [...notesRef.current.pages, ...added] });
      setNotice(`${added.length} page(s) added in selection order. ${errors.join(' ')}`);
    } finally { finish(attempt); }
  }
  async function restoreBackup(file: File) {
    if (notesRef.current.pages.length) return;
    const attempt = begin({ kind: 'import' }); if (attempt === null) return;
    revokeConsent(); setNotice('Importing backup…');
    try {
      if (file.size > 9_000_000) throw new Error('Backup too large.');
      const value = importedNotes(JSON.parse(await file.text()));
      for (const page of value.pages) {
        const image = new Image(); image.src = page.image; await decode(image);
        if (!image.naturalWidth || image.naturalWidth > 1600 || image.naturalHeight > 1600) throw new Error('Invalid backup image.');
        if (attempt !== generation.current) return;
      }
      if (attempt !== generation.current) return;
      replace(value); setNotice('Backup imported. Provider permission and page reviews were cleared. Check every page again.');
    } catch { if (attempt === generation.current) setNotice('Invalid backup. Use a notes backup under 9 MB with unique canonical page IDs and real JPEG pages up to 1600 px. Nothing was imported.'); }
    finally { finish(attempt); }
  }
  async function transcribe(id: string) {
    const page = notesRef.current.pages.find(item => item.id === id);
    if (!page || !photoPageIdSchema.safeParse(id).success || consentRef.current !== id || page.text) return;
    const attempt = begin({ kind: 'transcribe', pageId: id }); if (attempt === null) return;
    const abort = new AbortController(); controller.current = abort; revokeConsent(); setNotice('Transcribing one page…');
    try {
      const response = await fetch('/api/do/vision', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: 'image/jpeg', data: page.image.split(',')[1], question: 'Transcribe this handwritten page in reading order. Mark unclear words and any continuation.', purpose: 'transcription', consent: true }),
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(55_000)]),
      });
      const body = await response.json(); if (!response.ok) throw new Error(body.message || 'Transcription failed.');
      if (abort.signal.aborted || attempt !== generation.current) return;
      const result = body as DoVisionResult;
      if (typeof result.text !== 'string' || !result.text.trim() || result.text.length > 12000) throw new Error('No readable transcription was returned.');
      update(id, { text: result.text, receipt: result.receipt, completion: transcriptionCompletion(result.completion), reviewed: false });
      setNotice('Text is ready for manual review. Provider status does not verify every word. Check the whole page before downloading.');
    } catch (error) {
      if (attempt === generation.current) setNotice(`${error instanceof Error ? error.message : 'Transcription failed.'} Photos and previous text remain. Confirm again before retrying; a started call may have used a task.`);
    } finally { finish(attempt); }
  }
  function changeConsent(id: string, checked: boolean) {
    if (dispatch.current.kind !== 'idle' || !active || !photoPageIdSchema.safeParse(id).success) return;
    consentRef.current = checked ? id : null; setConsent(checked ? id : null);
  }
  function mutate(action: (value: PhotoNotes) => PhotoNotes) {
    if (dispatch.current.kind !== 'idle') return;
    revokeConsent(); replace(action(notesRef.current));
  }
  return <section aria-label="Handwritten notes" className={styles.result}>
    <h3>Pages to text</h3>
    <p>Add up to three pages, together or one at a time.</p>
    <p>PNG, JPEG or WebP · 10 MB each.</p>
    <div className={styles.actions}>
      <button disabled={pending || notes.pages.length >= 3} onClick={() => upload.current?.click()}>Add photos</button>
      <input ref={upload} type="file" multiple disabled={pending} accept="image/png,image/jpeg,image/webp" aria-label="Add handwritten note photos" className={styles.file} onChange={event => { const files = Array.from(event.target.files || []); event.target.value = ''; if (files.length) void add(files); }} />
      <button disabled={pending || !notes.pages.length} onClick={() => download('do-notes-backup.json', JSON.stringify(notes), 'application/json')}>Backup photos + text</button>
      <button disabled={pending || !!notes.pages.length} onClick={() => restore.current?.click()}>Import backup</button>
      <input ref={restore} type="file" disabled={pending || !!notes.pages.length} accept="application/json" aria-label="Import note backup" className={styles.file} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void restoreBackup(file); }} />
      <button disabled={pending || !notes.pages.length} onClick={() => mutate(() => empty())}>Clear photos and text</button>
    </div>
    <small>Leaving or reloading clears these photos and text. Download a backup first and keep it private.</small>
    <label>Document title<input value={notes.title} maxLength={160} disabled={pending} onChange={event => mutate(value => ({ ...value, title: event.target.value }))} /></label>
    {notes.pages.map((page, index) => <div className={styles.review} key={page.id}>
      <figure>
        {/* Local data URL only; no remote image service. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={page.image} alt={`Handwritten page ${index + 1}: ${page.name}`} />
        <figcaption>Page {index + 1} · {page.name}</figcaption>
        <div className={styles.actions}>
          <button disabled={pending || index === 0} aria-label={`Move page ${index + 1} earlier`} onClick={() => mutate(value => { const pages = [...value.pages]; [pages[index - 1], pages[index]] = [pages[index], pages[index - 1]]; return { ...value, pages }; })}>Earlier</button>
          <button disabled={pending || index === notes.pages.length - 1} aria-label={`Move page ${index + 1} later`} onClick={() => mutate(value => { const pages = [...value.pages]; [pages[index], pages[index + 1]] = [pages[index + 1], pages[index]]; return { ...value, pages }; })}>Later</button>
          <button disabled={pending} onClick={() => mutate(value => ({ ...value, pages: value.pages.filter(item => item.id !== page.id) }))}>Remove page {index + 1}</button>
        </div>
      </figure>
      <div>
        <label className={styles.consent}><input type="checkbox" checked={consent === page.id} disabled={pending || !!page.text} onChange={event => changeConsent(page.id, event.target.checked)} />Send only page {index + 1} once to assembl’s configured OpenAI, Anthropic or Google vision provider for transcription · 1 task.</label>
        <button disabled={pending || consent !== page.id || !!page.text} onClick={() => void transcribe(page.id)}>Transcribe page {index + 1}</button>
        {busy.kind === 'transcribe' && busy.pageId === page.id && <button onClick={stop}>Stop</button>}
        <label>Page {index + 1} text — review against the photo<textarea value={page.text} maxLength={12000} rows={8} disabled={pending} onChange={event => { if (dispatch.current.kind !== 'idle') return; revokeConsent(); update(page.id, { text: event.target.value, reviewed: false }); }} /></label>
        {page.text && <p className={styles.completion} data-completion={page.completion?.status ?? 'unverified'}>{completionWarning(page)}</p>}
        <label className={styles.consent}><input type="checkbox" checked={page.reviewed} disabled={pending || !page.text.trim()} onChange={event => { if (dispatch.current.kind === 'idle') update(page.id, { reviewed: event.target.checked }); }} />{page.completion?.status === 'incomplete' ? 'I supplied any missing text and checked the entire page against the photo.' : 'I checked every line and the end of this page, and supplied unclear or missing words.'}</label>
        {page.receipt && <details><summary>Transcription receipt</summary><p>{page.receipt.model} · {page.receipt.createdAt}</p><p>{page.receipt.boundary}</p>{page.completion && <p>Provider ending: {page.completion.finishReason} · {page.completion.providerStatus ?? page.completion.rawFinishReason ?? 'unverified'}</p>}</details>}
      </div>
    </div>)}
    <div className={styles.actions}>
      <button disabled={pending || !notesReady(notes)} onClick={() => download('do-typed-notes.html', notesHtml(notes), 'text/html;charset=utf-8')}>Download readable document</button>
      <button disabled={pending || !notesReady(notes)} onClick={() => download('do-typed-notes.txt', notesText(notes), 'text/plain;charset=utf-8')}>Download typed text</button>
    </div>
    <small>Open the downloaded document to print or save as PDF.</small>
    {notice && <p role="status">{notice}</p>}
  </section>;
}
