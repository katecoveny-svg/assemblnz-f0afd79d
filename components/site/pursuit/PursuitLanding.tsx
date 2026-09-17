'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowRight,ArrowUpRight,Pause,Play} from 'lucide-react';
import {GlowDoWidget} from '../assembl-the-work/GlowDoWidget';
import {ProductDoors} from '../assembl-the-work/ImmersiveExperience';
import {ResearchCanvas} from '../assembl-the-work/ResearchCanvas';
import {PRODUCT_DESTINATIONS} from '@/lib/product-destinations';
import {PursuitCanvasHero} from './PursuitCanvasHero';
import '../assembl-the-work/assembl-the-work.css';
import './pursuit-craft.css';
import styles from './pursuit.module.css';
const flow=[
 {name:'Research',title:'Start with the sources.',body:'Research the company or sector. Keep the source links and distinguish what is known from what still needs checking.'},
 {name:'Proposal',title:'Choose an opening to test.',body:'Prepare one specific proposal, the work it would require and the questions to take into a conversation.'},
 {name:'Pitch',title:'Make the proposal tangible.',body:'Export the source-linked brief as an Assembl-branded draft deck. Use Studio to develop the demonstrator or campaign.'}
] as const;
export function PursuitLanding(){
 const [paused,setPaused]=useState(false);const hub=PRODUCT_DESTINATIONS.pursuit.workspace;const studio=PRODUCT_DESTINATIONS.studio.overview;
 return <div className={`atw ${styles.page} pursuit-craft`} data-paused={paused||undefined}>
  <a href="#try-pursuit" className="atw-skip">Skip to research</a>
  <section className={styles.hero} aria-labelledby="pursuit-title">
   <div className={styles.ambient} aria-hidden="true"/>
   <header className={styles.header}><Link href="/" className={styles.wordmark}>assembl</Link><nav aria-label="Primary"><Link href="/pursuit" aria-current="page">Pursuit</Link><Link href="/do">DO</Link><Link href={studio}>Studio</Link></nav><GlowDoWidget/></header>
   <div className={styles.heroGrid}><div className={styles.heroCopy}><p className={styles.eyebrow}>Pursuit / find it.</p><h1 id="pursuit-title">Find the opening.<br/><span>Build the pitch.</span></h1><p className={styles.lead}>Research a company, inspect the evidence and prepare a proposal worth discussing. Keep the source links with the work.</p><a className={styles.primary} href="#try-pursuit">Try the research canvas<ArrowRight size={19} aria-hidden="true"/></a><a className={styles.quietLink} href={hub} target="_blank" rel="noopener noreferrer">Open existing client hubs<ArrowUpRight size={16} aria-hidden="true"/></a><p className={styles.honesty}>Public research and private client work are separate. Client hubs require sign-in.</p></div>
    <div id="pursuit-canvas" className={styles.example} aria-label="Illustrative Pursuit canvas"><div className={styles.exampleTop}><span>A visual example / not a research run</span><button type="button" onClick={()=>setPaused(v=>!v)} aria-label={paused?'Resume visual motion':'Pause visual motion'}>{paused?<Play size={15}/>:<Pause size={15}/>}</button></div><PursuitCanvasHero paused={paused}/></div>
   </div>
   <div className={styles.heroFoot}><span>source evidence → proposed opportunity → draft pitch</span><a href="#try-pursuit">Use the research tool below ↓</a></div>
  </section>
  <ResearchCanvas/>
  <section className={styles.process} aria-labelledby="process-title"><div><p className={styles.eyebrow}>From research to a proposal</p><h2 id="process-title">Make the next<br/>conversation count.</h2><p className={styles.sectionLead}>A useful pursuit says what the evidence shows, what you propose and what needs a person to decide.</p></div><ol>{flow.map((item,index)=><li key={item.name}><span>0{index+1}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></li>)}</ol></section>
  <ProductDoors/>
  <section className={styles.offer} aria-labelledby="offer-title"><div><p className={styles.eyebrow}>Work with assembl</p><h2 id="offer-title">One opportunity.<br/>A focused project.</h2><p>Research the opportunity, build the demonstrator and prepare the next client conversation.</p><Link className={styles.primaryDark} href="/contact?product=pursuit">Discuss your project<ArrowUpRight size={19} aria-hidden="true"/></Link></div><div className={styles.deliverables}><p className={styles.eyebrow}>What we agree together</p><ul><li>Source-linked opportunity brief</li><li>A proposal to validate</li><li>A demonstrator to review</li><li>A practical next-step plan</li></ul><p>Private client hubs remain the existing workspaces. This public trial does not change or publish client work.</p><a href={hub} target="_blank" rel="noopener noreferrer">Open your client hubs<ArrowRight size={17} aria-hidden="true"/></a></div></section>
  <footer className={styles.footer}><Link className={styles.wordmark} href="/">assembl</Link><p>find it. DO it. show it.</p><nav aria-label="Footer"><Link href="/">Home</Link><Link href="/do">DO</Link><Link href={studio}>Studio</Link><Link href="/tools/agents">For agents</Link><Link href="/contact">Contact</Link></nav></footer>
 </div>;
}
