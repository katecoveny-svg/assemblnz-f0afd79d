'use client';

import Link from 'next/link';
import { CineFooter } from './CineFooter';

/**
 * /agents — Kate's agents.html prototype, ported 1:1 (copy hers, 2026-07-24).
 * The shared watch frame supplies the artwork; the agent copy stays intact.
 * agent-builder.html links → /build-an-agent.
 */
export function CinematicAgents() {

  const agents = [
    { num: '01', shape: 'navy', h: 'Intent Agent', p: 'Reads the enquiry and names the job — what the person wants, in plain words.', tags: ['memory', 'voice'] },
    { num: '02', shape: 'brass', h: 'Knowledge Agent', p: 'Answers from your approved offers, prices, FAQs and rules — not the open web.', tags: ['knowledge', 'boundaries'] },
    { num: '03', shape: 'chrome', h: 'Planning Agent', p: 'Compares options against your constraints and stages a plan for you to pick.', tags: ['intelligence', 'abilities'] },
    { num: '04', shape: 'brass', h: 'Budget Agent', p: 'Checks every recommendation against the budget before it reaches you.', tags: ['abilities', 'boundaries'] },
    { num: '05', shape: 'navy', h: 'Proof Agent', p: 'Records what changed, who approved it, and what the outcome was.', tags: ['memory', 'abilities'] },
    { num: '06', shape: 'chrome', h: 'Voice Agent', p: 'Writes in your business voice — warm, plain, helpful — not generic internet tone.', tags: ['voice', 'knowledge'] },
  ];
  const parts = [
    { n: '01', h: 'memory', p: 'What it remembers — customer context, preferences, history across sessions.' },
    { n: '02', h: 'knowledge', p: 'Read only · confirmed sources — your offers, prices and rules.' },
    { n: '03', h: 'intelligence', p: 'How it reasons — model settings you can change per agent.' },
    { n: '04', h: 'voice', p: 'How it speaks — tone and formality taken from your business.' },
    { n: '05', h: 'abilities', p: 'What it can do — read, organise, compare, draft. Never sends.' },
    { n: '06', h: 'boundaries', p: 'The limit — approval stays visible with every action.' },
  ];

  return (
    <div className="cine" style={{ cursor: 'auto' }}>
      <div className="content">
        <nav className="nav">
          <Link className="wordmark" href="/">assembl</Link>
          <div className="nav-links">
            <Link href="/agents">agents</Link>
            <Link href="/pricing">pricing</Link>
            <Link href="/assembling">the agentic journey</Link>
          </div>
          <Link className="nav-cta" href="/">← home</Link>
        </nav>

        <header className="page-header">
          <div className="kicker">agents</div>
          <h1>Specialists,<br /><span className="accent">not one assistant.</span></h1>
          <p className="lede" style={{ marginTop: 16 }}>Give one clear job to a specialist. Get a draft back with a named reviewer and a hard stop — nothing sends without you.</p>
        </header>

        <div className="page-body">
          <section aria-label="Specialist workspaces" style={{ marginBottom: 48 }}><div className="kicker">open a specialist workspace</div><div className="agent-grid">{[{ slug: 'retirement', name: 'Retirement guide', text: 'Prepare a family journey through retirement living, with official NZ sources.' }, { slug: 'flux', name: 'Flux', text: 'Research business fit, organise a private pipeline and prepare a useful follow-up.' }, { slug: 'aroha', name: 'Aroha', text: 'Prepare people processes with current NZ sources and human review.' }].map(a => <Link className="agent-card" href={`/agents/${a.slug}/app`} key={a.slug}><h3>{a.name}</h3><p>{a.text}</p><span className="tag">open the app →</span></Link>)}</div></section>
          <div className="agent-grid">
            {agents.map((a) => (
              <Link className="agent-card" key={a.num} href="/assembling">
                <div className="num">{a.num}</div><div className={`m-shape ${a.shape}`}>{a.num}</div>
                <h3>{a.h}</h3><p>{a.p}</p>
                <div className="tags">{a.tags.map((tg) => <span className="tag" key={tg}>{tg}</span>)}</div>
              </Link>
            ))}
          </div>

          <div className="parts-section">
            <div className="kicker">agent parts</div>
            <h2 style={{ marginBottom: 8 }}>Six settings. <span className="accent">One specialist.</span></h2>
            <div className="parts-grid">
              {parts.map((p) => (
                <div className="part-card" key={p.n}>
                  <div className="pnum">{p.n}</div><h4>{p.h}</h4><p>{p.p}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="boundary">
            <h2>The <span className="accent">operating boundary</span></h2>
            <p>The system can read, organise, compare and draft. It does not send, file, book or make a commitment without the approval path the workflow names.</p>
            <div className="boundary-grid">
              <div className="boundary-item"><span className="dot" />Nothing sends without approval</div>
              <div className="boundary-item"><span className="dot" />Every decision has a named reviewer</div>
              <div className="boundary-item"><span className="dot" />Evidence stays attached</div>
            </div>
          </div>

          <div style={{ marginBottom: 60 }}><Link className="btn btn-solid" href="/assembling">see the agentic journey →</Link></div>
        </div>

        <CineFooter />
      </div>
    </div>
  );
}
