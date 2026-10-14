'use client';

import ShopJourney from '@/app/do/shop/ShopJourney';
import { DoLocalInformation } from './DoLocalInformation';
import { useCallback, useEffect, useState } from 'react';
import { FileText, Mic, Eye, Settings2 } from 'lucide-react';
import { DoTextWorkspace } from '@/app/do/DoTextWorkspace';
import { DoCompanionConversation } from './DoCompanionConversation';
import { DoVision } from '@/app/do/DoVision';
import { DoWorkspace } from '@/app/do/DoWorkspace';
import { DoProductFrame, useDoEmbeddedSurface } from './DoProductFrame';
import styles from './do-product-focus.module.css';
import { DoGlassHero } from './DoGlassHero';
import { useDoCompanionEntry } from './useDoCompanionEntry';
import type { PersonalDoProfile } from '@/apps/do/personal/profile';
import type { CompanionEntry } from '@/apps/do/shared/companion-entry';
import type { DoTask } from '@/apps/do/shared/preparation';

type Mode = 'write' | 'talk' | 'look' | 'build' | 'shop' | 'draft';
export function DoFocusWorkspace({ initialTask = 'reply', expectedWorkspace }: { initialTask?: DoTask; expectedWorkspace?: string }) {
  const [shoppingBrief, setShoppingBrief] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('write');
  const [builderOpened, setBuilderOpened] = useState(false);
  const [context, setContext] = useState('');
  const [offeredContext, setOfferedContext] = useState<{ text: string; id: number }>();
  const embedded = useDoEmbeddedSurface();
  const [focusRequest, setFocusRequest] = useState(0);
  const [talkOpened, setTalkOpened] = useState(false);
  const [requestedTalk, setRequestedTalk] = useState(false);
  // Readiness admits a new panel; later checks must not tear down an admitted session.
  const [talkProfile, setTalkProfile] = useState<PersonalDoProfile>();
  const enter = useCallback((entry: CompanionEntry, reviewedProfile?: PersonalDoProfile) => { setRequestedTalk(false); if (entry === 'talk') { setTalkProfile(reviewedProfile); setTalkOpened(true); } setMode(entry); if (entry === 'write') setFocusRequest(value => value + 1); }, []);
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
  function acceptShoppingBrief(text: string) {
    // This component is keyed and unmounted by the existing verified owner boundary.
    if (!expectedWorkspace || shoppingBrief !== null || !text.trim() || text.length > 6000) return false;
    setShoppingBrief(text.trim()); setMode('shop'); return true;
  }
  function acceptContext(text: string) {
    if (!text.trim() || text.length > 12000) return false;
    setOfferedContext({ text, id: Date.now() }); enter('write'); return true;
  }
  return <DoProductFrame product="Conversation">
    <section className={`${styles.hero} ${styles.workspaceHero}`} data-embedded={embedded || undefined}>
      <div className={styles.workspaceIntro}>
      <h1>What would you like done?</h1>
      <p>Bring a question, a plan or the thing on your mind.</p>
      </div><DoGlassHero embedded={embedded} />
    </section>
    <div className={styles.workspace}>
      <nav className={styles.workspaceModes} aria-label="Ways to work with DO">
        <button aria-pressed={mode === 'write'} onClick={() => enter('write')}><FileText size={15} />Write</button>
        <button aria-pressed={mode === 'talk'} disabled={!talk.canOpen} aria-describedby="do-talk-readiness" onClick={() => enter('talk', profile)}><Mic size={15} />Talk</button>
        {shoppingBrief !== null && <button aria-pressed={mode === 'shop'} onClick={() => setMode('shop')}>Shopping plan</button>}
        <button aria-pressed={mode === 'look'} onClick={() => { setRequestedTalk(false); setMode('look'); }}><Eye size={15} />Add image</button>
      </nav>
      <p id="do-talk-readiness" role="status" className={styles.help}>{talk.message} <button type="button" className={styles.textButton} onClick={() => void refresh()}>Check Talk</button></p>
      <div hidden={mode !== 'write' && mode !== 'talk'}><DoCompanionConversation focusRequest={mode === 'write' ? focusRequest : 0} profile={talkProfile ?? profile} snapshot={context} talkOpened={talkOpened} onShoppingDraft={acceptShoppingBrief} visible={mode === 'write' || mode === 'talk'} onDraft={acceptContext} /></div>
      <div hidden={mode !== 'draft'}><DoTextWorkspace embedded={embedded} initialTask={initialTask} focus focusRequest={mode === 'draft' ? focusRequest : 0} offeredContext={offeredContext} onSourceChange={setContext} onNativeReveal={() => enter('write')} /></div>
      {mode !== 'write' && <button type="button" className={styles.textButton} onClick={() => enter('write')}>Back to Write</button>}
      <section hidden={mode !== 'look'} className={styles.toolSurface} aria-label="Show DO an image"><DoVision active={mode === 'look'} onUse={acceptContext} /></section>
      {shoppingBrief !== null && <section hidden={mode !== 'shop'} aria-label="Shopping plan from reviewed call">
        <button type="button" className={styles.textButton} onClick={() => { if (window.confirm('Discard this unsaved shopping plan?')) { setShoppingBrief(null); enter('write'); } }}>Discard shopping plan</button>
        <ShopJourney embedded initialBrief={shoppingBrief} expectedWorkspace={expectedWorkspace} />
      </section>}
      {mode === 'write' && <DoLocalInformation />}
      <details className={styles.secondaryDetails} onToggle={e => { if (!e.currentTarget.open && mode === 'build') setMode('write'); }}>
        <summary><Settings2 size={13} aria-hidden="true" style={{ display: 'inline', marginRight: 8 }} />Tools &amp; examples</summary>
        <button type="button" onClick={() => { setMode('draft'); setFocusRequest(value => value + 1); }}>Open draft tools</button>
        <p>Templates, appearance and the advanced builder. Your writing draft stays in this page.</p>
        <button className={styles.textButton} onClick={() => { setRequestedTalk(false); setBuilderOpened(true); setMode(mode === 'build' ? 'write' : 'build'); }}>{mode === 'build' ? 'Back to writing' : 'Open the builder'}</button>
      </details>
      {builderOpened && <section hidden={mode !== 'build'} className={styles.toolSurface} aria-label="DO builder workspace"><DoWorkspace embedded active={mode === 'build'} /></section>}
      <p className={styles.privacyNote}>Nothing runs just because you open a tool. You choose what to share.</p>
    </div>
  </DoProductFrame>;
}
