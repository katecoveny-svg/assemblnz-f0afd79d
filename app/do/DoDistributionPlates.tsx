'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { AgentSpec } from '@/apps/do/shared/types';
import {
  applyClearSuggestions,
  CLEAR_HONESTY,
  scanClearWriting,
  type ClearIssue,
} from '@/apps/do/shared/clear-writing';

type Groups = Record<'needs_you' | 'working' | 'done', AgentSpec[]>;

const CLEAR_SAMPLE =
  'We will unlock next-generation value and seamlessly leverage our robust AI-powered landscape to revolutionise your workflow. Its important to note that we could of delivered this alot sooner.';

const KEYBOARD_KEYS = ['Watch', 'Brief', 'Slop-check', 'Mitre brief'];

export function DoDistributionPlates({
  groups,
  onRefresh,
  onWhatsAppSim,
  onOpenClearAgent,
  busy,
}: {
  groups: Groups;
  onRefresh: () => void;
  onWhatsAppSim: () => void;
  onOpenClearAgent: () => void;
  busy?: boolean;
}) {
  const needsYou = groups.needs_you;
  const top = needsYou[0];
  const [clearText, setClearText] = useState(CLEAR_SAMPLE);
  const [issues, setIssues] = useState<ClearIssue[]>([]);
  const [rewrite, setRewrite] = useState('');
  const [clearNote, setClearNote] = useState(CLEAR_HONESTY);
  const [waNote, setWaNote] = useState('');

  const runClear = useCallback(() => {
    const found = scanClearWriting(clearText);
    setIssues(found);
    const result = applyClearSuggestions(clearText, found);
    setRewrite(result.rewritten);
    setClearNote(result.honesty);
  }, [clearText]);

  useEffect(() => {
    runClear();
  }, [runClear]);

  return (
    <section className="do-plates" aria-label="Distribution layers DEMO">
      <h2 className="do-section-title">Distribution layers</h2>
      <p className="do-board-lede">
        Browser ✦ is live. Share / WhatsApp / Keyboard / Home widget are DEMO plates + native stubs.
      </p>

      <div className="do-plate-grid">
        {/* Share + WhatsApp */}
        <article className="do-plate">
          <p className="do-mono">01 · Share + WhatsApp</p>
          <h3>Paste / share into DO</h3>
          <p>
            Web Share Target at <code>/api/do/share</code>. iOS Share Sheet → native DO when the app
            ships.
          </p>
          <div className="do-plate-actions">
            <Link className="do-cta do-cta-secondary" href="/do/share">
              Open share intake
            </Link>
            <button
              type="button"
              className="do-cta do-cta-secondary"
              disabled={busy}
              onClick={() => {
                setWaNote('Running WhatsApp fixture sim…');
                onWhatsAppSim();
                setWaNote('WhatsApp DEMO ingested → check Needs you / draft card.');
                onRefresh();
              }}
            >
              WhatsApp fixture sim
            </button>
          </div>
          {waNote ? <p className="do-note">{waNote}</p> : null}
        </article>

        {/* Needs you home widget stand-in */}
        <article className="do-plate do-plate-widget" id="needs-you">
          <p className="do-mono">02 · Home widget DEMO</p>
          <h3>Needs you</h3>
          <div className="do-home-widget" aria-label="Needs you home widget preview">
            <div className="do-home-widget-inner">
              <span className="do-star" aria-hidden>
                ✦
              </span>
              <div>
                <p className="do-home-widget-count">{needsYou.length}</p>
                <p className="do-home-widget-label">Needs you</p>
                <p className="do-home-widget-title">{top ? top.name : 'Nothing waiting'}</p>
              </div>
            </div>
            <p className="do-note">
              Tap target: <code>do://needs-you</code> · web stand-in for iOS WidgetKit / Android App
              Widget stubs in <code>apps/do/ios</code> + <code>apps/do/android</code>.
            </p>
          </div>
        </article>

        {/* Keyboard preview */}
        <article className="do-plate">
          <p className="do-mono">03 · Keyboard preview</p>
          <h3>DO Keyboard</h3>
          <p>Native stubs: Swift Keyboard Extension + Kotlin IME. ✦ + template strip.</p>
          <div className="do-keyboard-preview" aria-label="Keyboard chrome preview">
            <div className="do-keyboard-strip">
              {KEYBOARD_KEYS.map((k) => (
                <span key={k} className="do-keyboard-key">
                  {k}
                </span>
              ))}
              <span className="do-keyboard-key do-keyboard-star" aria-label="DO make agent">
                ✦
              </span>
            </div>
            <div className="do-keyboard-rows" aria-hidden>
              <div>q w e r t y u i o p</div>
              <div>a s d f g h j k l</div>
              <div>⇧ z x c v b n m ⌫</div>
              <div>123 · space · return</div>
            </div>
          </div>
          <p className="do-note">
            See <code>apps/do/ios/DoKeyboard/README.md</code> and{' '}
            <code>apps/do/android/DoIme/README.md</code>. Linux CI cannot App Store–build these —
            compiling-ready stubs only.
          </p>
        </article>

        {/* DO Clear */}
        <article className="do-plate do-plate-clear">
          <p className="do-mono">04 · DO Clear</p>
          <h3>Check writing</h3>
          <p>{CLEAR_HONESTY}</p>
          <label className="do-label" htmlFor="clear-demo">
            Draft
          </label>
          <textarea
            id="clear-demo"
            className="do-input"
            rows={4}
            value={clearText}
            onChange={(e) => setClearText(e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />
          <div className="do-clear-chips" aria-label="Issues">
            {issues.length === 0 ? (
              <span className="do-chip">No issues</span>
            ) : (
              issues.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  className={`do-clear-chip do-clear-chip-${i.kind}`}
                  title={i.reason}
                  onClick={() => {
                    const next =
                      clearText.slice(0, i.start) + i.suggestion + clearText.slice(i.end);
                    setClearText(next);
                  }}
                >
                  <span className="do-star" aria-hidden>
                    ✦
                  </span>
                  {i.kind}: {i.match}
                  {i.suggestion ? ` → ${i.suggestion || '∅'}` : ''}
                </button>
              ))
            )}
          </div>
          <div className="do-plate-actions">
            <button type="button" className="do-cta do-cta-secondary" onClick={runClear}>
              Rescan
            </button>
            <button
              type="button"
              className="do-cta do-cta-secondary"
              onClick={() => {
                const result = applyClearSuggestions(clearText);
                setClearText(result.rewritten);
                setRewrite(result.rewritten);
                setClearNote(result.honesty);
                setIssues(scanClearWriting(result.rewritten));
              }}
            >
              Apply plain rewrite
            </button>
            <button type="button" className="do-cta" disabled={busy} onClick={onOpenClearAgent}>
              <span className="do-star" aria-hidden>
                ✦
              </span>
              Make agent: keep clear
            </button>
          </div>
          {rewrite ? (
            <p className="do-note">
              Stub rewrite: {rewrite.slice(0, 160)}
              {rewrite.length > 160 ? '…' : ''}
            </p>
          ) : null}
          <p className="do-note">{clearNote}</p>
        </article>
      </div>
    </section>
  );
}
