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
  { agent: 'Draft', doing: 'Your context.md, then five moments' },
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

/**
 * The context brief — the artefact people keep.
 *
 * Kate, 29 July 2026: AI is only as good as the context it is given, and
 * almost nobody hands their agents a proper brief. So the same read that
 * scores a site also drafts the business a `context.md`: who they are, what
 * they sell, how they talk, what they must never say, and the rules any agent
 * working for them has to follow. They paste it into ChatGPT, Claude, Copilot
 * or their own agent — and assembl's name is on it every time they open it.
 */
function contextMarkdown(brief: Brief, site: string, url: string): string {
  const today = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const L: string[] = [];
  L.push(`# ${site} — context for AI`);
  L.push('');
  L.push(`**Give this file to any AI before you ask it to write, reply or draft for this business.**`);
  L.push(`Drafted ${today} by an agent reading ${url}. Check it, correct it, keep it.`);
  L.push('');
  L.push('---');
  L.push('');
  L.push('## Who we are');
  L.push('');
  L.push(brief.business);
  L.push('');
  if (brief.sells?.length) {
    L.push('## What we offer');
    L.push('');
    brief.sells.forEach((x) => L.push(`- ${x}`));
    L.push('');
  }
  if (brief.voice) {
    L.push('## How we sound');
    L.push('');
    L.push(brief.voice);
    L.push('');
    L.push('When writing as us, match that. If a sentence could belong to any business in our industry, rewrite it until it could only be ours.');
    L.push('');
  }
  if (brief.facts?.length) {
    L.push('## Facts an agent may state');
    L.push('');
    L.push('These come from our own published pages. Anything not on this list must be checked with a person before it is said to a customer.');
    L.push('');
    brief.facts.forEach((f) => L.push(`- ${f}`));
    L.push('');
  }
  if (brief.blindSpots?.length) {
    L.push('## What our own site does not answer');
    L.push('');
    L.push('If someone asks one of these, an agent must say it does not know and offer a person — never guess.');
    L.push('');
    brief.blindSpots.forEach((b) => L.push(`- ${b}`));
    L.push('');
  }
  if (brief.questions?.length) {
    L.push('## Questions our customers actually ask');
    L.push('');
    brief.questions.slice(0, 8).forEach((q) => L.push(`- ${q}`));
    L.push('');
  }
  if (brief.brand?.palette?.length) {
    L.push('## Our colours');
    L.push('');
    L.push(brief.brand.palette.slice(0, 6).map((c) => `\`${c}\``).join(' · '));
    L.push('');
    L.push('Read from our own stylesheets. Use these when anything visual is generated for us.');
    L.push('');
  }
  L.push('## Rules for any agent working for us');
  L.push('');
  L.push('1. **Never invent a fact, a price, a date or a policy.** If it is not in this file or on our site, say you do not know.');
  L.push('2. **Nothing sends without a named person approving it** — draft, then stop.');
  L.push('3. **Say when you are unsure.** A hedge is cheaper than a correction to a customer.');
  L.push('4. **Use our words**, not the industry\u2019s. See "How we sound".');
  L.push('5. **Keep a record** of what you used to answer, so anyone can check it later.');
  L.push('');
  L.push('---');
  L.push('');
  L.push('*Drafted by assembl — intuitive agentic customer journeys · assembl.co.nz*');
  L.push('*This is a starting point written from public pages. You know your business; edit freely.*');
  return L.join('\n');
}

export function AiReadyClient() {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState<'idle' | 'checks' | 'journey'>('idle');
  const [error, setError] = useState('');
  const [ready, setReady] = useState<Ready | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  /* The draft either lands or it doesn't, and the visitor has to be able to see
     which. Before this, a failed brief left the whole context.md section
     unrendered with nothing said — the page just looked finished. */
  const [briefState, setBriefState] = useState<'idle' | 'drafting' | 'failed' | 'ready'>('idle');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [gate, setGate] = useState<'closed' | 'sending' | 'open'>('closed');
  const [gateError, setGateError] = useState('');
  const [waitAnswer, setWaitAnswer] = useState('');
  const [ctxCopied, setCtxCopied] = useState(false);
  const [ctxBusy, setCtxBusy] = useState(false);
  const [ctxErr, setCtxErr] = useState('');
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

  /**
   * Draft the journey and the context brief.
   *
   * The read takes ~25s against a live model, and a single transport hiccup used
   * to cost the visitor the whole artefact silently. So: one automatic retry,
   * then an honest failed state they can act on.
   */
  const draftJourney = useCallback(async (target: string) => {
    setBusy('journey'); setBriefState('drafting');
    const attempt = async (): Promise<Brief | null> => {
      try {
        const bRes = await fetch('/api/agent-brief', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url: target }),
        });
        if (!bRes.ok) return null;
        const b = (await bRes.json()) as Brief & { error?: string };
        return !b.error && b.business ? b : null;
      } catch { return null; }
    };
    const b = (await attempt()) ?? (await attempt());
    if (b) { setBrief(b); setBriefState('ready'); } else { setBriefState('failed'); }
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

  const contextDoc = () =>
    brief && ready ? contextMarkdown(brief, ready.site, ready.url) : '';

  const copyContext = async () => {
    try {
      await navigator.clipboard.writeText(contextDoc());
      setCtxCopied(true);
      setTimeout(() => setCtxCopied(false), 2400);
    } catch { setCtxErr('Copy was blocked — download it instead.'); }
  };

  const saveFile = (text: string, name: string, type: string) => {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(a.href);
  };

  const downloadContextMd = () => {
    if (!ready) return;
    saveFile(contextDoc(), `${ready.site.replace(/[^\w-]+/g, '-').toLowerCase()}-context.md`, 'text/markdown');
  };

  /** The same brief as a designed PDF — what people forward to a colleague. */
  const downloadContextPdf = async () => {
    if (!brief || !ready || ctxBusy) return;
    setCtxBusy(true); setCtxErr('');
    try {
      const { default: JsPDF } = await import('jspdf');
      const doc = new JsPDF({ unit: 'pt', format: 'a4' });
      const W = 595, H = 842, M = 58;
      const NAVY = '#0B1524', GOLD = '#B8964F', SOFT = '#5A5750';
      let y = 0;

      const newPage = (first = false) => {
        if (!first) doc.addPage();
        doc.setFillColor(252, 251, 248); doc.rect(0, 0, W, H, 'F');
        doc.setDrawColor(184, 150, 79); doc.setLineWidth(1.2);
        doc.line(M, 92, W - M, 92);
        doc.setTextColor(NAVY); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
        doc.text('assembl', M, 76);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(SOFT);
        doc.text('context brief · intuitive agentic customer journeys', M + 48, 76);
        y = 128;
      };
      const need = (h: number) => { if (y + h > H - 70) newPage(); };
      const heading = (t: string) => {
        need(46);
        doc.setTextColor(GOLD); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5);
        doc.text(t.toUpperCase(), M, y); y += 18;
      };
      const para = (t: string, size = 10.5) => {
        doc.setTextColor(40, 38, 34); doc.setFont('helvetica', 'normal'); doc.setFontSize(size);
        const lines = doc.splitTextToSize(t, W - M * 2);
        need(lines.length * (size * 1.34));
        doc.text(lines, M, y); y += lines.length * (size * 1.34) + 10;
      };
      const bullets = (items: string[]) => {
        items.forEach((it) => {
          doc.setTextColor(184, 150, 79); doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
          const lines = doc.splitTextToSize(it, W - M * 2 - 16);
          need(lines.length * 14 + 4);
          doc.text('·', M, y);
          doc.setTextColor(40, 38, 34); doc.setFont('helvetica', 'normal');
          doc.text(lines, M + 14, y); y += lines.length * 14 + 6;
        });
        y += 6;
      };

      newPage(true);
      doc.setTextColor(NAVY); doc.setFont('helvetica', 'bold'); doc.setFontSize(30);
      const title = doc.splitTextToSize(`${ready.site} — context for AI`, W - M * 2);
      doc.text(title, M, y); y += title.length * 34 + 12;
      para('Give this to any AI before you ask it to write, reply or draft for this business. Drafted from your own public pages — check it, correct it, keep it.', 11);

      heading('Who we are'); para(brief.business);
      if (brief.sells?.length) { heading('What we offer'); bullets(brief.sells); }
      if (brief.voice) { heading('How we sound'); para(brief.voice); }
      if (brief.facts?.length) { heading('Facts an agent may state'); para('From our own published pages. Anything else is checked with a person first.', 9.5); bullets(brief.facts); }
      if (brief.blindSpots?.length) { heading('What our site does not answer'); para('If someone asks one of these, say you do not know and offer a person.', 9.5); bullets(brief.blindSpots); }
      heading('Rules for any agent working for us');
      bullets([
        'Never invent a fact, price, date or policy. If it is not here or on our site, say you do not know.',
        'Nothing sends without a named person approving it — draft, then stop.',
        'Say when you are unsure. A hedge is cheaper than a correction to a customer.',
        'Use our words, not the industry\u2019s.',
        'Keep a record of what you used to answer, so anyone can check it later.',
      ]);

      doc.setTextColor(SOFT); doc.setFontSize(8);
      doc.text('Drafted by assembl — intuitive agentic customer journeys · assembl.co.nz', M, H - 46);
      doc.save(`${ready.site.replace(/[^\w-]+/g, '-').toLowerCase()}-context.pdf`);
    } catch {
      setCtxErr('The PDF could not be built just now — the markdown download still works.');
    } finally { setCtxBusy(false); }
  };

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
                <b>Now get your context.md — and your agentic customer journey.</b>
                <p>
                  A live agent reads your whole site and writes you two things: a{' '}
                  <b>context brief</b> you can paste into any AI so it stops guessing about your
                  business, and the five moments of your journey. Both yours to keep. Takes about
                  half a minute. Where should we send your copy?
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

            {briefState === 'failed' && (
              <section className="airdy-ctx airdy-ctx-failed" role="alert">
                <div className="airdy-ctx-head">
                  <div>
                    <p className="airdy-ctx-kick">the artefact you keep</p>
                    <h3>Your context brief didn&rsquo;t come back.</h3>
                  </div>
                  <span className="airdy-ctx-badge">context.md</span>
                </div>
                <p className="airdy-ctx-lede">
                  The live agent reads your whole site, which takes about half a minute and
                  occasionally times out. Your score above is unaffected. Draft it again and it
                  usually lands second time.
                </p>
                <div className="airdy-ctx-row">
                  <button type="button" onClick={() => void draftJourney(ready.url)}>
                    draft it again
                  </button>
                </div>
              </section>
            )}

            {brief && (
              <section className="airdy-ctx">
                <div className="airdy-ctx-head">
                  <div>
                    <p className="airdy-ctx-kick">the artefact you keep</p>
                    <h3>Your context brief, for any AI.</h3>
                  </div>
                  <span className="airdy-ctx-badge">context.md</span>
                </div>
                <p className="airdy-ctx-lede">
                  AI is only as good as the context it is given, and almost nobody hands their
                  tools a proper brief. This is yours — who you are, what you sell, how you sound,
                  the facts an agent may state, what your own site doesn&rsquo;t answer, and the
                  rules any agent working for you has to follow. Paste it into ChatGPT, Claude,
                  Copilot or your own agent.
                </p>
                {/* The whole brief, scrollable. It used to show sixteen lines and an
                    ellipsis, which read as a broken render rather than a preview —
                    people could not tell whether the rest existed. */}
                <pre className="airdy-ctx-preview full">{contextDoc()}</pre>
                <p className="airdy-ctx-count">
                  {contextDoc().split('\n').filter(Boolean).length} lines · {contextDoc().length.toLocaleString('en-NZ')} characters · scroll to read it all
                </p>
                <div className="airdy-ctx-row">
                  <button type="button" onClick={() => void copyContext()}>
                    {ctxCopied ? 'copied ✓' : 'copy for your AI'}
                  </button>
                  <button type="button" className="ghost" onClick={downloadContextMd}>download .md</button>
                  <button type="button" className="ghost" onClick={() => void downloadContextPdf()} disabled={ctxBusy}>
                    {ctxBusy ? 'building…' : 'download .pdf'}
                  </button>
                </div>
                {ctxErr && <p className="airdy-ctx-err">{ctxErr}</p>}
              </section>
            )}

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
