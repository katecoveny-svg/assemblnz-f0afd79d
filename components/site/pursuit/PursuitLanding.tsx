'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, FileText, Pause, Play } from 'lucide-react';
import { GlowDoWidget } from '../assembl-the-work/GlowDoWidget';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
import { makerHref } from '@/lib/studio/task-do-maker';
import '../assembl-the-work/assembl-the-work.css';
import styles from './pursuit.module.css';

const stages = [
  { name: 'Research', label: '01 / Find the signal', title: 'A reason to look closer.', detail: 'A service team is growing. More enquiries mean more preparation before each quote.', note: 'Illustrative signal — not a live company finding', result: 'What changed? What needs checking?' },
  { name: 'Opportunity', label: '02 / Shape the opportunity', title: 'Make the waiting useful.', detail: 'While the team prepares a quote, help the customer organise the details needed for the next call.', note: 'Proposed concept — desirability still to be tested', result: 'A specific customer moment. A useful task.' },
  { name: 'Brief', label: '03 / Prepare the conversation', title: 'A better-prepared quote call.', detail: 'Test a short preparation flow: collect the customer’s questions, let them review the summary, then hand it to the service team.', note: 'Editable example — nothing is sent or saved', result: 'A brief you can question, edit and build on.' },
];
const steps = [
  ['Bring the context.', 'Start with the business, the customer and the question. Add the sources and material you want the work grounded in.'],
  ['Develop the opportunity.', 'Look for a specific customer problem. Keep evidence, assumptions and open questions visible as the idea takes shape.'],
  ['Prepare something useful.', 'Bring the brief, concept and next-step plan into the client workspace. Review before sharing or moving into production.'],
];
export function PursuitLanding() {
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [brief, setBrief] = useState(stages[2].detail);
  const active = stages[stage];
  const workspace = PRODUCT_DESTINATIONS.pursuit.workspace;
  const taskDoMaker = makerHref({
    opportunity: 'Service quote preparation',
    partner: '',
    task: 'research-brief',
    template: 'research-brief',
  });
  return <div className={`atw ${styles.page}`} data-paused={paused}>
    <a href="#pursuit-example" className="atw-skip">Skip to the example</a>
    <section className={styles.hero} aria-labelledby="pursuit-title">
      <div className={styles.ambient} aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>assembl</Link>
        <nav aria-label="Primary"><Link href="/pursuit" aria-current="page">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link></nav>
        <GlowDoWidget />
      </header>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Pursuit / find it.</p>
          <h1 id="pursuit-title">Find the opening.<br/><span>Build the possibility.</span></h1>
          <p className={styles.lead}>Research the opportunity. Shape a credible idea. Prepare the next conversation.</p>
          <a className={styles.primary} href={workspace}>Open your Pursuit hub <ArrowUpRight size={19}/></a>
          <Link className={styles.quietLink} href="/pursuit/playground">Try the public Pursuit playground <ArrowRight size={16}/></Link>
          <Link className={styles.quietLink} href={taskDoMaker}>Mint a task DO in Studio <ArrowRight size={16}/></Link>
          <a className={styles.quietLink} href="#pursuit-example">See how the work takes shape <ArrowDown size={16}/></a>
        </div>
        <div id="pursuit-example" className={styles.example} aria-label="Illustrative Pursuit example">
          <div className={styles.exampleTop}><span>Explore an example</span><button onClick={()=>setPaused(!paused)} aria-label={paused?'Resume visual motion':'Pause visual motion'}>{paused?<Play size={15}/>:<Pause size={15}/>}</button></div>
          <div className={styles.paperStack}>
            <div className={styles.backSheet} aria-hidden="true"><span>Context</span><i/><i/><i/></div>
            <div className={styles.middleSheet} aria-hidden="true"><span>Evidence</span><i/><i/><i/></div>
            <article className={styles.resultSheet} aria-labelledby="example-title">
              <div className={styles.paperHeader}><FileText size={21}/><span>Pursuit / working notes</span><span>0{stage+1}</span></div>
              <p className={styles.paperLabel}>{active.label}</p>
              <h2 id="example-title">{active.title}</h2>
              {stage===2 ? <><label className={styles.editLabel} htmlFor="pursuit-brief">Edit this example brief</label><textarea id="pursuit-brief" value={brief} onChange={event=>setBrief(event.target.value)} maxLength={1500} rows={6}/></> : <p className={styles.paperBody}>{active.detail}</p>}
              <div className={styles.paperFoot}><Check size={16}/><span>{active.result}</span></div>
            </article>
          </div>
          <div className={styles.stageNav} role="group" aria-label="Example stages">{stages.map((item,index)=><button key={item.name} aria-pressed={stage===index} onClick={()=>setStage(index)}><span>0{index+1}</span>{item.name}</button>)}</div>
          <p className={styles.exampleNote} role="status">{active.note}</p>
        </div>
      </div>
      <div className={styles.heroFoot}><span>Research → opportunity → useful next step</span><span>Your sources. Your judgement.</span></div>
    </section>
    <section className={styles.process} aria-labelledby="process-title">
      <div><p className={styles.eyebrow}>A clear path through the work</p><h2 id="process-title">Something worth<br/>taking forward.</h2><p className={styles.sectionLead}>Bring the evidence and the idea together, so the next conversation starts with something concrete.</p></div>
      <ol>{steps.map(([title,body],index)=><li key={title}><span>0{index+1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
    </section>
    <section className={styles.connected} aria-labelledby="connected-title">
      <div className={styles.connectedIntro}><p className={styles.eyebrow}>Find. DO. Show.</p><h2 id="connected-title">Give the idea<br/>somewhere to go.</h2><p>Start with Pursuit. Bring in DO for preparation and Studio when you’re ready to make the idea tangible.</p></div>
      <div className={styles.productLinks}>
        <a href={workspace}><span>01 / Pursuit</span><h3>Find the opportunity.</h3><p>Research, context and a focused brief.</p><ArrowUpRight aria-hidden="true"/></a>
        <Link href="/do"><span>02 / DO</span><h3>Prepare the work.</h3><p>Specialist help with the context you choose.</p><ArrowUpRight aria-hidden="true"/></Link>
        <Link href="/creative-studio"><span>03 / Studio</span><h3>Make it tangible.</h3><p>A concept, pitch or experience to review.</p><ArrowUpRight aria-hidden="true"/></Link>
      </div>
      <p className={styles.exampleNote} style={{ marginTop: 28 }}>
        Ready to mint a narrow, white-label task agent from an opportunity?{' '}
        <Link href={taskDoMaker}>Open the Task DO Maker</Link>
        {' · '}
        <Link href="/pursuit/playground">Public playground (NZ company lookup)</Link>.
      </p>
    </section>
    <section className={styles.offer} aria-labelledby="offer-title">
      <div><p className={styles.eyebrow}>Work with assembl</p><h2 id="offer-title">A focused<br/>Pursuit sprint.</h2><p>A scoped engagement to research one opportunity, develop a concept and prepare the next conversation.</p><Link className={styles.primaryDark} href="/contact?product=pursuit">Discuss your project <ArrowUpRight size={19}/></Link></div>
      <div className={styles.deliverables}><p className={styles.eyebrow}>What we agree together</p><ul><li>A focused opportunity brief</li><li>A developed concept</li><li>Evidence and questions to validate</li><li>A practical next-step plan</li></ul><p>Hub access and business connections are set up for the agreed engagement. Your workspace requires sign-in.</p><a href={workspace}>Already working with us? Open your hub <ArrowRight size={17}/></a></div>
    </section>
    <footer className={styles.footer}><Link className={styles.wordmark} href="/">assembl</Link><p>Mahi that earns its proof.<br/>Aotearoa New Zealand.</p><nav aria-label="Footer"><Link href="/">Home</Link><a href={workspace}>Your workspace</a><Link href="/contact">Contact</Link><Link href="/legal/privacy">Privacy</Link></nav></footer>
  </div>;
}
