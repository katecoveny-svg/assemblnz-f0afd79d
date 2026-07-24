'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  CircleDot,
  Copy,
  Database,
  Download,
  Network,
  Play,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  GENOME_SECTION_LABELS,
  GENOME_SURFACES,
  RIPPLE_SCENARIOS,
  genomeFactsWith,
  surfaceName,
  type GenomeFact,
  type GenomeSection,
  type SurfaceId,
} from '@/lib/customers/auckland-dog-trainer/genome';
import styles from './public-genome-demo.module.css';

type PublicAgentId = 'desk' | 'operations' | 'knowledge';

type DemoResult = {
  agent: {
    id: PublicAgentId;
    name: string;
    role: string;
    version: string;
    responsibilities: string[];
  };
  draft: string;
  sources: Array<{ id: string; label: string; value: string; section: GenomeSection }>;
  mode: 'live-model' | 'genome-rules';
  model: string;
  liveGenome: boolean;
  approval: { status: string; reviewer: string; boundary: string };
  remaining: number;
};

const AGENTS: Array<{
  id: PublicAgentId;
  name: string;
  role: string;
  number: string;
  prompt: string;
}> = [
  {
    id: 'desk',
    name: 'The Desk',
    role: 'Customer response',
    number: '01',
    prompt: 'A customer asks whether their dog with a bite history can join Group Bootcamp. Draft the reply and say what remains for Sam to confirm.',
  },
  {
    id: 'operations',
    name: 'Operations',
    role: 'Bookings and delivery',
    number: '02',
    prompt: 'Review the Group Bootcamp launch against the booking rules. What can be prepared now, and what must wait for Sam?',
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    role: 'Institutional memory',
    number: '03',
    prompt: 'Customers keep asking whether a muzzle is a punishment. Propose the canonical answer and show what still needs human verification.',
  },
];

const SECTION_ORDER = Object.keys(GENOME_SECTION_LABELS) as GenomeSection[];

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width <= maxWidth) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.length > 0 && lines.length === maxLines) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:]?$/, '')}…`;
  }
  lines.forEach((item, index) => context.fillText(item, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function nodePosition(index: number, total: number): React.CSSProperties {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const x = 50 + Math.cos(angle) * 39;
  const y = 50 + Math.sin(angle) * 39;
  return { left: `${x}%`, top: `${y}%` };
}

export function PublicGenomeDemo({ facts, live }: { facts: GenomeFact[]; live: boolean }) {
  const [scenarioId, setScenarioId] = React.useState('price');
  const [section, setSection] = React.useState<GenomeSection | 'all'>('all');
  const [surface, setSurface] = React.useState<SurfaceId | null>(null);
  const [agentId, setAgentId] = React.useState<PublicAgentId>('desk');
  const [prompt, setPrompt] = React.useState(AGENTS[0].prompt);
  const [result, setResult] = React.useState<DemoResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [shareState, setShareState] = React.useState<'idle' | 'copied'>('idle');
  const [resultShareState, setResultShareState] = React.useState<'idle' | 'shared' | 'copied'>('idle');

  const scenario = RIPPLE_SCENARIOS.find((item) => item.id === scenarioId) ?? null;
  const demoFacts = React.useMemo(
    () => genomeFactsWith(scenarioId ? [scenarioId] : [], facts),
    [facts, scenarioId],
  );
  const selectedAgent = AGENTS.find((agent) => agent.id === agentId) ?? AGENTS[0];
  const changedFactId = scenario?.applies.factId ?? '';
  const visibleFacts = demoFacts.filter((fact) => {
    if (section !== 'all' && fact.section !== section) return false;
    if (surface && !fact.readBy.includes(surface)) return false;
    return true;
  });

  function chooseAgent(next: PublicAgentId) {
    const agent = AGENTS.find((item) => item.id === next) ?? AGENTS[0];
    setAgentId(next);
    setPrompt(agent.prompt);
    setResult(null);
    setError('');
  }

  async function runAgent() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/genome/demo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ agent: agentId, prompt, scenarioId }),
      });
      const payload = (await response.json().catch(() => null)) as DemoResult | { error?: string } | null;
      if (!response.ok || !payload || !('draft' in payload)) {
        throw new Error(payload && 'error' in payload && payload.error ? payload.error : 'The demo agent could not run just now.');
      }
      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The demo agent could not run just now.');
    } finally {
      setLoading(false);
    }
  }

  async function shareDemo() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareState('copied');
      window.setTimeout(() => setShareState('idle'), 1800);
    } catch {
      setShareState('idle');
    }
  }

  const resultShareText = React.useMemo(() => {
    if (!result) return '';
    return [
      'assembl · Business Genome demo',
      `${result.agent.name} · ${result.agent.role}`,
      '',
      result.draft,
      '',
      `Sources: ${result.sources.map((source) => source.label).join(' · ')}`,
      `Review: ${result.approval.reviewer} · ${result.approval.boundary}`,
      '',
      'Draft only · assembl.co.nz/genome',
    ].join('\n');
  }, [result]);

  async function makeResultCard() {
    if (!result) throw new Error('Run an agent first.');
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not make the share card.');

    const gradient = context.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#fbfaf6');
    gradient.addColorStop(1, '#e8f1ed');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1200, 630);

    context.fillStyle = '#26383a';
    context.font = '600 32px Georgia, serif';
    context.fillText('assembl', 72, 72);
    context.fillStyle = '#3f7373';
    context.font = '700 15px monospace';
    context.fillText('BUSINESS GENOME · SHAREABLE DRAFT', 72, 110);

    context.fillStyle = '#26383a';
    context.font = '500 54px Georgia, serif';
    context.fillText(`${result.agent.name} prepared this draft.`, 72, 190);

    context.fillStyle = '#53656a';
    context.font = '400 25px Arial, sans-serif';
    const draftBottom = drawWrappedText(context, result.draft, 72, 246, 770, 36, 6);

    context.fillStyle = 'rgba(255,255,255,0.72)';
    context.strokeStyle = 'rgba(49,60,66,0.14)';
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(882, 150, 246, 304, 24);
    context.fill();
    context.stroke();
    context.fillStyle = '#3f7373';
    context.font = '700 13px monospace';
    context.fillText('SOURCES USED', 912, 194);
    context.fillStyle = '#26383a';
    context.font = '600 18px Arial, sans-serif';
    result.sources.slice(0, 5).forEach((source, index) => {
      drawWrappedText(context, source.label, 912, 234 + index * 44, 186, 22, 2);
    });

    const reviewY = Math.max(500, draftBottom + 30);
    context.fillStyle = '#b8964f';
    context.beginPath();
    context.arc(80, reviewY - 6, 7, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#26383a';
    context.font = '700 17px Arial, sans-serif';
    context.fillText(`Awaiting human review · ${result.approval.reviewer}`, 104, reviewY);
    context.fillStyle = '#68766f';
    context.font = '400 15px Arial, sans-serif';
    context.fillText('Fictional demo data · nothing was sent or published', 72, 588);
    context.fillStyle = '#3f7373';
    context.font = '700 16px monospace';
    context.textAlign = 'right';
    context.fillText('assembl.co.nz/genome', 1128, 588);
    context.textAlign = 'left';

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error('The share card could not be rendered.')), 'image/png');
    });
    return new File([blob], 'assembl-business-genome-result.png', { type: 'image/png' });
  }

  async function shareResult() {
    if (!result) return;
    try {
      const file = await makeResultCard();
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${result.agent.name} · assembl Business Genome`,
          text: 'A sourced draft from the assembl Business Genome public demo.',
          url: window.location.href,
          files: [file],
        });
        setResultShareState('shared');
      } else {
        await navigator.clipboard.writeText(resultShareText);
        setResultShareState('copied');
      }
      window.setTimeout(() => setResultShareState('idle'), 2000);
    } catch {
      setResultShareState('idle');
    }
  }

  async function downloadResultCard() {
    if (!result) return;
    const file = await makeResultCard();
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span aria-hidden /> Live demo · fictional Auckland business</p>
          <h1>Change one fact.<br /><em>See the work update.</em></h1>
          <p className={styles.lede}>
            Try a safe change, see where it flows, then ask an agent to prepare a sourced draft. Nothing is sent.
          </p>
          <div className={styles.heroActions}>
            <a href="#genome-workspace">Open the Genome <ArrowRight aria-hidden /></a>
            <button type="button" onClick={shareDemo}>
              {shareState === 'copied' ? <Check aria-hidden /> : <Copy aria-hidden />}
              {shareState === 'copied' ? 'Link copied' : 'Share this demo'}
            </button>
          </div>
        </div>
        <div className={styles.heroProof} aria-label="Demo boundaries">
          <div><strong>{demoFacts.length}</strong><span>confirmed facts</span></div>
          <div><strong>{GENOME_SURFACES.length}</strong><span>connected surfaces</span></div>
          <div><strong>{AGENTS.length}</strong><span>governed agents</span></div>
          <div><strong>0</strong><span>automatic sends</span></div>
        </div>
      </section>

      <section className={styles.explainer} aria-label="How the demonstration works">
        <article><span>one</span><h2>Change a fact</h2><p>Choose a safe example change.</p></article>
        <article><span>two</span><h2>See the ripple</h2><p>Watch the connected work update.</p></article>
        <article><span>three</span><h2>Run an agent</h2><p>Get a draft with its sources attached.</p></article>
      </section>

      <section id="genome-workspace" className={styles.workspace}>
        <aside className={styles.workspaceNav}>
          <div className={styles.workspaceBrand}><b>a</b><span><strong>assembl</strong><small>Business Genome</small></span></div>
          <nav aria-label="Genome demo areas">
            <a href="#genome-map" className={styles.activeNav}><Network aria-hidden /> Genome map</a>
            <a href="#source-facts"><Database aria-hidden /> Source facts</a>
            <a href="#agent-lab"><Sparkles aria-hidden /> Live agents</a>
            <a href="#approval-proof"><ShieldCheck aria-hidden /> Approval proof</a>
          </nav>
          <div className={styles.connectionState}><i aria-hidden /><span><strong>{live ? 'Live data connected' : 'Demo data ready'}</strong><small>Harbourside Dog Training</small></span></div>
        </aside>

        <div className={styles.workspaceBody}>
          <header className={styles.workspaceHeader}>
            <div><p>Fictional sample business</p><h2>Harbourside Dog Training</h2></div>
            <div className={styles.safePill}><ShieldCheck aria-hidden /> public sandbox · draft only</div>
          </header>

          <div className={styles.genomeGrid}>
            <section id="genome-map" className={styles.mapCard}>
              <div className={styles.panelTitle}><span>01 · living map</span><h3>One centre. Ten readers.</h3><p>Choose any surface to see the exact facts it can read.</p></div>
              <div className={styles.orbit}>
                <div className={styles.orbitRings} aria-hidden />
                <div className={styles.core}><Network aria-hidden /><strong>Business<br />Genome</strong><small>{demoFacts.length} facts</small></div>
                {GENOME_SURFACES.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.surfaceNode} ${surface === item.id ? styles.surfaceNodeActive : ''}`}
                    style={nodePosition(index, GENOME_SURFACES.length)}
                    onClick={() => setSurface(surface === item.id ? null : item.id)}
                    aria-pressed={surface === item.id}
                  >
                    <i aria-hidden />{item.name}
                  </button>
                ))}
              </div>
              <p className={styles.mapHint}>{surface ? `${surfaceName(surface)} reads ${visibleFacts.length} visible Genome facts.` : 'Select a connected surface to filter the source facts.'}</p>
            </section>

            <section id="source-facts" className={styles.factsCard}>
              <div className={styles.panelTitle}><span>02 · source of truth</span><h3>Facts, not a mystery prompt.</h3><p>Every value is structured, scoped and reviewable.</p></div>
              <div className={styles.filters}>
                <button type="button" className={section === 'all' ? styles.filterActive : ''} onClick={() => setSection('all')}>All</button>
                {SECTION_ORDER.map((item) => (
                  <button key={item} type="button" className={section === item ? styles.filterActive : ''} onClick={() => setSection(item)}>{GENOME_SECTION_LABELS[item]}</button>
                ))}
              </div>
              <div className={styles.factList}>
                {visibleFacts.map((fact) => (
                  <article key={fact.id} className={`${styles.fact} ${fact.id === changedFactId ? styles.factChanged : ''}`}>
                    <div><span>{fact.id === changedFactId ? 'sandbox change' : GENOME_SECTION_LABELS[fact.section]}</span><small>{fact.id}</small></div>
                    <h4>{fact.label}</h4>
                    <p>{fact.value}</p>
                    <footer>{fact.readBy.slice(0, 5).map((id) => <span key={id}>{surfaceName(id)}</span>)}</footer>
                  </article>
                ))}
                {visibleFacts.length === 0 ? <p className={styles.empty}>No facts match this surface and section.</p> : null}
              </div>
            </section>
          </div>

          <section className={styles.rippleCard}>
            <div className={styles.panelTitle}><span>03 · change once</span><h3>Make a safe sandbox change.</h3><p>These changes exist for this page view only. They never write to the live customer Genome.</p></div>
            <div className={styles.scenarioButtons}>
              {RIPPLE_SCENARIOS.map((item) => (
                <button key={item.id} type="button" className={scenarioId === item.id ? styles.scenarioActive : ''} onClick={() => { setScenarioId(item.id); setResult(null); }}>{item.chip}</button>
              ))}
              <button type="button" onClick={() => { setScenarioId(''); setResult(null); }}><RotateCcw aria-hidden /> Reset</button>
            </div>
            {scenario ? (
              <div className={styles.rippleDetail}>
                <div className={styles.changeReceipt}>
                  <p>{scenario.factLabel}</p>
                  <div><span><small>before</small>{scenario.before}</span><ArrowRight aria-hidden /><span><small>after</small>{scenario.after}</span></div>
                  <blockquote>{scenario.narrative}</blockquote>
                </div>
                <div className={styles.surfaceUpdates}>
                  {scenario.updates.map((update) => (
                    <article key={`${update.surface}-${update.where}`}><CircleDot aria-hidden /><div><strong>{surfaceName(update.surface)}</strong><span>{update.where}</span><p>{update.change}</p></div></article>
                  ))}
                </div>
              </div>
            ) : <p className={styles.resetNote}>The Genome is back to its confirmed starting state.</p>}
          </section>

          <section id="agent-lab" className={styles.agentLab}>
            <div className={styles.agentIntro}>
              <div className={styles.panelTitle}><span>04 · governed agents</span><h3>Give the live system a job.</h3><p>These are the real OS roles and model-fallback path. They can read this fictional Genome and prepare a draft. They cannot act.</p></div>
              <div className={styles.agentPicker}>
                {AGENTS.map((agent) => (
                  <button key={agent.id} type="button" className={agentId === agent.id ? styles.agentActive : ''} onClick={() => chooseAgent(agent.id)}>
                    <span>{agent.number}</span><strong>{agent.name}</strong><small>{agent.role}</small>
                  </button>
                ))}
              </div>
              <label className={styles.promptLabel}>
                <span>Task for {selectedAgent.name}</span>
                <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={1200} />
              </label>
              <button type="button" className={styles.runButton} onClick={runAgent} disabled={loading || prompt.trim().length < 8}>
                {loading ? <i aria-hidden /> : <Play aria-hidden />}
                {loading ? `${selectedAgent.name} is reading the Genome…` : `Run ${selectedAgent.name}`}
              </button>
              <p className={styles.agentBoundary}><ShieldCheck aria-hidden /> Fictional data only · rate limited · no external tools · no customer writes</p>
            </div>

            <div className={styles.outputPanel} aria-live="polite">
              {!result && !loading ? (
                <div className={styles.outputEmpty}><Sparkles aria-hidden /><p>Run an agent to see the draft, exact source facts and approval boundary arrive together.</p></div>
              ) : null}
              {loading ? <div className={styles.outputEmpty}><i className={styles.loader} aria-hidden /><p>Resolving the agent, reading allowed Genome domains and preparing a reviewable draft.</p></div> : null}
              {error ? <div className={styles.outputError}><strong>The agent paused safely.</strong><p>{error}</p></div> : null}
              {result ? (
                <div className={styles.result}>
                  <header><div><i aria-hidden /><span><strong>{result.agent.name}</strong><small>{result.agent.role} · release {result.agent.version}</small></span></div><b>{result.mode === 'live-model' ? 'live model' : 'safe rules fallback'}</b></header>
                  <div className={styles.draftLabel}><span>prepared draft</span><span>model · {result.model}</span></div>
                  <div className={styles.draft}>{result.draft}</div>
                  <div className={styles.sources}>
                    <p>Genome sources used</p>
                    {result.sources.map((source) => (
                      <article key={source.id}><span>{source.id}</span><div><strong>{source.label}</strong><p>{source.value}</p></div></article>
                    ))}
                  </div>
                  <div id="approval-proof" className={styles.approval}><ShieldCheck aria-hidden /><div><strong>Awaiting human review · {result.approval.reviewer}</strong><p>{result.approval.boundary}</p></div></div>
                  <div className={styles.resultActions}>
                    <button type="button" onClick={shareResult}>
                      {resultShareState === 'copied' ? <Check aria-hidden /> : <Share2 aria-hidden />}
                      {resultShareState === 'copied' ? 'Result copied' : resultShareState === 'shared' ? 'Result shared' : 'Share result'}
                    </button>
                    <button type="button" onClick={downloadResultCard}><Download aria-hidden /> Download branded card</button>
                  </div>
                  <p className={styles.resultBrand}>assembl · Business Genome demo · fictional data · draft only</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>

      <section className={styles.finalCta}>
        <p>Ready to use your own workflow?</p>
        <h2>Start small.<br /><em>Prove what saves time.</em></h2>
        <div><Link href="/pilot-sprint">Start a pilot <ArrowRight aria-hidden /></Link><Link href="/pricing">See the price</Link></div>
      </section>
    </div>
  );
}
