'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
import { PursuitCanvasHero } from './PursuitCanvasHero';
import { LivePursuitCanvas } from './LivePursuitCanvas';
import '../assembl-the-work/assembl-the-work.css';
import './pursuit-depth.css';
import styles from './pursuit.module.css';

const flow = [
  { name:'Evidence',title:'Start with what is published.',body:'Research a company or sector. Keep source links, dates and unanswered questions with the opportunity.' },
  { name:'Proposal',title:'Develop one useful opening.',body:'Turn the research into a proposed piece of work. Review the evidence before treating an idea as a business fact.' },
  { name:'Pitch',title:'Give the proposal a form.',body:'Export a branded pitch and source brief. Continue agreed client work inside the existing private hubs.' },
];
export function PursuitLanding() {
  const [paused,setPaused]=useState(false);
  const hub=PRODUCT_DESTINATIONS.pursuit.workspace;
  return <div className={`atw pursuit-dimensional ${styles.page}`} data-paused={paused||undefined}>
    <a href="#try-pursuit" className="atw-skip">Skip to live research</a>
    <section className={styles.hero} aria-labelledby="pursuit-title"><div className={styles.ambient} aria-hidden="true" /><header className={styles.header}><Link href="/" className={styles.wordmark}>assembl</Link><nav aria-label="Primary"><Link href="/pursuit" aria-current="page">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link></nav></header>
      <div className={styles.heroGrid}><div className={styles.heroCopy}><p className={styles.eyebrow}>Pursuit / find it.</p><h1 id="pursuit-title">Find the opening.<br /><span>Make it worth a conversation.</span></h1><p className={styles.lead}>Research a New Zealand company or sector. Develop a source-backed opportunity and turn it into a pitch people can review.</p><a className={styles.primary} href="#try-pursuit">Try the research canvas <ArrowRight size={19} /></a><a className={styles.quietLink} href={hub} target="_blank" rel="noopener noreferrer">Open private client hubs <ArrowUpRight size={16} /></a><p className={styles.honesty}>The research trial checks its availability below. Private client work remains in the existing authenticated Pursuit hubs.</p></div>
      <div id="pursuit-canvas" className={styles.example} aria-label="Illustrative Pursuit canvas"><div className={styles.exampleTop}><span>Concept / from evidence to proposal</span><button type="button" onClick={()=>setPaused(v=>!v)} aria-label={paused?'Resume visual motion':'Pause visual motion'}>{paused?<Play size={15}/>:<Pause size={15}/>}</button></div><PursuitCanvasHero paused={paused}/></div></div>
      <div className={styles.heroFoot}><span>public evidence → proposed pursuit → reviewed pitch</span><a href="/tools/agents">For agents and developers</a></div>
    </section>
    <LivePursuitCanvas />
    <section className={styles.process} aria-labelledby="process-title"><div><p className={styles.eyebrow}>the work behind the pitch</p><h2 id="process-title">Evidence first.<br />A specific next move.</h2><p className={styles.sectionLead}>A useful pursuit needs more than a company name and a sales message. It needs a reason, a proposal and a way to test the idea.</p></div><ol>{flow.map((item,index)=><li key={item.name}><span>0{index+1}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></li>)}</ol></section>
    <section className={styles.connected} aria-labelledby="connected-title"><div className={styles.connectedIntro}><p className={styles.eyebrow}>Pursuit / DO / Studio</p><h2 id="connected-title">Keep the work<br />connected.</h2><p>Use Pursuit to find the opening. Use DO to prepare the work. Use Studio to build the experience.</p></div><div className={styles.productLinks}><a href={hub} target="_blank" rel="noopener noreferrer"><span>01 / Pursuit client hubs</span><h3>Keep the opportunity in view.</h3><p>Existing private client workspaces. Sign-in required.</p><ArrowUpRight /></a><Link href="/do"><span>02 / DO</span><h3>Prepare the next piece of work.</h3><p>Context, tools and approvals around a bounded job.</p><ArrowUpRight /></Link><Link href="/creative-studio"><span>03 / Studio</span><h3>Give the idea something to show.</h3><p>Demonstrations, sites, film, campaigns and experiences.</p><ArrowUpRight /></Link></div></section>
    <section className={styles.offer} aria-labelledby="offer-title"><div><p className={styles.eyebrow}>work with assembl</p><h2 id="offer-title">One opportunity.<br />A focused sprint.</h2><p>Research the opportunity, develop the demonstrator and prepare the next client conversation.</p><Link className={styles.primaryDark} href="/contact?product=pursuit">Discuss your project <ArrowUpRight size={19}/></Link></div><div className={styles.deliverables}><p className={styles.eyebrow}>agree the scope</p><ul><li>Source-backed opportunity brief</li><li>A proposed customer or staff task</li><li>Client-specific demonstrator</li><li>Practical next-step plan</li></ul><a href={hub} target="_blank" rel="noopener noreferrer">Open your existing client hubs <ArrowRight size={17}/></a></div></section>
    <footer className={styles.footer}><Link className={styles.wordmark} href="/">assembl</Link><p>Find it. DO it. Show it.<br/>Aotearoa New Zealand.</p><nav aria-label="Footer"><Link href="/">Home</Link><a href={hub} target="_blank" rel="noopener noreferrer">Pursuit hubs</a><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link><Link href="/tools/agents">Agent tools</Link><Link href="/contact">Contact</Link><Link href="/legal/privacy">Privacy</Link></nav></footer>
  </div>;
}
