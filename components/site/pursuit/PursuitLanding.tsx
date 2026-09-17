'use client';

/**
 * Lean public Pursuit landing — Kate visual lock 2026-09-17.
 * Keep "Find the opening / Build the possibility".
 * No playground, NZ-tool demo, Task DO Maker, or Glow widget.
 * Agents read machine-readable docs; humans open the external hub.
 */
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, FileText } from 'lucide-react';
import { PRODUCT_DESTINATIONS, PURSUIT_SITE_ORIGIN } from '@/lib/product-destinations';
import '../assembl-the-work/assembl-the-work.css';
import styles from './pursuit.module.css';

const steps = [
  [
    'Bring the context.',
    'Start with the business, the customer and the question. Add the sources and material you want the work grounded in.',
  ],
  [
    'Develop the opportunity.',
    'Look for a specific customer problem. Keep evidence, assumptions and open questions visible as the idea takes shape.',
  ],
  [
    'Prepare something useful.',
    'Bring the brief, concept and next-step plan into the client workspace. Review before sharing or moving into production.',
  ],
] as const;

const machineReadable = [
  {
    label: 'llms.txt',
    href: '/llms.txt',
    detail: 'Machine-readable product map for agents and tools.',
  },
  {
    label: 'llms-full.txt',
    href: '/llms-full.txt',
    detail: 'Full public story: Pursuit, DO, Studio, authority boundaries.',
  },
  {
    label: 'Bring a brief',
    href: '/contact?product=pursuit',
    detail: 'Human path — scope a Pursuit sprint with assembl.',
  },
] as const;

export function PursuitLanding() {
  const workspace = PRODUCT_DESTINATIONS.pursuit.workspace;
  const hub = PURSUIT_SITE_ORIGIN;

  return (
    <div className={`atw ${styles.page}`}>
      <a href="#pursuit-brief" className="atw-skip">
        Skip to the brief
      </a>
      <section className={styles.hero} aria-labelledby="pursuit-title">
        <div className={styles.ambient} aria-hidden="true" />
        <header className={styles.header}>
          <Link href="/" className={styles.wordmark}>
            assembl
          </Link>
          <nav aria-label="Primary">
            <Link href="/pursuit" aria-current="page">
              Pursuit
            </Link>
            <Link href="/do">DO</Link>
            <Link href="/creative-studio">Studio</Link>
          </nav>
        </header>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Pursuit / find it.</p>
            <h1 id="pursuit-title">
              Find the opening.
              <br />
              <span>Build the possibility.</span>
            </h1>
            <p className={styles.lead}>
              Research the opportunity. Shape a credible idea. Prepare the next
              conversation.
            </p>
            <a className={styles.primary} href={hub} target="_blank" rel="noopener noreferrer">
              Open Pursuit hub <ArrowUpRight size={19} />
            </a>
            <a className={styles.quietLink} href="#pursuit-brief">
              Read the brief for agents <ArrowDown size={16} />
            </a>
            <Link className={styles.quietLink} href="/contact?product=pursuit">
              Scope a Pursuit sprint <ArrowUpRight size={16} />
            </Link>
          </div>
          <aside
            id="pursuit-brief"
            className={styles.example}
            aria-label="Machine-readable Pursuit brief"
          >
            <div className={styles.exampleTop}>
              <span>For agents · readable brief</span>
              <FileText size={16} aria-hidden="true" />
            </div>
            <div className={styles.paperStack}>
              <article className={styles.resultSheet} aria-labelledby="brief-title">
                <div className={styles.paperHeader}>
                  <FileText size={21} />
                  <span>Pursuit / public brief</span>
                  <span>docs</span>
                </div>
                <p className={styles.paperLabel}>01 / WHAT TO READ</p>
                <h2 id="brief-title">Not a live demo.</h2>
                <p className={styles.paperBody}>
                  The public www face does not run company lookups or mint task
                  agents. Read the structured docs, then open the private hub
                  when you have access.
                </p>
                <ul className={styles.briefList}>
                  {machineReadable.map((item) => (
                    <li key={item.href}>
                      {item.href.startsWith('http') || item.href.startsWith('/llms') ? (
                        <a href={item.href} {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                          <strong>{item.label}</strong>
                          <span>{item.detail}</span>
                        </a>
                      ) : (
                        <Link href={item.href}>
                          <strong>{item.label}</strong>
                          <span>{item.detail}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
                <div className={styles.paperFoot}>
                  <span>Sources stay with you. Judgement stays with you.</span>
                </div>
              </article>
            </div>
            <p className={styles.exampleNote} role="status">
              Canonical hub:{' '}
              <a href={hub} target="_blank" rel="noopener noreferrer">
                assembl-pursuit.katecoveny.chatgpt.site
              </a>
              . No in-repo playground on www.
            </p>
          </aside>
        </div>
        <div className={styles.heroFoot}>
          <span>Research → opportunity → useful next step</span>
          <span>Your sources. Your judgement.</span>
        </div>
      </section>
      <section className={styles.process} aria-labelledby="process-title">
        <div>
          <p className={styles.eyebrow}>A clear path through the work</p>
          <h2 id="process-title">
            Something worth
            <br />
            taking forward.
          </h2>
          <p className={styles.sectionLead}>
            Bring the evidence and the idea together, so the next conversation
            starts with something concrete.
          </p>
        </div>
        <ol>
          {steps.map(([title, body], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className={styles.connected} aria-labelledby="connected-title">
        <div className={styles.connectedIntro}>
          <p className={styles.eyebrow}>Find. DO. Show.</p>
          <h2 id="connected-title">
            Give the idea
            <br />
            somewhere to go.
          </h2>
          <p>
            Start with Pursuit. Bring in DO for preparation and Studio when you
            are ready to make the idea tangible.
          </p>
        </div>
        <div className={styles.productLinks}>
          <a href={hub} target="_blank" rel="noopener noreferrer">
            <span>01 / Pursuit</span>
            <h3>Find the opportunity.</h3>
            <p>Research, context and a focused brief — in the hub.</p>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <Link href="/do">
            <span>02 / DO</span>
            <h3>Prepare the work.</h3>
            <p>Meeting notes and a generic Household board.</p>
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href="/creative-studio">
            <span>03 / Studio</span>
            <h3>Make it tangible.</h3>
            <p>A concept, pitch or experience to review.</p>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className={styles.offer} aria-labelledby="offer-title">
        <div>
          <p className={styles.eyebrow}>Work with assembl</p>
          <h2 id="offer-title">
            A focused
            <br />
            Pursuit sprint.
          </h2>
          <p>
            A scoped engagement to research one opportunity, develop a concept
            and prepare the next conversation.
          </p>
          <Link className={styles.primaryDark} href="/contact?product=pursuit">
            Discuss your project <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className={styles.deliverables}>
          <p className={styles.eyebrow}>What we agree together</p>
          <ul>
            <li>A focused opportunity brief</li>
            <li>A developed concept</li>
            <li>Evidence and questions to validate</li>
            <li>A practical next-step plan</li>
          </ul>
          <p>
            Hub access and business connections are set up for the agreed
            engagement. Your workspace requires sign-in.
          </p>
          <a href={workspace} target="_blank" rel="noopener noreferrer">
            Already working with us? Open your hub <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <footer className={styles.footer}>
        <Link className={styles.wordmark} href="/">
          assembl
        </Link>
        <p>
          Mahi that earns its proof.
          <br />
          Aotearoa New Zealand.
        </p>
        <nav aria-label="Footer">
          <Link href="/">Home</Link>
          <a href={hub} target="_blank" rel="noopener noreferrer">
            Pursuit hub
          </a>
          <Link href="/contact">Contact</Link>
          <Link href="/legal/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
