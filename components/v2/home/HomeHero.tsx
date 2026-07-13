'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CircleGauge,
  FileCheck2,
  Globe2,
  LayoutDashboard,
  Network,
  Sparkles,
} from 'lucide-react';
import { GenomeDomeVisual } from '@/components/genome-dome/GenomeDomeVisual';
import styles from './home-dashboard-hero.module.css';

type HomeTab = 'today' | 'sites' | 'genome' | 'proof';

const NAV: Array<{ id: HomeTab; label: string; icon: typeof Activity }> = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'sites', label: 'Living Sites', icon: Globe2 },
  { id: 'genome', label: 'Business Genome', icon: Network },
  { id: 'proof', label: 'Evidence', icon: FileCheck2 },
];

export function HomeHero({ genomeFacts, surfaces }: { genomeFacts: number; surfaces: number }) {
  const [tab, setTab] = useState<HomeTab>('today');

  return (
    <header className={styles.hero}>
      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.workspaceBrand}>
            <span>a</span>
            <div><strong>assembl</strong><small>business OS</small></div>
          </div>
          <nav aria-label="assembl dashboard preview">
            {NAV.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} type="button" className={tab === item.id ? styles.navActive : styles.navItem} onClick={() => setTab(item.id)}><Icon aria-hidden />{item.label}</button>;
            })}
          </nav>
          <div className={styles.sideStatus}>
            <span><Activity aria-hidden /> system ready</span>
            <p>One Business Genome keeps every surface aligned.</p>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.topbar}>
            <div><p>assembl · Living Business dashboard · built in Aotearoa</p><strong>Mahi that earns its proof.</strong></div>
            <Link href="/install">Install yours <ArrowRight aria-hidden /></Link>
          </div>

          <nav className={styles.mobileNav} aria-label="assembl dashboard mobile preview">
            {NAV.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} type="button" className={tab === item.id ? styles.mobileActive : styles.mobileItem} onClick={() => setTab(item.id)}><Icon aria-hidden />{item.label}</button>;
            })}
          </nav>

          {tab === 'today' ? <TodayPanel genomeFacts={genomeFacts} surfaces={surfaces} /> : null}
          {tab === 'sites' ? <SitesPanel /> : null}
          {tab === 'genome' ? <GenomePanel genomeFacts={genomeFacts} surfaces={surfaces} /> : null}
          {tab === 'proof' ? <ProofPanel /> : null}
        </main>
      </div>
    </header>
  );
}

function TodayPanel({ genomeFacts, surfaces }: { genomeFacts: number; surfaces: number }) {
  return (
    <div className={styles.panelStack}>
      <section className={styles.welcomeCard}>
        <div>
          <p className={styles.eyebrow}>your business · one connected workspace</p>
          <h1>Less admin.<br />More mahi<span>.</span></h1>
          <p>assembl gives the website, customer desk, knowledge, bookings and workflows one shared understanding of the business.</p>
          <div className={styles.actions}><Link href="/living-site">Step inside a Living Site <ArrowRight aria-hidden /></Link><Link href="/how-it-works" className={styles.ghost}>How it works</Link></div>
        </div>
        <div className={styles.genomeVisual}>
          <GenomeDomeVisual label="Explore the live genome" />
        </div>
      </section>

      <section className={styles.metrics} aria-label="assembl system signals">
        <Metric value={String(genomeFacts)} label="genome facts" hint="one source of truth" />
        <Metric value={String(surfaces)} label="surfaces connected" hint="site, desk and workflows" />
        <Metric value="1" label="improvement ready" hint="waiting for your yes" />
        <Metric value="0" label="unapproved sends" hint="a person stays in control" />
      </section>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHeading}><div><p className={styles.eyebrow}>today&apos;s work</p><h2>Three useful next steps</h2></div><CircleGauge aria-hidden /></div>
          <div className={styles.taskList}>
            <Link href="/living-site"><span><Check aria-hidden /></span><div><strong>Review new enquiries</strong><small>Draft replies stay on the desk until approved.</small></div><b>high</b></Link>
            <Link href="/install"><span><Check aria-hidden /></span><div><strong>Install an industry workspace</strong><small>Ten answers create the first Business Genome.</small></div><b>next</b></Link>
            <Link href="/os"><span><Check aria-hidden /></span><div><strong>Open the operating system</strong><small>See the work, sources and approval points.</small></div><b>view</b></Link>
          </div>
        </section>
        <section className={`${styles.card} ${styles.briefCard}`}>
          <div className={styles.cardHeading}><div><p className={styles.eyebrow}>morning brief</p><h2>One improvement, ready.</h2></div><Sparkles aria-hidden /></div>
          <p>Your most-asked question is not on the public site yet. A draft answer is ready for review.</p>
          <Link href="/living-site">Review the draft <ArrowRight aria-hidden /></Link>
          <small><FileCheck2 aria-hidden /> Nothing changes until you approve it.</small>
        </section>
      </div>
    </div>
  );
}

function Metric({ value, label, hint }: { value: string; label: string; hint: string }) {
  return <article><strong>{value}</strong><span>{label}</span><small>{hint}</small></article>;
}

function SitesPanel() {
  const sites = [
    ['Dog training', 'Enquiries, programmes and FAQs'],
    ['Customs brokerage', 'Entries, deadlines and client updates'],
    ['Architecture', 'Projects, consents and site notes'],
    ['Health', 'Bookings, plans and follow-ups'],
  ];
  return (
    <div className={styles.panelStack}>
      <section className={styles.panelHeading}><p className={styles.eyebrow}>Living Sites</p><h1>Every business opens as a working dashboard.</h1><p>The public site, customer desk and owner workspace read the same Business Genome.</p></section>
      <section className={styles.siteGrid}>{sites.map(([name, note]) => <Link key={name} href="/living-site"><span><Globe2 aria-hidden /> fictional sample</span><h2>{name}</h2><p>{note}</p><b>Open dashboard <ArrowRight aria-hidden /></b></Link>)}</section>
    </div>
  );
}

function GenomePanel({ genomeFacts, surfaces }: { genomeFacts: number; surfaces: number }) {
  return (
    <div className={styles.panelStack}>
      <section className={styles.panelHeading}><p className={styles.eyebrow}>Business Genome</p><h1>Change the fact once. Let every approved surface follow.</h1><p>Services, prices, policies, people and operating rules stay structured and visible.</p></section>
      <div className={styles.genomeGrid}><section className={styles.genomeImage}><GenomeDomeVisual label="Open the full genome" /></section><section className={styles.card}><p className={styles.eyebrow}>connected readers</p><div className={styles.readerList}>{['Public Living Site','Customer desk','Bookings','Knowledge','Email drafts','Owner dashboard'].map((reader)=><p key={reader}><Network aria-hidden /><span>{reader}</span><b>reading</b></p>)}</div><small>{genomeFacts} facts · {surfaces} connected surface types in the current sample.</small></section></div>
    </div>
  );
}

function ProofPanel() {
  return (
    <div className={styles.panelStack}>
      <section className={styles.panelHeading}><p className={styles.eyebrow}>Evidence</p><h1>The work should show its sources and its reviewer.</h1><p>Every important output ends with assumptions, checks, approval state and a timestamp.</p></section>
      <section className={styles.proofGrid}>{[['Sources attached','The material used is visible.'],['Assumptions named','Unknowns are not presented as facts.'],['Human reviewer','A named person approves consequential work.'],['Audit trail','The final record keeps the when and why.']].map(([title,note])=><article key={title}><FileCheck2 aria-hidden /><h2>{title}</h2><p>{note}</p><span>included</span></article>)}</section>
    </div>
  );
}
