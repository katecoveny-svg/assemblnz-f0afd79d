'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  ExternalLink,
  Home,
  ListChecks,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { SampleEnquiryForm } from '@/components/living-site/SampleEnquiryForm';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import { SAMPLE_VERTICALS, type SampleVertical } from '@/lib/living-site/verticals';
import styles from './living-site-dashboard.module.css';

type DashboardTab = 'overview' | 'services' | 'knowledge' | 'enquire' | 'ask';

const TAB_META: Record<DashboardTab, { label: string; icon: typeof Home }> = {
  overview: { label: 'Overview', icon: Home },
  services: { label: 'Services', icon: ListChecks },
  knowledge: { label: 'Good to know', icon: BookOpen },
  enquire: { label: 'Enquire', icon: Send },
  ask: { label: 'Ask the desk', icon: MessageSquareText },
};

function fact(facts: GenomeFact[], id: string): GenomeFact | undefined {
  return facts.find((item) => item.id === id);
}

function splitValue(value: string): { lead: string; rest: string | null } {
  const index = value.indexOf('·');
  if (index < 0) return { lead: value, rest: null };
  return { lead: value.slice(0, index).trim(), rest: value.slice(index + 1).trim() };
}

export function LivingSiteDashboard({
  v,
  facts,
  live,
  install,
}: {
  v: SampleVertical;
  facts: GenomeFact[];
  live: boolean;
  install?: { id: string };
}) {
  const [tab, setTab] = useState<DashboardTab>('overview');
  const services = facts.filter((item) => item.section === 'services');
  const knowledge = facts.filter((item) => item.section === 'knowledge');
  const surfaces = new Set(facts.flatMap((item) => item.readBy)).size;
  const team = fact(facts, 'g-team')?.value;
  const rules = fact(facts, 'g-booking-rules')?.value;
  const testimonial = fact(facts, 'g-testimonials')?.value;
  const area = fact(facts, 'g-area')?.value;
  const voice = fact(facts, 'g-voice')?.value;
  const [wordmark] = (fact(facts, 'g-name')?.value ?? v.businessName).split(' · ');
  const tenant = install ? `install-${install.id}` : v.tenant;
  const osHref = install ? `/living-site/install/${install.id}/os` : `/living-site/${v.slug}/os`;
  const tabs: DashboardTab[] = v.chat
    ? ['overview', 'services', 'knowledge', 'enquire', 'ask']
    : ['overview', 'services', 'knowledge', 'enquire'];

  const variables = {
    '--living-ink': v.palette.ink,
    '--living-accent': v.palette.accent,
    '--living-bg': v.palette.bg,
    '--living-card': v.palette.card,
    '--living-muted': v.palette.muted,
  } as CSSProperties;

  return (
    <div className={styles.shell} style={variables}>
      <div className={styles.conceptStrip}>
        <span>{install ? 'your generated Living Site' : 'fictional sample business'}</span>
        <span>{live ? 'genome connected' : 'sample genome'} · every send needs a person&apos;s approval</span>
      </div>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <Link href={`/living-site/${v.slug}`} className={styles.brandBlock}>
            <span className={styles.brandMark}>{wordmark.charAt(0)}</span>
            <span><strong>{wordmark}</strong><small>{v.tagline}</small></span>
          </Link>

          <nav className={styles.sideNav} aria-label={`${wordmark} sections`}>
            {tabs.map((item) => {
              const Icon = TAB_META[item].icon;
              return (
                <button key={item} type="button" className={tab === item ? styles.navActive : styles.navItem} onClick={() => setTab(item)}>
                  <Icon aria-hidden /> {TAB_META[item].label}
                </button>
              );
            })}
          </nav>

          <div className={styles.sidebarFoot}>
            <span><Activity aria-hidden /> {live ? 'live genome' : 'sample data'}</span>
            <Link href={osHref}>Owner workspace <ExternalLink aria-hidden /></Link>
            <Link href="/living-site">How Living Sites work</Link>
          </div>
        </aside>

        <main className={styles.main}>
          <header className={styles.topbar}>
            <div>
              <p className={styles.eyebrow}>{v.industryLabel} · customer dashboard</p>
              <h1>{wordmark}</h1>
            </div>
            <button type="button" className={styles.enquireButton} onClick={() => setTab('enquire')}>
              Start an enquiry <ArrowRight aria-hidden />
            </button>
          </header>

          <nav className={styles.mobileNav} aria-label={`${wordmark} mobile sections`}>
            {tabs.map((item) => {
              const Icon = TAB_META[item].icon;
              return (
                <button key={item} type="button" className={tab === item ? styles.mobileActive : styles.mobileItem} onClick={() => setTab(item)}>
                  <Icon aria-hidden /> {TAB_META[item].label}
                </button>
              );
            })}
          </nav>

          {tab === 'overview' ? (
            <OverviewPanel
              v={v}
              services={services}
              knowledge={knowledge}
              facts={facts}
              surfaces={surfaces}
              area={area}
              team={team}
              rules={rules}
              testimonial={testimonial}
              voice={voice}
              onTab={setTab}
            />
          ) : null}
          {tab === 'services' ? <ServicesPanel services={services} onEnquire={() => setTab('enquire')} /> : null}
          {tab === 'knowledge' ? <KnowledgePanel knowledge={knowledge} rules={rules} /> : null}
          {tab === 'enquire' ? (
            <EnquiryPanel v={v} tenant={tenant} />
          ) : null}
          {tab === 'ask' && v.chat ? (
            <AskPanel v={v} facts={facts} />
          ) : null}
        </main>
      </div>

      <footer className={styles.footer}>
        <p>
          {install ? 'Generated from ten answers by the assembl installer.' : `${v.businessName} is fictional sample data.`}{' '}
          The dashboard reads {facts.length} Business Genome facts{live ? ' from the live database' : ''}.
        </p>
        <div>
          {SAMPLE_VERTICALS.filter((item) => item.slug !== v.slug).slice(0, 3).map((item) => (
            <Link key={item.slug} href={`/living-site/${item.slug}`}>{item.industryLabel}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}

function OverviewPanel({
  v,
  services,
  knowledge,
  facts,
  surfaces,
  area,
  team,
  rules,
  testimonial,
  voice,
  onTab,
}: {
  v: SampleVertical;
  services: GenomeFact[];
  knowledge: GenomeFact[];
  facts: GenomeFact[];
  surfaces: number;
  area?: string;
  team?: string;
  rules?: string;
  testimonial?: string;
  voice?: string;
  onTab: (tab: DashboardTab) => void;
}) {
  return (
    <div className={styles.panelStack}>
      <section className={styles.heroCard}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{area ?? v.tagline}</p>
          <h2>{v.heroHeadline}</h2>
          <p>{v.heroLede}</p>
          <div className={styles.heroActions}>
            <button type="button" onClick={() => onTab('enquire')}>Tell us what you need <ArrowRight aria-hidden /></button>
            {v.chat ? <button type="button" className={styles.heroGhost} onClick={() => onTab('ask')}>Ask the desk</button> : null}
          </div>
        </div>
        <div className={styles.heroVisual} aria-hidden>
          {v.sphere ? <Image src={v.sphere} alt="" width={420} height={420} /> : <span>{v.businessName.charAt(0)}</span>}
        </div>
      </section>

      <section className={styles.signalGrid} aria-label="Living Site signals">
        <Signal value={String(services.length)} label="services available" hint="priced from one source" />
        <Signal value={String(knowledge.length)} label="answers ready" hint="policies and FAQs" />
        <Signal value={String(facts.length)} label="genome facts" hint="shared across the business" />
        <Signal value={String(surfaces)} label="connected surfaces" hint="site, desk and workflows" />
      </section>

      <div className={styles.twoColumn}>
        <section className={styles.card}>
          <div className={styles.cardHeading}><div><p className={styles.cardLabel}>service menu</p><h3>Choose a starting point</h3></div><ListChecks aria-hidden /></div>
          <div className={styles.rowList}>
            {services.slice(0, 4).map((service) => {
              const value = splitValue(service.value);
              return (
                <button key={service.id} type="button" onClick={() => onTab('enquire')}>
                  <span className={styles.rowCheck}><Check aria-hidden /></span>
                  <span><strong>{service.label}</strong><small>{value.rest ?? 'Ask for the details'}</small></span>
                  <b>{value.lead}</b>
                </button>
              );
            })}
          </div>
          <button type="button" className={styles.textButton} onClick={() => onTab('services')}>See every service <ArrowRight aria-hidden /></button>
        </section>

        <section className={`${styles.card} ${styles.nextCard}`}>
          <div className={styles.cardHeading}><div><p className={styles.cardLabel}>one useful next step</p><h3>{v.enquiry.heading}</h3></div><Sparkles aria-hidden /></div>
          <p>{v.enquiry.lede}</p>
          <button type="button" className={styles.primaryAction} onClick={() => onTab('enquire')}>Open the enquiry desk <ArrowRight aria-hidden /></button>
          <div className={styles.approvalNote}><ShieldCheck aria-hidden /><span>A person reads every enquiry. Nothing books or sends automatically.</span></div>
        </section>
      </div>

      <div className={styles.twoColumn}>
        <section className={styles.card}>
          <p className={styles.cardLabel}>how the business runs</p>
          <div className={styles.detailList}>
            {team ? <p><span>Team</span><strong>{team}</strong></p> : null}
            {rules ? <p><span>Service rules</span><strong>{rules}</strong></p> : null}
            {voice ? <p><span>How we communicate</span><strong>{voice}</strong></p> : null}
          </div>
        </section>
        <section className={`${styles.card} ${styles.proofCard}`}>
          <p className={styles.cardLabel}>proof</p>
          <blockquote>{testimonial ?? 'This fictional sample keeps proof and policies beside the work, ready for a person to review.'}</blockquote>
          <span><CircleCheck aria-hidden /> Business Genome source visible</span>
        </section>
      </div>
    </div>
  );
}

function Signal({ value, label, hint }: { value: string; label: string; hint: string }) {
  return <article className={styles.signal}><strong>{value}</strong><span>{label}</span><small>{hint}</small></article>;
}

function ServicesPanel({ services, onEnquire }: { services: GenomeFact[]; onEnquire: () => void }) {
  return (
    <section className={styles.panelStack}>
      <div className={styles.panelHeading}><p className={styles.eyebrow}>services · from the Business Genome</p><h2>Clear choices, without the brochure hunt.</h2><p>Select any service to open the same enquiry desk.</p></div>
      <div className={styles.serviceGrid}>
        {services.map((service) => {
          const value = splitValue(service.value);
          return <article key={service.id} className={styles.serviceCard}><span><CircleCheck aria-hidden /> available</span><h3>{service.label}</h3><strong>{value.lead}</strong>{value.rest ? <p>{value.rest}</p> : null}<button type="button" onClick={onEnquire}>Ask about this <ArrowRight aria-hidden /></button></article>;
        })}
      </div>
    </section>
  );
}

function KnowledgePanel({ knowledge, rules }: { knowledge: GenomeFact[]; rules?: string }) {
  return (
    <section className={styles.panelStack}>
      <div className={styles.panelHeading}><p className={styles.eyebrow}>knowledge · one source of truth</p><h2>Answers beside the work.</h2><p>These policies and answers also inform the owner workspace and supported desk agents.</p></div>
      <div className={styles.knowledgeList}>
        {knowledge.map((item, index) => <article key={item.id}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{item.label}</h3><p>{item.value}</p></div><BookOpen aria-hidden /></article>)}
        {rules ? <article><span>{String(knowledge.length + 1).padStart(2, '0')}</span><div><h3>Service rules</h3><p>{rules}</p></div><ShieldCheck aria-hidden /></article> : null}
      </div>
    </section>
  );
}

function EnquiryPanel({ v, tenant }: { v: SampleVertical; tenant: string }) {
  return (
    <section className={styles.panelStack}>
      <div className={styles.panelHeading}><p className={styles.eyebrow}>enquiry desk · human reviewed</p><h2>{v.enquiry.heading}</h2><p>{v.enquiry.lede}</p></div>
      <div className={styles.formCard}>
        <SampleEnquiryForm tenant={tenant} owner={v.owner} palette={v.palette} detailLabel={v.enquiry.detailLabel} detailPlaceholder={v.enquiry.detailPlaceholder} messagePlaceholder={v.enquiry.messagePlaceholder} />
      </div>
    </section>
  );
}

function AskPanel({ v, facts }: { v: SampleVertical; facts: GenomeFact[] }) {
  if (!v.chat) return null;
  return (
    <section className={styles.panelStack}>
      <div className={styles.panelHeading}><p className={styles.eyebrow}>resident desk · voice and chat</p><h2>Ask about a service, price or policy.</h2><p>The desk reads the same {facts.length} Business Genome facts as this dashboard. Replies remain drafts.</p></div>
      <div className={styles.formCard}>
        <PilotAgentChat apiPath={v.chat.apiPath} agentName={v.chat.agentName} greeting={v.chat.greeting} tryMe={v.chat.tryMe} accent={v.palette.accent} draftNote={v.chat.draftNote} />
      </div>
    </section>
  );
}
