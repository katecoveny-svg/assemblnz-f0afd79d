'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  Gauge,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import styles from './business-genome.module.css';

const SYSTEMS = [
  { id: 'overview', label: 'Business overview', icon: Gauge },
  { id: 'people', label: 'People', icon: Users },
  { id: 'customers', label: 'Customers', icon: BriefcaseBusiness },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { id: 'finance', label: 'Finance', icon: CircleDollarSign },
  { id: 'risk', label: 'Risk', icon: ShieldCheck },
  { id: 'activity', label: 'Activity', icon: Activity },
];

const INTELLIGENCE = [
  ['Customer response', 'Three enquiries are ready for review.', 'Open the customer desk'],
  ['Operating signal', 'Friday afternoon has the longest booking gap.', 'Review a draft offer'],
  ['Knowledge risk', 'Two common answers only exist in one person’s inbox.', 'Capture the source'],
];

const NODES = [
  ['Customers', '3 waiting', 22, 35, 'customer'],
  ['Knowledge', '14 facts', 47, 18, 'knowledge'],
  ['Operations', '6 flows', 69, 39, 'operations'],
  ['Finance', '2 drafts', 58, 70, 'finance'],
  ['People', '4 roles', 27, 72, 'people'],
  ['Approvals', '1 ready', 44, 48, 'approval'],
] as const;

const AGENT_POSITIONS = [
  { left: '50%', top: '8%' },
  { left: '88%', top: '37%' },
  { left: '73%', top: '83%' },
  { left: '27%', top: '83%' },
  { left: '12%', top: '37%' },
];

const SCENARIOS = [
  { number: '01', title: 'An enquiry arrives', body: 'The customer response agent finds the right service facts, prepares a reply and leaves it on the desk for approval.', href: '/living-site', label: 'Open the customer desk' },
  { number: '02', title: 'A booking becomes a customer', body: 'The confirmed request appears in the CRM with its source, next action and the original Business Genome context.', href: '/living-site/dog-training', label: 'See a working Living Site' },
  { number: '03', title: 'Commercial work stays connected', body: 'Proposal and invoice drafts use the approved customer, service and price facts — with reviewer and status visible.', href: '/living-site/dog-training/os', label: 'Open the operating dashboard' },
  { number: '04', title: 'The business learns', body: 'Repeated customer questions become a suggested knowledge update, ready for a person to review once.', href: '/genome', label: 'Explore the live genome' },
] as const;

export function BusinessGenomeSection({ genomeFacts, surfaces }: { genomeFacts: number; surfaces: number }) {
  const [system, setSystem] = useState('overview');

  return (
    <>
      <section className={styles.section} id="living-map">
        <Reveal className={styles.intro}>
          <p className={styles.eyebrow}>The system becomes visible</p>
          <h2>Not another stack of apps. One living map of the business.</h2>
          <p>
            Every website answer, booking rule, customer record and agent action reads the same structured Business Genome. Change the source once; each connected surface can prepare the right update for review.
          </p>
        </Reveal>

        <Reveal className={styles.workspace} delay={80}>
          <aside className={styles.leftRail}>
            <div className={styles.workspaceBrand}><span>a</span><div><b>assembl</b><small>Business Genome</small></div></div>
            <nav aria-label="Business Genome systems">
              {SYSTEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSystem(item.id)}
                    className={system === item.id ? styles.activeSystem : undefined}
                  >
                    <Icon aria-hidden /> {item.label}
                  </button>
                );
              })}
            </nav>
            <div className={styles.systemStatus}><i aria-hidden /> connected now</div>
          </aside>

          <main className={styles.mapPanel}>
            <div className={styles.mapHeader}>
              <div><p>Fictional Auckland service business</p><h3>A living view of today</h3></div>
              <span>{genomeFacts} facts · {surfaces} surfaces</span>
            </div>
            <div className={styles.genomeMap} aria-label="Connected business systems map">
              <svg viewBox="0 0 100 100" aria-hidden>
                <path d="M22 35 C30 26 38 21 47 18" />
                <path d="M47 18 C59 18 65 28 69 39" />
                <path d="M69 39 C70 52 65 62 58 70" />
                <path d="M58 70 C46 79 36 78 27 72" />
                <path d="M27 72 C18 61 17 47 22 35" />
                <path d="M22 35 C34 40 39 44 44 48" />
                <path d="M47 18 C46 31 45 40 44 48" />
                <path d="M69 39 C58 42 51 45 44 48" />
                <path d="M58 70 C52 59 48 53 44 48" />
                <path d="M27 72 C31 60 37 53 44 48" />
              </svg>
              <div className={styles.mapHalo} aria-hidden />
              {NODES.map(([label, value, x, y, kind]) => (
                <button
                  key={kind}
                  type="button"
                  className={`${styles.mapNode} ${styles[kind]}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <i aria-hidden />
                  <b>{label}</b>
                  <span>{value}</span>
                </button>
              ))}
              <div className={styles.mapPlace}>Tāmaki Makaurau · Auckland</div>
            </div>
            <div className={styles.mapMetrics}>
              <article><strong>3</strong><span>enquiries to review</span></article>
              <article><strong>1</strong><span>improvement prepared</span></article>
              <article><strong>0</strong><span>unapproved sends</span></article>
            </div>
          </main>

          <aside className={styles.intelligencePanel}>
            <div className={styles.panelTitle}><span><Sparkles aria-hidden /> assembl is interpreting</span><b>today</b></div>
            <div className={styles.insightList}>
              {INTELLIGENCE.map(([title, body, action], index) => (
                <article key={title}>
                  <small>0{index + 1}</small>
                  <h4>{title}</h4>
                  <p>{body}</p>
                  <Link href="/living-site">{action} <ArrowRight aria-hidden /></Link>
                </article>
              ))}
            </div>
            <div className={styles.approvalNote}><FileCheck2 aria-hidden /><p><b>A person stays in control.</b><span>Sources, assumptions and approval state travel with the work.</span></p></div>
          </aside>
        </Reveal>
      </section>

      <section className={styles.actionSection}>
        <Reveal className={styles.intro}>
          <p className={styles.eyebrow}>Intelligence in action</p>
          <h2>Context becomes useful work.</h2>
        </Reveal>
        <div className={styles.scenarioGrid}>
          {SCENARIOS.map((s, i) => (
            <Reveal key={s.number} className={styles.cardCell} delay={i * 90}>
              <Scenario {...s} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.agentSection}>
        <Reveal>
          <p className={styles.eyebrow}>Agents born from context</p>
          <h2>Specialists inside the system — not products on a shelf.</h2>
          <p>Each capability knows its role, source knowledge, connected tools, permissions, required approvals and success criteria.</p>
        </Reveal>
        <div className={styles.agentMap}>
          <span className={styles.agentCore}><Network aria-hidden /><b>Business Genome</b><small>shared context</small></span>
          {['Customer response', 'Operations coordinator', 'Financial monitor', 'Knowledge keeper', 'Growth planner'].map((agent, index) => (
            <span key={agent} className={styles.agentNode} style={AGENT_POSITIONS[index]}><i aria-hidden /><b>{agent}</b><small>connected · reviewed</small></span>
          ))}
        </div>
      </section>

      <section className={styles.pilotCta}>
        <Reveal>
          <p className={styles.eyebrow}>Founding pilot sprint</p><h2>Build the first working version of your business.</h2><p>A focused installation for founding pilots: Business Genome, live dashboard, one priority workflow and the proof needed to decide what comes next.</p>
        </Reveal>
        <Reveal delay={120} className={styles.priceCard}><small>Founding pilot</small><strong>NZ$1,500</strong><span>+ GST · one focused sprint</span><ul><li><CheckCircle2 aria-hidden /> Business Genome workshop</li><li><CheckCircle2 aria-hidden /> Working Living Site dashboard</li><li><CheckCircle2 aria-hidden /> One connected workflow</li></ul><Link href="/pilot-sprint">Apply for a founding pilot <ArrowRight aria-hidden /></Link></Reveal>
      </section>
    </>
  );
}

function Scenario({ number, title, body, href, label }: { number: string; title: string; body: string; href: string; label: string }) {
  return <article className={styles.scenario}><span>{number}</span><h3>{title}</h3><p>{body}</p><Link href={href}>{label} <ArrowRight aria-hidden /></Link></article>;
}
