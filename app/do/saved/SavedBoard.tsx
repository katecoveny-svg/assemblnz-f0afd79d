'use client';
/* eslint-disable @next/next/no-img-element -- Local data URLs must never enter an image proxy; approved static art is already WebP. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, ImagePlus, Plus, Search, X } from 'lucide-react';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
import { savedExamples } from '@/lib/do/saved/fixtures';
import { MAX_BOARD_ITEMS, saveIntentSchema, searchSaved, taskFromSaved, type SavedItem, type SaveIntent } from '@/lib/do/saved/save-intent';
import { prepareLocalImage } from '@/lib/do/saved/image';
import styles from './saved.module.css';

const blank: SaveIntent = { version: 1, kind: 'note', title: '', text: '', sourceUrl: '', tags: [] };
const kinds = ['all', 'image', 'link', 'text', 'note'] as const;
const labels = { all: 'Everything', image: 'Images', link: 'Links', text: 'Highlights', note: 'Notes' };

export default function SavedBoard() {
  const [items, setItems] = useState<SavedItem[]>(savedExamples);
  const [query, setQuery] = useState(''); const [kind, setKind] = useState('all');
  const [editor, setEditor] = useState<SaveIntent | null>(null); const [image, setImage] = useState<string>();
  const [review, setReview] = useState(false); const [localConsent, setLocalConsent] = useState(false);
  const [busy, setBusy] = useState(false); const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<SavedItem | null>(null);
  const [task, setTask] = useState(''); const [taskReview, setTaskReview] = useState(false);
  const [taskText, setTaskText] = useState(''); const [receipt, setReceipt] = useState('');
  const dialog = useRef<HTMLDialogElement>(null); const opener = useRef<HTMLElement | null>(null);
  const fileGeneration = useRef(0);
  const visible = searchSaved(items, query, kind);
  const dirty = items.some(item => !item.fictional) || Boolean(editor?.title || editor?.text || editor?.sourceUrl || editor?.tags.some(Boolean) || image);
  const modalOpen = Boolean(editor || selected);
  useEffect(() => {
    if (modalOpen) { opener.current = document.activeElement as HTMLElement; dialog.current?.showModal(); }
    else { dialog.current?.close(); opener.current?.focus(); }
  }, [modalOpen]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function close() {
    fileGeneration.current++; setEditor(null); setSelected(null); setImage(undefined); setReview(false);
    setLocalConsent(false); setBusy(false); setTaskReview(false); setTask(''); setReceipt(''); setNotice('');
  }
  function add() { setNotice(''); setEditor({ ...blank }); }
  function reviewSave() {
    const parsed = saveIntentSchema.safeParse(editor);
    if (!parsed.success) { setNotice(parsed.error.issues[0].message); return; }
    if (parsed.data.kind === 'image' && !image) { setNotice('Choose an image to preview first.'); return; }
    setEditor(parsed.data); setReview(true); setNotice('');
  }
  function save() {
    if (!editor || !review || !localConsent || items.length >= MAX_BOARD_ITEMS) return;
    const next: SavedItem = { ...saveIntentSchema.parse(editor), id: crypto.randomUUID(), createdAt: new Date().toISOString(), revision: 1, ...(editor.kind === 'image' ? { image } : {}) };
    setItems(current => [next, ...current]); close(); setQuery(''); setKind('all'); setNotice('Added for this visit. Reloading or leaving clears your additions.');
  }
  async function chooseImage(file?: File) {
    if (!file) return;
    const generation = ++fileGeneration.current; setBusy(true); setNotice('');
    try { const next = await prepareLocalImage(file); if (generation === fileGeneration.current) setImage(next); }
    catch (error) { if (generation === fileGeneration.current) setNotice((error as Error).message); }
    finally { if (generation === fileGeneration.current) setBusy(false); }
  }
  async function copyTask() {
    try { await navigator.clipboard.writeText(taskText); setReceipt('Task draft copied, including its source reference. Paste it into Write in DO and review it there.'); }
    catch { setNotice('Clipboard unavailable. Select and copy the draft below.'); }
  }
  return <div className={styles.board} onClickCapture={event => {
    if (!dirty || !(event.target instanceof Element)) return;
    const link = event.target.closest('a');
    if (link && !link.target && !window.confirm('Leave this preview? Your additions only exist for this visit.')) event.preventDefault();
  }}>
    <header className={styles.header}>
      <Link href="/do" className={styles.brand} aria-label="DO home"><GlassIdentity kind="do" size={50} /><span>DO</span></Link>
      <nav aria-label="DO workspace"><Link href="/do">Today</Link><Link href="/do/saved" aria-current="page">Saved</Link><Link href="/do/continue">Tasks</Link></nav>
      <span className={styles.preview}>Session preview</span>
    </header>
    <section className={styles.intro}>
      <div><p className={styles.eyebrow}>A little space for possibility</p><h1>Keep what<br /><span>catches your mind.</span></h1><p>Images, words, places, someday things.<br />Gather them here. Give one a next step.</p></div>
      <button className={styles.add} onClick={add} disabled={items.length >= MAX_BOARD_ITEMS}><Plus size={20} /> Add something</button>
    </section>
    <div className={styles.toolbar}>
      <label className={styles.search}><Search size={19} aria-hidden="true" /><span className={styles.sr}>Search saved items</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a word, a colour, an idea…" />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={18} /></button>}</label>
      <div className={styles.filters} aria-label="Item types">{kinds.map(value => <button key={value} aria-pressed={kind === value} onClick={() => setKind(value)}>{labels[value]}</button>)}</div>
    </div>
    <div className={styles.caption}><span>{visible.length} things to come back to</span><span>Fictional examples · additions stay in this tab until you leave</span></div>
    <p role="status" className={styles.notice}>{!modalOpen && notice}</p>
    <section className={styles.grid} aria-label="Saved ideas">{visible.map((item, index) => <button key={item.id} aria-label={`Open ${item.title}`} className={`${styles.card} ${styles[item.kind]} ${styles[`tone${index % 3}`]}`} onClick={() => { setSelected(item); setTask('Explore a useful next step for this idea.'); }}>
      {item.image && <img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" />}
      {!item.image && <div className={styles.cardWords}>{item.kind === 'link' ? <ArrowUpRight size={34} /> : <span className={styles.quote}>“</span>}<p>{item.kind === 'link' ? 'Somewhere new.' : item.text}</p></div>}
      <div className={styles.cardFoot}><span>{item.fictional ? 'Fictional example' : labels[item.kind]} <span aria-hidden="true">↗</span></span><h2>{item.title}</h2><p>{item.tags.join(' · ')}</p></div>
    </button>)}</section>
    {!visible.length && <div className={styles.empty}><h2>A little room for a new idea.</h2><p>{query ? 'Try a different word or clear your filters.' : 'Add a link, an image or a thought of your own.'}</p><button onClick={() => { setQuery(''); setKind('all'); }}>Show everything</button></div>}
    <footer className={styles.footer}><p>Yours to try. Nothing here is saved to an account.</p><p>Browser, Mac and phone capture connections are still in development.</p><button onClick={() => { if (window.confirm('Clear this board for this visit, including your additions?')) { setItems([]); setNotice('Board cleared for this visit.'); } }}>Clear this board</button></footer>
    <dialog ref={dialog} aria-labelledby={editor ? "save-title" : "detail-title"} className={styles.dialog} onCancel={event => { event.preventDefault(); close(); }}>
      <button className={styles.close} onClick={close} aria-label="Close dialog"><X /></button>
      {editor && <section aria-labelledby="save-title"><p className={styles.eyebrow}>{review ? 'One last look' : 'Save to DO'}</p><h2 id="save-title">{review ? 'Keep this for this visit?' : 'What caught your mind?'}</h2>
        {!review ? <><div className={styles.filters}>{kinds.filter(value => value !== 'all').map(value => <button key={value} aria-pressed={editor.kind === value} onClick={() => { fileGeneration.current++; setBusy(false); setImage(undefined); setEditor({ ...editor, kind: value as SaveIntent['kind'] }); }}>{labels[value]}</button>)}</div>
          <label>Title<input autoFocus maxLength={160} value={editor.title} onChange={event => setEditor({ ...editor, title: event.target.value })} /></label>
          {editor.kind === 'image' && <div className={styles.upload}><ImagePlus /><label>Choose an image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => void chooseImage(event.target.files?.[0])} /></label><p>Choosing a file processes a smaller preview on this device. No upload, text recognition or provider processing. JPEG, PNG or WebP · up to 5 MB.</p>{image && <img src={image} alt="Your selected image preview" />}</div>}
          <label>{editor.kind === 'text' ? 'Selected words' : 'A note to yourself'}<textarea rows={4} maxLength={6000} value={editor.text} onChange={event => setEditor({ ...editor, text: event.target.value })} /></label>
          <label>Source link {editor.kind !== 'link' && '(optional)'}<input type="url" value={editor.sourceUrl} onChange={event => setEditor({ ...editor, sourceUrl: event.target.value })} placeholder="https://" /></label><p className={styles.help}>Public HTTPS links only. Query strings and fragments are removed for review. Pages and remote images are never fetched.</p>
          <label>Words to find it by (comma separated)<input maxLength={264} value={editor.tags.join(',')} onChange={event => setEditor({ ...editor, tags: event.target.value.split(',') })} /></label>
          <button className={styles.primary} disabled={busy} onClick={reviewSave}>{busy ? 'Preparing image…' : 'Review addition'} <ArrowUpRight size={17} /></button>
        </> : <><div className={styles.review}>{image && editor.kind === 'image' && <img src={image} alt="Reviewed image" />}<h3>{editor.title}</h3><p>{editor.text}</p><p>{editor.sourceUrl}</p><small>{editor.tags.join(' · ')}</small></div><label className={styles.consent}><input type="checkbox" checked={localConsent} onChange={event => setLocalConsent(event.target.checked)} />Keep this in this tab for this visit. It disappears when I reload or leave.</label><p className={styles.help}>Please use ordinary inspiration, not passwords, payment details or sensitive records.</p><button className={styles.primary} disabled={!localConsent} onClick={save}><Check size={18} /> Add to my board</button><button className={styles.secondary} onClick={() => { setReview(false); setLocalConsent(false); }}>Edit first</button></>}
      </section>}
      {selected && <section aria-labelledby="detail-title"><p className={styles.eyebrow}>{selected.fictional ? 'Fictional example' : 'Saved for this visit'}</p>{selected.image && <img className={styles.detailImage} src={selected.image} alt={selected.title} />}<h2 id="detail-title">{selected.title}</h2><p className={styles.detailText}>{selected.text}</p><p className={styles.help}>{selected.tags.join(' · ')}</p>{selected.sourceUrl && <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open original source ↗</a>}
        <div className={styles.next}><h3>Make something of it.</h3><p>A small next step, with the source attached.</p><label>What would you like to do?<textarea rows={3} maxLength={1200} value={task} onChange={event => { setTask(event.target.value); setTaskReview(false); setReceipt(''); }} /></label><button className={styles.primary} onClick={() => { try { setTaskText(taskFromSaved(selected, task)); setTaskReview(true); } catch (error) { setNotice((error as Error).message); } }}>Prepare task draft <ArrowUpRight size={18} /></button>
        {taskReview && <div className={styles.review}><label>Review your task draft<textarea readOnly rows={8} value={taskText} /></label><p className={styles.help}>Copy includes the words and source shown above. No image bytes or action permissions. Nothing runs or saves online.</p><button className={styles.primary} onClick={() => void copyTask()}>Copy task for DO</button><Link href="/do">Open DO to paste into Write ↗</Link><p role="status">{receipt}</p></div>}</div>
        <button className={styles.secondary} onClick={() => { setItems(current => current.filter(item => item.id !== selected.id)); close(); setNotice('Removed from this visit’s board.'); }}>Remove from this board</button>
      </section>}
      <p role="status" className={styles.notice}>{modalOpen && notice}</p>
    </dialog>
  </div>;
}
