'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import '@/components/site/cinematic/wait-state.css';
import './ai-ready.css';

/**
 * /ai-ready — the free, shareable tool.
 *
 * Kate's brief: part of the assembl offering is "how to make sure you are
 * optimised for AI search and the agentic era… a free viral tool", and the
 * result should be "a sharable and keepable personalised document that looks
 * incredible… so people will share".
 *
 * Two layers from one address:
 *   1. The readiness check — eight deterministic facts (/api/ai-ready),
 *      scored. Fast, free, honest, repeatable.
 *   2. The journey — the live blueprint agent (/api/agent-brief, Opus 5)
 *      reads their site and this composes a suggested agentic customer
 *      journey from it: their words, their colours, their gaps. Impressive
 *      on purpose, complete on purpose not — the full design is the work.
 *
 * The document prints beautifully (print CSS shows only the report), and the
 * URL carries ?u= so a result is a link, not a screenshot.
 */

type Check = { id: string; label: string; status: 'pass' | 'partial' | 'fail'; detail: string; fix: string };
type Ready = { url: string; site: string; score: number; checks: Check[]; checkedAt: string };
type Brief = {
  business: string; sells: string[]; voice: string; questions?: string[];
  facts: string[]; blindSpots: string[]; brand?: { palette?: string[] };
};

const MOMENTS = [
  { key: 'enquiry', title: 'The first enquiry', agent: 'Front of house' },
  { key: 'quote', title: 'The quote, prepared', agent: 'The drafter' },
  { key: 'wait', title: 'The wait, rewarded', agent: 'The wait state' },
  { key: 'follow', title: 'The follow-through', agent: 'The keeper of promises' },
  { key: 'decade', title: 'Years two through ten', agent: 'The long memory' },
];

/**
 * assembl's own wait — the thing we sell, running on us.
 *
 * While the live agent reads the visitor's site, they watch the work happen,
 * they are asked ONE optional question (the answer travels to Kate with the
 * lead, so her first reply is already informed), and they leave with a receipt.
 * Reuses the .wsp-* classes from wait-state.css, which are deliberately
 * unscoped so any surface can run the same phone.
 */
const OUR_STEPS = [
  { agent: 'Read', doing: 'Your public pages — the ones you choose' },
  { agent: 'Voice', doing: 'How you already talk about the work' },
  { agent: 'Ask', doing: 'One question', ask: true },
  { agent: 'Draft', doing: 'Five moments, in your words' },
  { agent: 'Held', doing: 'For a named person — nothing sends' },
];

function AssemblWait({ onAnswer }: { onAnswer: (a: string) => void }) {
  const [at, setAt] = useState(0);
  const [answered, setAnswered] = useState(false);
  const asking = OUR_STEPS[at]?.ask === true && !answered;

  useEffect(() => {
    if (asking || at >= OUR_STEPS.length) return;
    const t = setTimeout(() => setAt((n) => n + 1), 1500);
    return () => clearTimeout(t);
  }, [at, asking]);

  const pct = Math.round((Math.min(at, OUR_STEPS.length) / OUR_STEPS.length) * 100);
  const answer = (a: string) => { setAnswered(true); onAnswer(a); setAt((n) => n + 1); };

  return (
    <div className="wsp" style={{ marginTop: 26 }}>
      <div className="wsp-phone">
        <div className="wsp-glare" aria-hidden="true" />
        <div className="wsp-screen">
          <div className="wsp-status" aria-hidden="true"><span>9:41</span><span /><span>▮▮▮</span></div>
          <div className="wsp-app">Your journey, being drafted</div>
          <div className="wsp-loyal">this is our own wait — you are in it</div>
          <div className={`wsp-ring${at < OUR_STEPS.length ? ' spin' : ' done'}`}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="wsp-track" cx="60" cy="60" r="52" />
              <circle className="wsp-arc" cx="60" cy="60" r="52"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)} />
            </svg>
            <div className="wsp-mid">
              <div className="wsp-credit">{Math.min(at, 5)}<span style={{ opacity: 0.4 }}>/5</span></div>
              <div className="wsp-credit-l">moments drafted</div>
            </div>
          </div>
          <ol className="wsp-steps">
            {OUR_STEPS.map((st, i) => (
              <li key={st.agent} className={`wsp-step${i < at ? ' done' : ''}${i === at ? ' now' : ''}`}>
                <span className="wsp-dot" aria-hidden="true" />
                <span className="wsp-who">{st.agent}</span>
                <span className="wsp-doing">{st.doing}</span>
              </li>
            ))}
          </ol>
          {asking && (
            <div className="wsp-sheet" aria-live="polite">
              <div className="wsp-sheet-q">What part of the week would you hand to someone else tomorrow?</div>
              <div className="wsp-sheet-row">
                {['Answering the same questions', 'Chasing and following up'].map((o) => (
                  <button key={o} type="button" className="wsp-sheet-btn" onClick={() => answer(o)}>{o}</button>
                ))}
              </div>
              <button type="button" className="wsp-sheet-skip" onClick={() => answer('')}>rather not say</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AiReadyClient() {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState<'idle' | 'checks' | 'journey'>('idle');
  const [error, setError] = useState('');
  const [ready, setReady] = useState<Ready | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [gate, setGate] = useState<'closed' | 'sending' | 'open'>('closed');
  const [gateError, setGateError] = useState('');
  const [waitAnswer, setWaitAnswer] = useState('');
  const ran = useRef(false);

  const run = useCallback(async (target: string) => {
    const t = target.trim();
    if (!t) return;
    setBusy('checks'); setError(''); setReady(null); setBrief(null);
    history.replaceState(null, '', `?u=${encodeURIComponent(t)}`);
    try {
      const res = await fetch('/api/ai-ready', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: t }),
      });
      const data = (await res.json()) as Ready & { error?: string };
      if (!res.ok || data.error) { setError(data.error ?? 'That did not come back cleanly.'); setBusy('idle'); return; }
      setReady(data);
      // the journey waits behind the email gate — unless this session opened it
      if (sessionStorage.getItem('airdy-email')) {
        setGate('open');
        void draftJourney(t);
      }
    } catch {
      setError('That did not come back cleanly — check the address and try again.');
    } finally {
      setBusy('idle');
    }
  }, []);

  const draftJourney = useCallback(async (target: string) => {
    setBusy('journey');
    try {
      const bRes = await fetch('/api/agent-brief', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      if (bRes.ok) {
        const b = (await bRes.json()) as Brief & { error?: string };
        if (!b.error && b.business) setBrief(b);
      }
    } catch { /* the score stands alone if the agent is busy */ }
    setBusy('idle');
  }, []);

  const unlock = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setGateError('That email does not look right.'); return; }
    setGate('sending'); setGateError('');
    // Capture is fail-open by design: the leads pipeline going down should
    // never cost a visitor their document.
    try {
      await fetch('/api/tool-leads', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: em, toolSlug: 'ai-ready', consentMarketing: true, source: 'ai-ready',
          payload: { url: ready?.url ?? url, score: ready?.score ?? null, worstWait: waitAnswer || null },
        }),
      });
    } catch { /* soft failure — carry on */ }
    sessionStorage.setItem('airdy-email', em);
    setGate('open');
    void draftJourney(ready?.url ?? url);
  }, [email, ready, url, draftJourney, waitAnswer]);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const u = new URLSearchParams(location.search).get('u');
    if (u) { setUrl(u); void run(u); }
  }, [run]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard denied — the URL bar still has it */ }
  };

  const grade = ready ? (ready.score >= 85 ? 'ready for the agentic era' : ready.score >= 60 ? 'findable, with gaps' : ready.score >= 35 ? 'mostly invisible to AI' : 'AI cannot see this site') : '';
  const palette = (brief?.brand?.palette ?? []).slice(0, 5);
  const journeyLine = (i: number): string => {
    if (!brief) return '';
    const sell = (n: number) => brief.sells[n % Math.max(1, brief.sells.length)]?.toLowerCase() ?? 'the work';
    switch (i) {
      case 0: return `Reads the enquiry against everything ${brief.business.split(/\s+(?:is|are|operates|provides|offers)\b/i)[0]!.trim()} already knows, answers in your voice, and asks the one question your site leaves open.`;
      case 1: return `Drafts the quote for ${sell(0)} from your own prices and terms — held at draft until a named person approves it.`;
      case 2: return `While the drafting happens, the customer watches the work and earns a credit toward ${sell(1)} — and answers one optional question you have always wanted to ask.`;
      case 3: return `Watches the job after the yes: the booking confirmed, the reminder sent, the thing your busiest week always drops — drafted before anyone had to remember.`;
      case 4: return `Notices the lapse, the anniversary, the silence since March — and prepares the right next touch for ${sell(2)}, years after most systems have forgotten.`;
      default: return '';
    }
  };

  return (
    <div className="airdy">
      <main className="airdy-main">
        <header className="airdy-head">
          <p className="airdy-kicker">assembl · intuitive agentic customer journeys · free tool</p>
          <h1>Assemble your journey.<br /><span className="airdy-accent">Check you&rsquo;re AI-ready.</span></h1>
          <p className="airdy-sub">
            Two tools, one address. A live agent reads your website and drafts a personalised
            agentic customer journey — your words, your colours, your gaps. And eight honest
            checks score whether the assistants people now ask can find, read and cite you.
          </p>
          <form
            className="airdy-form"
            onSubmit={(e) => { e.preventDefault(); void run(url); }}
          >
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yourbusiness.co.nz"
              aria-label="Your web address"
              autoComplete="url"
            />
            <button type="submit" disabled={busy !== 'idle'}>
              {busy === 'checks' ? 'reading…' : busy === 'journey' ? 'drafting…' : 'check my site'}
            </button>
          </form>
          {error && <p className="airdy-error" role="alert">{error}</p>}
          <p className="airdy-note">Reads public pages only. Nothing stored, nothing sent to anyone.</p>
          <p className="airdy-dogfood">
            This is assembl&rsquo;s own customer journey, running on assembl. Our agents read your
            site, draft your journey, ask one question — and a named person (Kate) reads what they
            prepared before anyone replies to you. We would not sell you a wait we don&rsquo;t run
            ourselves.
          </p>
        </header>

        {ready && (
          <article className="airdy-doc" aria-label="Your AI-search readiness report">
            <div className="airdy-doc-head">
              <div>
                <p className="airdy-doc-kicker">AI-search readiness · {new Date(ready.checkedAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <h2>{ready.site}</h2>
                <p className="airdy-doc-url">{ready.url}</p>
              </div>
              <div className="airdy-dial" style={{ ['--p' as string]: String(ready.score) }}>
                <span className="airdy-score">{ready.score}</span>
                <span className="airdy-of">/ 100</span>
              </div>
            </div>
            <p className="airdy-grade">{grade}</p>

            <div className="airdy-checks">
              {ready.checks.map((c) => (
                <div key={c.id} className={`airdy-check ${c.status}`}>
                  <div className="airdy-check-top">
                    <span className="airdy-mark" aria-hidden="true">{c.status === 'pass' ? '✓' : c.status === 'partial' ? '△' : '✕'}</span>
                    <b>{c.label}</b>
                  </div>
                  <p>{c.detail}</p>
                  {c.status !== 'pass' && <p className="airdy-fix"><b>Fix:</b> {c.fix}</p>}
                </div>
              ))}
            </div>

            {gate !== 'open' && (
              <form className="airdy-gate" onSubmit={unlock}>
                <b>Now assemble your agentic customer journey.</b>
                <p>
                  A live agent reads your site and drafts the five moments of your journey —
                  personalised, printable, yours to keep. Where should we send your copy?
                </p>
                <div className="airdy-gate-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourbusiness.co.nz"
                    aria-label="Your email"
                    autoComplete="email"
                    required
                  />
                  <button type="submit" disabled={gate === 'sending'}>
                    {gate === 'sending' ? 'one moment…' : 'draft my journey'}
                  </button>
                </div>
                {gateError && <p className="airdy-error" role="alert">{gateError}</p>}
                <small>
                  We keep you posted on the agentic era — occasional, useful, unsubscribe any time.
                  assembl NZ Limited, Aotearoa New Zealand.
                </small>
              </form>
            )}
            {busy === 'journey' && <AssemblWait onAnswer={setWaitAnswer} />}

            {brief && (
              <section className="airdy-journey">
                <h3>Your suggested agentic customer journey</h3>
                <p className="airdy-journey-sub">
                  Drafted by a live agent from what your site actually says. {brief.business}
                </p>
                {palette.length > 0 && (
                  <div className="airdy-palette" aria-label="Your brand colours, as read from your site">
                    {palette.map((c) => <span key={c} style={{ background: c }} title={c} />)}
                    <i>your colours, as your site serves them</i>
                  </div>
                )}
                <ol className="airdy-moments">
                  {MOMENTS.map((m, i) => (
                    <li key={m.key}>
                      <div className="airdy-m-head">
                        <span className="airdy-m-n">{String(i + 1).padStart(2, '0')}</span>
                        <b>{m.title}</b>
                        <span className="airdy-m-agent">{m.agent}</span>
                      </div>
                      <p>{journeyLine(i)}</p>
                    </li>
                  ))}
                </ol>
                {brief.blindSpots.length > 0 && (
                  <div className="airdy-blind">
                    <b>What your journey leaves open today</b>
                    <ul>
                      {brief.blindSpots.slice(0, 3).map((b) => <li key={b}>{b}</li>)}
                    </ul>
                    <p>Your agents would ask these for you — and remember the answers.</p>
                  </div>
                )}
              </section>
            )}

            {brief && (
              <div className="airdy-receipt">
                <b>The receipt for this</b>
                <ul>
                  <li>Read: your public pages at {ready.site} — nothing else, nothing stored.</li>
                  <li>Drafted: five journey moments, from your own words and colours.</li>
                  {waitAnswer ? (
                    <li>
                      You told us you&rsquo;d hand off <b>{waitAnswer.toLowerCase()}</b> — so the journey
                      below leads with {waitAnswer.startsWith('Answering')
                        ? 'the front door: the enquiry answered from your own words'
                        : 'the follow-through: the promises kept without anyone remembering'}.
                    </li>
                  ) : null}
                  <li>Not done: nothing was sent, promised, or priced. A named person reads this before anyone replies to you.</li>
                </ul>
              </div>
            )}

            <footer className="airdy-doc-foot">
              <span>assembl — intuitive agentic customer journeys · Aotearoa New Zealand</span>
              <span>assembl NZ Limited · NZBN 9429053514950 · assembl@assembl.co.nz</span>
            </footer>
          </article>
        )}

        {ready && (
          <div className="airdy-actions">
            <button type="button" onClick={() => window.print()}>download the document</button>
            <button type="button" className="ghost" onClick={() => void share()}>
              {copied ? 'link copied ✓' : 'share this result'}
            </button>
            <a className="ghost" href="/build-an-agent">assemble the agents →</a>
          </div>
        )}
      </main>
    </div>
  );
}
