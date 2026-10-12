'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { FileText, Mic, Eye, AudioLines, Settings2 } from 'lucide-react';
import { DoTextWorkspace } from '@/app/do/DoTextWorkspace';
import { DoGeminiLive } from '@/app/do/DoGeminiLive';
import { DoVision } from '@/app/do/DoVision';
import { DoWorkspace } from '@/app/do/DoWorkspace';
import { DoProductFrame, useDoEmbeddedSurface } from './DoProductFrame';
import styles from './do-product-focus.module.css';
import { DoGlassHero } from './DoGlassHero';
import { useDoCompanionEntry } from './useDoCompanionEntry';
import type { PersonalDoProfile } from '@/apps/do/personal/profile';
import type { CompanionEntry } from '@/apps/do/shared/companion-entry';
import type { DoTask } from '@/apps/do/shared/preparation';

type Mode = 'write' | 'talk' | 'look' | 'build';
export function DoFocusWorkspace({ initialTask = 'reply' }: { initialTask?: DoTask }) {
  const [mode, setMode] = useState<Mode>('write');
  const [builderOpened, setBuilderOpened] = useState(false);
  const [context, setContext] = useState('');
  const [offeredContext, setOfferedContext] = useState<{ text: string; id: number }>();
  const embedded = useDoEmbeddedSurface();
  const [focusRequest, setFocusRequest] = useState(0);
  const [requestedTalk, setRequestedTalk] = useState(false);
  // Readiness admits a new panel; later checks must not tear down an admitted session.
  const [talkProfile, setTalkProfile] = useState<PersonalDoProfile>();
  const enter = useCallback((entry: CompanionEntry, reviewedProfile?: PersonalDoProfile) => { setRequestedTalk(false); if (entry === 'talk') setTalkProfile(reviewedProfile); setMode(entry); if (entry === 'write') setFocusRequest(value => value + 1); }, []);
  const { talk, refresh, profile } = useDoCompanionEntry(enter);
  useEffect(() => {
    const entry = new URLSearchParams(location.search).get('entry');
    const frame = requestAnimationFrame(() => { if (entry === 'write') enter('write'); if (entry === 'talk') setRequestedTalk(true); });
    return () => cancelAnimationFrame(frame);
  }, [enter]);
  useEffect(() => { if (!requestedTalk || !talk.canOpen) return; const frame = requestAnimationFrame(() => { enter('talk', profile); }); return () => cancelAnimationFrame(frame); }, [requestedTalk, talk.canOpen, profile, enter]);
  useEffect(() => {
    const tool = new URL(window.location.href).searchParams.get('tool');
    if (tool !== 'talk' && tool !== 'look') return;
    // Opening a tool is navigation only. Media and provider consent remain inside it.
    const frame = requestAnimationFrame(() => { if (tool === 'talk') setRequestedTalk(true); else { setRequestedTalk(false); setMode(tool); } });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    // The portable D returns to this mounted editor rather than nesting another workspace.
    const focus = () => enter('write');
    const image = () => { if (new URLSearchParams(location.search).get('nativeReview') === '1') { setRequestedTalk(false); setMode('look'); } };
    window.addEventListener('assembl:do-focus', focus);
    window.addEventListener('assembl:do-focus-image', image);
    return () => { window.removeEventListener('assembl:do-focus', focus); window.removeEventListener('assembl:do-focus-image', image); };
  }, [enter]);
  function acceptContext(text: string) {
    if (!text.trim() || text.length > 12000) return false;
    setOfferedContext({ text, id: Date.now() }); enter('write'); return true;
  }
  return <DoProductFrame product="Writing & capture">
    <section className={`${styles.hero} ${styles.workspaceHero}`} data-embedded={embedded || undefined}>
      <div className={styles.workspaceIntro}>
      <h1>What would you like done?</h1>
      <p>A photo, your voice or a note.</p>
      </div><DoGlassHero embedded={embedded} />
    </section>
    <div className={styles.workspace}>
      <nav className={styles.workspaceModes} aria-label="Ways to work with DO">
        <button aria-pressed={mode === 'write'} onClick={() => enter('write')}><FileText size={15} />Write</button>
        <button aria-pressed={mode === 'talk'} disabled={!talk.canOpen} aria-describedby="do-talk-readiness" onClick={() => enter('talk', profile)}><Mic size={15} />Talk</button>
        <button aria-pressed={mode === 'look'} onClick={() => { setRequestedTalk(false); setMode('look'); }}><Eye size={15} />Photo</button>
        <Link href="/do/meetings" target={embedded ? '_blank' : undefined} rel={embedded ? 'noopener noreferrer' : undefined}><AudioLines size={15} />Meet</Link>
      </nav>
      <p id="do-talk-readiness" role="status" className={styles.help}>{talk.message} <button type="button" className={styles.textButton} onClick={() => void refresh()}>Check Talk</button></p>
      <div hidden={mode !== 'write'}><DoTextWorkspace embedded={embedded} initialTask={initialTask} focus focusRequest={focusRequest} offeredContext={offeredContext} onSourceChange={setContext} onNativeReveal={() => enter('write')} /></div>
      {mode !== 'write' && <button type="button" className={styles.textButton} onClick={() => enter('write')}>Back to Write</button>}
      {embedded && (mode === 'talk' || mode === 'look') ? <section className={styles.toolSurface} aria-label="Open this tool in a full window">
        <h2>{mode === 'talk' ? 'A conversation with DO.' : 'Show DO what you mean.'}</h2>
        <p className={styles.help}>Open this tool in its own window for sign-in and device permissions. Your draft stays here. No source text is transferred automatically.</p>
        <Link className={styles.primary} style={{ color: '#FFFDFB', textDecoration: 'none' }} href={`/do/widget?tool=${mode}`} target="_blank" rel="noopener noreferrer">{mode === 'talk' ? 'Open voice in a full window' : 'Open vision in a full window'}</Link>
      </section> : <>
        {mode === 'talk' && <div className={styles.toolSurface}><DoGeminiLive profile={talkProfile} context={context} onDraft={acceptContext} /></div>}
        <section hidden={mode !== 'look'} className={styles.toolSurface} aria-label="Show DO an image"><DoVision active={mode === 'look'} onUse={acceptContext} /></section>
      </>}
      <details className={styles.secondaryDetails} onToggle={e => { if (!e.currentTarget.open && mode === 'build') setMode('write'); }}>
        <summary><Settings2 size={13} aria-hidden="true" style={{ display: 'inline', marginRight: 8 }} />Build or customise a DO</summary>
        <p>Templates, appearance and the advanced builder. Your writing draft stays in this page.</p>
        <button className={styles.textButton} onClick={() => { setRequestedTalk(false); setBuilderOpened(true); setMode(mode === 'build' ? 'write' : 'build'); }}>{mode === 'build' ? 'Back to writing' : 'Open the builder'}</button>
      </details>
      {builderOpened && <section hidden={mode !== 'build'} className={styles.toolSurface} aria-label="DO builder workspace"><DoWorkspace embedded active={mode === 'build'} /></section>}
      <p className={styles.privacyNote}>Nothing runs just because you open a tool. You choose what to share.</p>
    </div>
  </DoProductFrame>;
}
