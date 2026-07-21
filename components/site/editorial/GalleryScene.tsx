import Link from 'next/link';

import styles from './editorial-home.module.css';

const surfaces = [
  {
    number: '01',
    title: 'living site',
    body: 'Change a fact once. Your site, answers and enquiries all keep up.',
    detail: 'public · always current',
  },
  {
    number: '02',
    title: 'agent team',
    body: 'A small, focused crew for the work that repeats inside your business.',
    detail: 'named · bounded · testable',
  },
  {
    number: '03',
    title: 'business inbox',
    body: 'Every enquiry arrives with context, a suggested next step and a draft.',
    detail: 'connected · never autonomous',
  },
  {
    number: '04',
    title: 'creative studio',
    body: 'Campaigns, posts and visual assets that already know your business.',
    detail: 'on-brand · ready to edit',
  },
];

const approvals = [
  { label: 'customer reply', detail: 'priority install request · drafted', time: '2m ago' },
  { label: 'weekly update', detail: '5 jobs · 2 risks · 1 decision', time: '18m ago' },
  { label: 'website change', detail: 'winter hours · 3 surfaces affected', time: '41m ago' },
];

const concepts = [
  {
    id: 'everyday',
    eyebrow: 'retail · loyalty · agentic commerce',
    title: 'everyday, assembled.',
    body: 'A waiting moment becomes a rewarded signal, household understanding and a shop ready to review.',
    href: 'https://assembl-concept-studio.katecoveny.chatgpt.site/everyday-rewards',
    shape: styles.conceptSphere,
  },
  {
    id: 'contact',
    eyebrow: 'energy · household intelligence',
    title: 'home energy, assembled.',
    body: 'A calm, useful household layer that turns energy data into action people can understand.',
    href: 'https://assembl-concept-studio.katecoveny.chatgpt.site/contact',
    shape: styles.conceptBlock,
  },
  {
    id: 'airnz',
    eyebrow: 'travel · service · anticipation',
    title: 'the journey, assembled.',
    body: 'A connected travel companion that quietly prepares the next useful thing before it is asked for.',
    href: 'https://assembl-concept-studio.katecoveny.chatgpt.site/air-new-zealand',
    shape: styles.conceptRing,
  },
];

export function GalleryScene() {
  return (
    <main>
      <section id="how-it-works" className={styles.systemSection} aria-labelledby="system-heading">
        <div className={styles.systemLayout}>
          <div className={styles.sectionIntro}>
            <p className={styles.kicker}><span aria-hidden /> one connected system</p>
            <h2 id="system-heading"><span>see it.</span><span>hold it.</span><em>understand it.</em></h2>
            <p>
              A website, an agent and a CRM should not each hold a different version of your business.
              assembl gives them one shared understanding — then makes the work visible.
            </p>
          </div>

          <div className={styles.surfaceMap}>
          <div className={styles.genomeCard}>
            <div className={styles.genomeTopline}>
              <span>business genome</span>
              <i aria-hidden />
            </div>
            <div className={styles.genomeMark} aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <h3>the living source<br />behind the business.</h3>
            <p>offers · customers · knowledge · rules · voice · approvals</p>
          </div>

          <div className={styles.surfaceGrid}>
            {surfaces.map((surface) => (
              <article key={surface.number} className={styles.surfaceCard}>
                <span className={styles.cardNumber}>{surface.number}</span>
                <div>
                  <h3>{surface.title}</h3>
                  <p>{surface.body}</p>
                </div>
                <small>{surface.detail}</small>
              </article>
            ))}
          </div>
          </div>
        </div>
      </section>

      <section className={styles.approvalSection} aria-labelledby="approval-heading">
        <div className={styles.approvalCopy}>
          <p className={styles.kicker}><span aria-hidden /> intelligence with manners</p>
          <h2 id="approval-heading">it does the work.<br /><em>you keep the say.</em></h2>
          <p>
            Every important action arrives with the source, the reasoning and a clear decision.
            Nothing sends, spends or changes a record until a person approves it.
          </p>
          <Link href="/build-an-agent" className={styles.textAction}>see how an agent is built</Link>
        </div>

        <div className={styles.approvalPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span>your approvals</span>
              <strong>three things need your eyes</strong>
            </div>
            <span className={styles.panelCount}>03</span>
          </div>
          <div className={styles.approvalList}>
            {approvals.map((approval, index) => (
              <article key={approval.label}>
                <span className={styles.approvalIndex}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{approval.label}</strong>
                  <p>{approval.detail}</p>
                </div>
                <time>{approval.time}</time>
                <button type="button" aria-label={`Review ${approval.label}`}>review →</button>
              </article>
            ))}
          </div>
          <div className={styles.panelFooter}>
            <span><i aria-hidden /> nothing has been sent</span>
            <span>activity record · live</span>
          </div>
        </div>
      </section>

      <section id="concepts" className={styles.conceptSection} aria-labelledby="concept-heading">
        <div className={styles.conceptHeader}>
          <div>
            <p className={styles.kicker}><span aria-hidden /> assembl concept studio</p>
            <h2 id="concept-heading">see what becomes possible.</h2>
          </div>
          <p>Independent concept work exploring the next customer experience for ambitious New Zealand organisations.</p>
        </div>

        <div className={styles.conceptGrid}>
          {concepts.map((concept, index) => (
            <a key={concept.id} href={concept.href} className={styles.conceptCard} target="_blank" rel="noreferrer noopener">
              <div className={styles.conceptArt} aria-hidden>
                <span className={concept.shape} />
                <small>{String(index + 1).padStart(2, '0')} / 03</small>
              </div>
              <div className={styles.conceptCopy}>
                <p>{concept.eyebrow}</p>
                <h3>{concept.title}</h3>
                <span>{concept.body}</span>
                <strong>enter concept <i aria-hidden>↗</i></strong>
              </div>
            </a>
          ))}
        </div>
        <p className={styles.disclaimer}>Independent speculative concepts by assembl · not commissioned or endorsed by the organisations named.</p>
      </section>

      <section className={styles.finalSection}>
        <p className={styles.kicker}><span aria-hidden /> start with what is stealing your week</p>
        <h2>describe your business.<br /><em>watch it assemble.</em></h2>
        <p>One useful agent first. One real piece of work done. Then build from proof.</p>
        <div className={styles.finalActions}>
          <Link href="/build-an-agent" className={styles.primaryAction}>assemble my business <span aria-hidden>→</span></Link>
          <a href="mailto:assembl@assembl.co.nz" className={styles.textAction}>talk to Kate</a>
        </div>
        <footer className={styles.footer}>
          <Link href="/" className={styles.wordmark}>assembl</Link>
          <span>Aotearoa New Zealand · 2026</span>
          <a href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz</a>
        </footer>
      </section>
    </main>
  );
}
