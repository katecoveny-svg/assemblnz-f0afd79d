import type { Metadata } from 'next';
import Link from 'next/link';

import { doOwner } from '@/apps/do/services/owner';
import { listOwnerBuilderJobs } from '@/apps/do/services/office-jobs';
import { listAgents } from '@/apps/do/shared/store';
import type { DurableJobRecord } from '@/apps/do/shared/office-jobs';
import type { AgentSpec } from '@/apps/do/shared/types';
import { DoOfficeSpatial } from './DoOfficeSpatial';
import styles from './office.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'DO Office · assembl' },
  description: 'See what your DOs are doing, what needs you, and what finished — with approvals and evidence visible.',
  alternates: { canonical: '/do/office' },
};

type BoardKey = 'needs_you' | 'working' | 'done';

const BOARD: Array<{ key: BoardKey; label: string; helper: string }> = [
  { key: 'needs_you', label: 'needs you', helper: 'questions, approvals and blockers' },
  { key: 'working', label: 'working', helper: 'DOs preparing, watching or researching' },
  { key: 'done', label: 'done', helper: 'finished work with a receipt' },
];

function agentsForBoard(agents: AgentSpec[], key: BoardKey): AgentSpec[] {
  if (key === 'needs_you') return agents.filter((agent) => agent.status === 'needs_you' || agent.pendingApprovals.length > 0);
  return agents.filter((agent) => agent.status === key && (key !== 'working' || agent.pendingApprovals.length === 0));
}

function roleFor(agent: AgentSpec): string {
  switch (agent.primitive) {
    case 'watch': return 'watch + alert';
    case 'find': return 'find + research';
    case 'extract': return 'extract + organise';
    case 'prepare': return 'prepare + draft';
    case 'compare': return 'compare + recommend';
    default: return 'DO agent';
  }
}

function initials(name: string): string {
  const value = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  return value || 'DO';
}

function AgentCard({ agent }: { agent: AgentSpec }) {
  const pending = agent.pendingApprovals.length;
  const hasEvidence = Boolean(agent.evidence);
  return <article className={styles.card}>
    <div className={styles.cardTop}><div className={styles.identity}><div className={styles.avatar} aria-hidden>{initials(agent.name)}</div><div><h3>{agent.name}</h3><p>{roleFor(agent)}</p></div></div><span className={styles.state} data-state={agent.status}>{agent.status.replace('_', ' ')}</span></div>
    <p className={styles.task}>{agent.brief || 'No current brief.'}</p>{agent.lastNote ? <p className={styles.note}>{agent.lastNote}</p> : null}
    <div className={styles.metrics}><span><strong>{pending}</strong> approvals</span><span><strong>{hasEvidence ? 1 : 0}</strong> receipt</span><span className={styles.mailbox}>mailbox · not provisioned</span></div>
    <div className={styles.cardFooter}><span>updated {new Date(agent.updatedAt).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })}</span><Link href="/do/widget">open DO</Link></div>
  </article>;
}

function BuilderJobCard({ record }: { record: DurableJobRecord }) {
  return <article className={styles.card}>
    <div className={styles.cardTop}><div className={styles.identity}><div className={styles.avatar} aria-hidden>BD</div><div><h3>{record.title}</h3><p>Builder DO · {record.status.replace('_', ' ')}</p></div></div><span className={styles.state} data-state={record.officeStatus}>{record.officeStatus.replace('_', ' ')}</span></div>
    <p className={styles.task}>{record.job.objective}</p>
    <p className={styles.note}>Authority: {record.job.authority}. Acceptance receipts mean the plan was saved — not that a build or Household Floor is running.</p>
    <div className={styles.metrics}><span><strong>1</strong> acceptance</span><span><strong>{record.job.proof.length}</strong> proof items</span><span className={styles.mailbox}>durable · personal</span></div>
    <div className={styles.cardFooter}><span>updated {new Date(record.updatedAt).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })}</span><Link href="/do/builder">reopen in Builder</Link></div>
  </article>;
}

export default async function DoOfficePage() {
  const agents = await listAgents();
  const owner = await doOwner();
  const durableJobs = owner ? await listOwnerBuilderJobs(owner.id).catch(() => []) : [];
  const builderNeedsYou = durableJobs.filter((job) => job.officeStatus === 'needs_you').length;
  const builderWorking = durableJobs.filter((job) => job.officeStatus === 'working').length;
  const builderDone = durableJobs.filter((job) => job.officeStatus === 'done').length;
  const needsYou = agentsForBoard(agents, 'needs_you').length + builderNeedsYou;
  const working = agentsForBoard(agents, 'working').length + builderWorking;
  const done = agentsForBoard(agents, 'done').length + builderDone;
  return <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.brandLockup}><Link href="/do" className={styles.wordmark}>DO</Link><span>office</span><span className={styles.preview}>spatial preview</span></div>
      <div className={styles.headerActions}><Link href="/do/household" className={styles.secondary}>Household Floor</Link><Link href="/do/connections" className={styles.secondary}>connections</Link><Link href="/do/widget" className={styles.secondary}>open companion</Link><Link href="/do/builder" className={styles.secondary}>Builder DO</Link><Link href="/do" className={styles.primary}>+ DO</Link></div>
    </header>
    <main className={styles.main}>
      <section className={styles.intro}><div><p className={styles.eyebrow}>your digital workforce</p><h1>give the work.<br />see it move.</h1></div><p className={styles.introCopy}>Builder DO gives the team work. The Office shows what is moving, what needs your yes, and what just finished. <strong>Save to Office accepts a plan only</strong> — it is not a running agent. For a living family DO, install <Link href="/do/household">Household Floor</Link>, place the browser extension, and run the evening board.</p></section>
      <DoOfficeSpatial needsYou={needsYou} working={working} done={done} />
      <nav className={styles.workspaceBar} aria-label="DO workspaces"><Link href="/do/builder" className={styles.builderLink}>+ job with Builder DO</Link><button type="button" className={styles.workspaceActive}>all DOs <span>{agents.length + durableJobs.length}</span></button><button type="button" disabled>personal{durableJobs.length ? ` · ${durableJobs.length}` : ''}</button><button type="button" disabled>work</button><button type="button" disabled>clients</button><p>{owner ? 'Signed-in Builder jobs use durable Office storage. Demo agents remain local until handoffs land.' : <><Link href="/login?redirect=%2Fdo%2Foffice">Sign in</Link> to project durable Builder jobs here.</>}</p></nav>
      <section className={styles.summary} aria-label="DO status summary"><div><strong>{needsYou}</strong><span>needs you</span></div><div><strong>{working}</strong><span>working</span></div><div><strong>{done}</strong><span>done</span></div><div><strong>0</strong><span>unread handoffs</span></div></section>
      {durableJobs.length ? <section className={styles.column} aria-labelledby="board-builder-jobs"><header className={styles.columnHeader}><div><h2 id="board-builder-jobs">builder jobs</h2><p>owner-scoped plans with acceptance receipts</p></div><span>{durableJobs.length}</span></header><div className={styles.cardStack}>{durableJobs.map((record) => <BuilderJobCard key={record.id} record={record} />)}</div></section> : null}
      <div className={styles.boards}>{BOARD.map((column) => { const columnAgents = agentsForBoard(agents, column.key); return <section className={styles.column} key={column.key} aria-labelledby={`board-${column.key}`}><header className={styles.columnHeader}><div><h2 id={`board-${column.key}`}>{column.label}</h2><p>{column.helper}</p></div><span>{columnAgents.length}</span></header><div className={styles.cardStack}>{columnAgents.length ? columnAgents.map((agent) => <AgentCard key={agent.id} agent={agent} />) : <div className={styles.empty}><span>quiet here</span><p>No DOs in this state yet.</p></div>}</div></section>; })}</div>
      <section className={styles.officeNote}><div><p className={styles.eyebrow}>where this goes</p><h2>personal · work · clients</h2></div><div className={styles.officeNoteCopy}><p>The Office uses the same portable AgentSpec underneath the browser companion, Mac companion, voice and hosted DO. Builder DO is the software-factory specialist inside that workforce.</p><p>Connections give the workforce user-approved capabilities without handing raw credentials to an agent. Structured handoffs, usage rail and execution receipts are the next durable wiring steps — still projected from real state, never fabricated success.</p></div></section>
    </main>
  </div>;
}
