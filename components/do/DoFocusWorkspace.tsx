'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileText, Mic, Eye, AudioLines, Settings2 } from 'lucide-react';
import { DoTextWorkspace } from '@/app/do/DoTextWorkspace';
import { DoGeminiLive } from '@/app/do/DoGeminiLive';
import { DoVision } from '@/app/do/DoVision';
import { DoWorkspace } from '@/app/do/DoWorkspace';
import { DoProductFrame, useDoEmbeddedSurface } from './DoProductFrame';
import styles from './do-product-focus.module.css';
import type { DoTask } from '@/apps/do/shared/preparation';

type Mode = 'write' | 'talk' | 'look' | 'build';
export function DoFocusWorkspace({ initialTask = 'reply' }: { initialTask?: DoTask }) {
  const [mode, setMode] = useState<Mode>('write');
  const [context, setContext] = useState('');
  const [offeredContext, setOfferedContext] = useState<{ text: string; id: number }>();
  const embedded = useDoEmbeddedSurface();
  useEffect(() => {
    const tool = new URL(window.location.href).searchParams.get('tool');
    if (tool !== 'talk' && tool !== 'look') return;
    // Opening a tool is navigation only. Media and provider consent remain inside it.
    const frame = requestAnimationFrame(() => setMode(tool));
    return () => cancelAnimationFrame(frame);
  }, []);
  function acceptContext(text: string) {
    if (!text.trim() || text.length > 12000) return false;
    setOfferedContext({ text, id: Date.now() }); setMode('write'); return true;
  }
  return <DoProductFrame product="your workspace">
    <section className={styles.hero}>
      <p className={styles.kicker}>A LITTLE HELP, RIGHT HERE</p>
      <h1>What needs doing?</h1>
      <p>Bring the context. Choose a task. Leave with something useful.</p>
    </section>
    <div className={styles.workspace}>
      <nav className={styles.workspaceModes} aria-label="Ways to work with DO">
        <button aria-pressed={mode === 'write'} onClick={() => setMode('write')}><FileText size={15} />Write</button>
        <button aria-pressed={mode === 'talk'} onClick={() => setMode('talk')}><Mic size={15} />Talk</button>
        <button aria-pressed={mode === 'look'} onClick={() => setMode('look')}><Eye size={15} />Look</button>
        <Link href="/do/meetings" target={embedded ? '_blank' : undefined} rel={embedded ? 'noopener noreferrer' : undefined}><AudioLines size={15} />Meet</Link>
      </nav>
      <div hidden={mode !== 'write'}><DoTextWorkspace embedded={embedded} initialTask={initialTask} focus offeredContext={offeredContext} onSourceChange={setContext} /></div>
      {embedded && (mode === 'talk' || mode === 'look') ? <section className={styles.toolSurface} aria-label="Open this tool in a full window">
        <h2>{mode === 'talk' ? 'A conversation with DO.' : 'Show DO what you mean.'}</h2>
        <p className={styles.help}>Open this tool in its own window for sign-in and device permissions. Your draft stays here. No source text is transferred automatically.</p>
        <Link className={styles.primary} style={{ color: '#FFFDFB', textDecoration: 'none' }} href={`/do/widget?tool=${mode}`} target="_blank" rel="noopener noreferrer">{mode === 'talk' ? 'Open voice in a full window' : 'Open vision in a full window'}</Link>
      </section> : <>
        {mode === 'talk' && <div className={styles.toolSurface}><DoGeminiLive context={context} onDraft={acceptContext} /></div>}
        {mode === 'look' && <section className={styles.toolSurface} aria-label="Show DO an image"><DoVision onUse={acceptContext} /></section>}
      </>}
      <details className={styles.secondaryDetails} onToggle={e => { if (!e.currentTarget.open && mode === 'build') setMode('write'); }}>
        <summary><Settings2 size={13} aria-hidden="true" style={{ display: 'inline', marginRight: 8 }} />Build or customise a DO</summary>
        <p>Templates, appearance and the advanced builder. Your writing draft stays in this page.</p>
        <button className={styles.textButton} onClick={() => setMode(mode === 'build' ? 'write' : 'build')}>{mode === 'build' ? 'Back to writing' : 'Open the builder'}</button>
      </details>
      {mode === 'build' && <section className={styles.toolSurface}><DoWorkspace embedded /></section>}
      <p className={styles.privacyNote}>Nothing runs just because you open a tool. You choose what to share.</p>
    </div>
  </DoProductFrame>;
}
