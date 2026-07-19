
'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Copy, RotateCcw, Sparkles } from 'lucide-react';
import { HeroIntakeAgent } from './HeroIntakeAgent';
import styles from './one-minute-business.module.css';

type MotionKind = 'route' | 'grid' | 'stack' | 'flow' | 'constellation' | 'vortex';

type BusinessProfile = {
  id: string;
  sample: string;
  name: string;
  kind: string;
  promise: string;
  customer: string;
  work: string;
  evidence: string;
  boundary: string;
  firstTask: { title: string; summary: string; output: string };
  publicTool: { title: string; summary: string };
  agents: Array<{ name: string; role: string; task: string }>;
  motion: MotionKind;
  colours: [string, string, string];
};

const PROFILES: BusinessProfile[] = [
  {
    id: 'customs',
    sample: 'customs broker',
    name: 'Southline Customs',
    kind: 'Customs brokerage',
    promise: 'Move shipments through the border with fewer surprises.',
    customer: 'Importers and freight teams',
    work: 'Check evidence, classify goods, prepare entries',
    evidence: 'Supplier documents, tariff references, shipment history',
    boundary: 'A licensed broker approves every entry',
    firstTask: {
      title: 'Shipment readiness brief',
      summary: 'The team checked the evidence for an incoming machinery shipment.',
      output: '2 missing documents found · draft questions ready · broker sign-off required',
    },
    publicTool: {
      title: 'Is your shipment border-ready?',
      summary: 'Five quick checks before an importer sends anything.',
    },
    agents: [
      { name: 'Scout', role: 'evidence finder', task: 'reads the shipment pack' },
      { name: 'Route', role: 'customs planner', task: 'maps likely requirements' },
      { name: 'Proof', role: 'review partner', task: 'flags gaps for approval' },
    ],
    motion: 'route',
    colours: ['#24343a', '#8ab3ad', '#c5d9d5'],
  },
  {
    id: 'architect',
    sample: 'architect',
    name: 'Fieldwork Architecture',
    kind: 'Architecture practice',
    promise: 'Turn an unclear brief into a buildable shared direction.',
    customer: 'Homeowners and small developers',
    work: 'Qualify enquiries, shape briefs, keep projects aligned',
    evidence: 'Client notes, site constraints, drawings, decisions',
    boundary: 'The architect owns design and professional advice',
    firstTask: {
      title: 'Project brief starter',
      summary: 'The team turned a first enquiry into a structured discovery brief.',
      output: '8 facts found · 4 questions drafted · project fit held for architect review',
    },
    publicTool: {
      title: 'Is your renovation brief ready?',
      summary: 'A useful one-minute brief check to share with future clients.',
    },
    agents: [
      { name: 'Site', role: 'context reader', task: 'collects the known constraints' },
      { name: 'Brief', role: 'project shaper', task: 'forms the discovery questions' },
      { name: 'Thread', role: 'decision keeper', task: 'keeps changes connected' },
    ],
    motion: 'grid',
    colours: ['#293b3e', '#91aaa8', '#d8e5e2'],
  },
  {
    id: 'builder',
    sample: 'builder',
    name: 'Harbour Build Co.',
    kind: 'Residential building',
    promise: 'Keep people, materials and decisions moving in the right order.',
    customer: 'Homeowners renovating or building',
    work: 'Scope jobs, coordinate dependencies, report progress',
    evidence: 'Plans, quotes, site notes, variations, photos',
    boundary: 'The builder approves cost, programme and site commitments',
    firstTask: {
      title: 'Friday site update',
      summary: 'The team collected this week’s progress and next week’s dependencies.',
      output: '6 updates grouped · 2 decisions needed · client-ready draft waiting',
    },
    publicTool: {
      title: 'Is your renovation ready to price?',
      summary: 'A shareable readiness check before a client asks for a quote.',
    },
    agents: [
      { name: 'Measure', role: 'scope reader', task: 'finds missing job facts' },
      { name: 'Sequence', role: 'programme keeper', task: 'maps dependencies' },
      { name: 'Update', role: 'client reporter', task: 'drafts the weekly view' },
    ],
    motion: 'stack',
    colours: ['#303a3c', '#739e95', '#d3e3df'],
  },
  {
    id: 'plumber',
    sample: 'plumber',
    name: 'Clearflow Plumbing',
    kind: 'Plumbing service',
    promise: 'Get the right person and parts to the right job, first time.',
    customer: 'Homes and small commercial sites',
    work: 'Triage jobs, prepare visits, follow up work',
    evidence: 'Customer description, site history, photos, parts lists',
    boundary: 'A qualified tradesperson confirms diagnosis and safety',
    firstTask: {
      title: 'Tomorrow’s job pack',
      summary: 'The team reviewed the first four bookings and prepared each visit.',
      output: '4 briefs ready · 1 urgent risk flagged · 3 parts lists drafted',
    },
    publicTool: {
      title: 'What should I check before the plumber arrives?',
      summary: 'A calm, practical three-question prep tool for customers.',
    },
    agents: [
      { name: 'Triage', role: 'job qualifier', task: 'sorts urgency and context' },
      { name: 'Kit', role: 'visit planner', task: 'prepares tools and parts' },
      { name: 'Loop', role: 'follow-up keeper', task: 'closes the customer loop' },
    ],
    motion: 'flow',
    colours: ['#284047', '#73aaa4', '#d2e8e4'],
  },
  {
    id: 'dog-trainer',
    sample: 'dog trainer',
    name: 'Harbourside Dog Training',
    kind: 'Dog training practice',
    promise: 'Help dogs and their people build calm skills that hold up in real life.',
    customer: 'Busy dog owners',
    work: 'Qualify needs, prepare sessions, build courses, follow up',
    evidence: 'Enquiry notes, behaviour history, lesson progress',
    boundary: 'The trainer approves behaviour guidance and welfare decisions',
    firstTask: {
      title: 'Level-one recall plan',
      summary: 'The team turned Fred’s notes into a practical first training level.',
      output: '3 exercises formed · safety notes included · trainer approval waiting',
    },
    publicTool: {
      title: 'Can your dog really do it—or only at home?',
      summary: 'Three questions and a useful distraction-training starting point.',
    },
    agents: [
      { name: 'Welcome', role: 'enquiry guide', task: 'understands the dog and goal' },
      { name: 'Course', role: 'lesson builder', task: 'forms the next useful level' },
      { name: 'Follow', role: 'progress keeper', task: 'keeps practice moving' },
    ],
    motion: 'constellation',
    colours: ['#2d3d3a', '#80aa9b', '#dbe7de'],
  },
];

const FALLBACK: BusinessProfile = {
  id: 'service',
  sample: 'service business',
  name: 'Your business',
  kind: 'Specialist service',
  promise: 'Make the valuable work easier to deliver and easier to trust.',
  customer: 'People who need your expertise',
  work: 'Understand needs, prepare work, deliver, follow up',
  evidence: 'Your documents, decisions and working knowledge',
  boundary: 'A named person approves promises and expert judgement',
  firstTask: {
    title: 'First useful work brief',
    summary: 'The team found the repeated work and prepared a safe first output.',
    output: 'business facts formed · next action drafted · approval point visible',
  },
  publicTool: {
    title: 'A useful one-minute check',
    summary: 'A small public tool based on the question your best customers ask first.',
  },
  agents: [
    { name: 'Discover', role: 'context reader', task: 'finds the useful facts' },
    { name: 'Make', role: 'work partner', task: 'prepares the first draft' },
    { name: 'Proof', role: 'quality keeper', task: 'checks evidence and boundaries' },
  ],
  motion: 'vortex',
  colours: ['#28383a', '#78a79e', '#d5e6e1'],
};

const STAGES = [
  ['Describe', 'reading what the business promises'],
  ['Discover', 'finding customers, work and evidence'],
  ['Form', 'creating the shared Business Genome'],
  ['Do', 'coordinating a focused agent team'],
  ['Share', 'making one useful public tool'],
] as const;

function profileFor(description: string) {
  const input = description.toLowerCase();
  if (/custom|import|freight|border/.test(input)) return PROFILES[0];
  if (/architect|architecture|design practice/.test(input)) return PROFILES[1];
  if (/builder|building|construction|renovation/.test(input)) return PROFILES[2];
  if (/plumb|drain|pipe|tradie/.test(input)) return PROFILES[3];
  if (/dog|trainer|training|pet/.test(input)) return PROFILES[4];
  return FALLBACK;
}

function hash(value: number, salt: number) {
  const n = Math.sin(value * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function motionPoint(kind: MotionKind, index: number, count: number, time: number) {
  const progress = index / Math.max(1, count - 1);
  const jitter = hash(index, 4) - 0.5;

  if (kind === 'route') {
    const x = (progress - 0.5) * 2.4;
    return [x, Math.sin(progress * Math.PI * 3 + time) * 0.28 + jitter * 0.08, Math.cos(progress * 8) * 0.22];
  }
  if (kind === 'grid') {
    const columns = 34;
    const x = ((index % columns) / (columns - 1) - 0.5) * 2.25;
    const y = (Math.floor(index / columns) / Math.ceil(count / columns) - 0.5) * 1.5;
    return [x, y, Math.sin(x * 3 + time) * 0.12];
  }
  if (kind === 'stack') {
    const layer = index % 5;
    const angle = progress * Math.PI * 10 + layer * 0.2;
    const radius = 0.35 + layer * 0.17;
    return [Math.cos(angle) * radius, (layer - 2) * 0.22 + jitter * 0.07, Math.sin(angle) * radius];
  }
  if (kind === 'flow') {
    const lane = index % 4;
    const x = (progress * 3.1 + time * 0.18 + lane * 0.25) % 3.1 - 1.55;
    return [x, (lane - 1.5) * 0.25 + Math.sin(x * 2.2 + time) * 0.12, Math.cos(x * 2) * 0.16];
  }
  if (kind === 'constellation') {
    const centres = [[-0.75, -0.25], [-0.36, 0.38], [0.05, 0.04], [0.46, -0.28], [0.72, 0.36]];
    const centre = centres[index % centres.length];
    const radius = Math.pow(hash(index, 9), 2) * 0.35;
    const angle = hash(index, 2) * Math.PI * 2 + time * 0.1;
    return [centre[0] + Math.cos(angle) * radius, centre[1] + Math.sin(angle) * radius, jitter * 0.4];
  }
  const arm = index % 3;
  const p = Math.floor(index / 3) / Math.max(1, Math.floor(count / 3));
  const angle = p * Math.PI * 7 + arm * Math.PI * 2 / 3 + time * 0.18;
  const radius = 0.08 + Math.pow(p, 0.7);
  return [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.75, (p - 0.5) * 0.6];
}

function BusinessMotionProfile({ profile, label = true }: { profile: BusinessProfile; label?: boolean }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (!shell || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particles = window.innerWidth < 700 ? 480 : 880;

    const resize = () => {
      const rect = shell.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (tick = 0) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const time = reduced ? 0.7 : tick * 0.00035;
      context.clearRect(0, 0, width, height);
      const scale = Math.min(width, height) * 0.39;
      const rotation = time * 0.42;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      for (let index = 0; index < particles; index += 1) {
        const [baseX, baseY, baseZ] = motionPoint(profile.motion, index, particles, time * 3);
        const x3 = baseX * cos - baseZ * sin;
        const z3 = baseX * sin + baseZ * cos;
        const perspective = 3 / Math.max(1.5, 3 + z3);
        const x = width / 2 + x3 * scale * perspective;
        const y = height / 2 + baseY * scale * perspective;
        const colour = profile.colours[index % profile.colours.length];
        const radius = (index % 41 === 0 ? 2.2 : 0.75 + hash(index, 7) * 0.9) * perspective;
        context.globalAlpha = 0.38 + hash(index, 3) * 0.52;
        context.fillStyle = colour;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      if (!reduced) frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    const observer = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    observer.observe(shell);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [profile]);

  return (
    <div ref={shellRef} className={styles.motionProfile}>
      <canvas ref={canvasRef} aria-label={`${profile.name} motion profile`} />
      {label ? (
        <div className={styles.motionLabel}>
          <span>business motion profile</span>
          <strong>{profile.motion}</strong>
        </div>
      ) : null}
    </div>
  );
}

export function OneMinuteBusiness() {
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'input' | 'forming' | 'result'>('input');
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<BusinessProfile>(PROFILES[4]);
  const [shared, setShared] = useState(false);
  const preview = useMemo(() => profileFor(description), [description]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const business = new URLSearchParams(window.location.search).get('business');
      const preset = PROFILES.find((profile) => profile.id === business);
      if (preset) {
        setDescription(`I run a ${preset.sample}.`);
        setResult(preset);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mode !== 'forming') return;
    const timers = STAGES.map((_, index) => window.setTimeout(() => setStage(index), index * 650));
    const finish = window.setTimeout(() => setMode('result'), STAGES.length * 650 + 250);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finish);
    };
  }, [mode]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!description.trim()) return;
    setResult(profileFor(description));
    setStage(0);
    setMode('forming');
  };

  const choose = (profile: BusinessProfile) => {
    setDescription(`I run a ${profile.sample}.`);
    setResult(profile);
  };

  const restart = () => {
    setMode('input');
    setStage(0);
    setShared(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const share = async () => {
    const url = new URL(window.location.href);
    url.search = '';
    if (result.id !== 'service') url.searchParams.set('business', result.id);
    const text = `See how ${result.kind.toLowerCase()} takes shape in one minute with assembl.`;
    try {
      if (navigator.share) await navigator.share({ title: `${result.name} · one minute business`, text, url: url.toString() });
      else await navigator.clipboard.writeText(`${text} ${url.toString()}`);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      setShared(false);
    }
  };

  return (
    <section className={styles.root} aria-labelledby="one-minute-title">
      <div className={styles.topline}>
        <span>assembl / one minute business</span>
        <span>free · no account</span>
      </div>

      {mode === 'input' ? (
        <>
          <div className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>the front door to assembl</p>
              <h1 id="one-minute-title">Describe your business.<br /><em>Watch it form.</em></h1>
              <p className={styles.lede}>See your Business Genome, a focused agent team and one useful piece of completed work—in about a minute.</p>
              <form className={styles.intake} onSubmit={submit}>
                <label>
                  <span>What does your business do?</span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="I run a small architecture practice. We spend too much time qualifying enquiries and preparing updates…"
                    rows={4}
                  />
                </label>
                <div className={styles.samples} aria-label="Try a sample business">
                  {PROFILES.map((profile) => (
                    <button key={profile.id} type="button" aria-pressed={preview.id === profile.id && Boolean(description)} onClick={() => choose(profile)}>
                      {profile.sample}
                    </button>
                  ))}
                </div>
                <button className={styles.primary} type="submit" disabled={!description.trim()}>
                  form my business <ArrowRight aria-hidden />
                </button>
                <small>No sign-up. Nothing is published without you.</small>
              </form>
            </div>
            <div className={styles.heroVisual}>
              <HeroIntakeAgent segment={(description ? preview : FALLBACK).id} seedPrompt={description} />
            </div>
          </div>
          <div className={styles.movements} aria-label="How one minute business works">
            {STAGES.map(([name], index) => (
              <div key={name}><span>0{index + 1}</span><strong>{name}</strong><i /></div>
            ))}
          </div>
        </>
      ) : null}

      {mode === 'forming' ? (
        <div className={styles.forming} aria-live="polite">
          <BusinessMotionProfile profile={result} label={false} />
          <div className={styles.formingCopy}>
            <span>0{stage + 1} / 05</span>
            <h1>{STAGES[stage][0]}</h1>
            <p>{STAGES[stage][1]}</p>
            <div>{STAGES.map((item, index) => <i key={item[0]} className={index <= stage ? styles.complete : ''} />)}</div>
          </div>
        </div>
      ) : null}

      {mode === 'result' ? (
        <div className={styles.result}>
          <header className={styles.resultHeader}>
            <div>
              <p className={styles.eyebrow}>your living business / formed</p>
              <h1>{result.name}</h1>
              <p>{result.promise}</p>
            </div>
            <div className={styles.resultHeaderActions}>
              <button type="button" onClick={restart}><RotateCcw aria-hidden /> try another</button>
              <button type="button" onClick={share}>{shared ? <Check aria-hidden /> : <Copy aria-hidden />}{shared ? 'copied' : 'share'}</button>
            </div>
          </header>

          <div className={styles.resultGrid}>
            <section className={styles.profileCard} aria-label="Business motion profile">
              <BusinessMotionProfile profile={result} />
              <div>
                <span>visual profile</span>
                <Link href="/motion-studio">direct it in Motion Studio <ArrowRight aria-hidden /></Link>
              </div>
            </section>

            <section className={styles.genomeCard} aria-labelledby="generated-genome">
              <div className={styles.cardHead}><span>01 / shared source</span><b>live</b></div>
              <h2 id="generated-genome">Business Genome</h2>
              <p>One set of facts every agent reads before it works.</p>
              <dl>
                <div><dt>business</dt><dd>{result.kind}</dd></div>
                <div><dt>promise</dt><dd>{result.promise}</dd></div>
                <div><dt>customer</dt><dd>{result.customer}</dd></div>
                <div><dt>repeated work</dt><dd>{result.work}</dd></div>
                <div><dt>evidence</dt><dd>{result.evidence}</dd></div>
                <div><dt>human boundary</dt><dd>{result.boundary}</dd></div>
              </dl>
              <Link href="/genome">open the live Genome demo <ArrowRight aria-hidden /></Link>
            </section>
          </div>

          <section className={styles.team} aria-labelledby="agent-team-title">
            <div className={styles.cardHead}><span>02 / coordinated team</span><b>same Genome</b></div>
            <div className={styles.teamIntro}>
              <h2 id="agent-team-title">Three agents.<br />One shared picture.</h2>
              <p>They do different jobs, but use the same business facts, evidence and approval boundary. Their work stays connected.</p>
            </div>
            <div className={styles.agentRow}>
              {result.agents.map((agent, index) => (
                <article key={agent.name}>
                  <span>A0{index + 1}</span>
                  <i aria-hidden />
                  <h3>{agent.name}</h3>
                  <strong>{agent.role}</strong>
                  <p>{agent.task}</p>
                </article>
              ))}
            </div>
          </section>

          <div className={styles.workGrid}>
            <section className={styles.workCard}>
              <div className={styles.cardHead}><span>03 / useful work</span><b><Check aria-hidden /> ready to review</b></div>
              <Sparkles aria-hidden />
              <h2>{result.firstTask.title}</h2>
              <p>{result.firstTask.summary}</p>
              <div>{result.firstTask.output}</div>
              <small>{result.boundary}</small>
            </section>
            <section className={styles.publicCard}>
              <div className={styles.cardHead}><span>04 / shareable front door</span><b>public</b></div>
              <p>one minute agent</p>
              <h2>{result.publicTool.title}</h2>
              <p>{result.publicTool.summary}</p>
              <Link href="/a">build and share this agent <ArrowRight aria-hidden /></Link>
            </section>
          </div>

          <footer className={styles.resultFooter}>
            <div><span>Describe → Discover → Form → Do → Share</span><strong>This is how a living business starts.</strong></div>
            <Link href="/genome">try the live assembl dashboard <ArrowRight aria-hidden /></Link>
          </footer>
        </div>
      ) : null}
    </section>
  );
}
