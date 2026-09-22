'use client';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
import { PursuitCanvasHero } from './PursuitCanvasHero';
import { WebsiteOutreach } from './WebsiteOutreach';
import { LivePursuitCanvas } from './LivePursuitCanvas';
import '../assembl-the-work/assembl-the-work.css';
import styles from './pursuit.module.css';
import { FluidField } from '../craft/FluidField';

export function PursuitLanding() {
  const hub=PRODUCT_DESTINATIONS.pursuit.workspace;
  return <div className={`atw ${styles.page}`}>
    <a href="#website-outreach" className="atw-skip">Skip to website outreach</a>
    <section className={styles.hero} aria-labelledby="pursuit-title"><div className={styles.ambient} aria-hidden="true" /><header className={styles.header}><Link href="/" className={styles.wordmark}>assembl</Link><nav aria-label="Primary"><Link href="/pursuit" aria-current="page">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio" >Studio</Link></nav></header>
      <div className={styles.heroGrid}><div className={styles.heroCopy}><p className={styles.eyebrow}>Pursuit / find it.</p><h1 id="pursuit-title">Find businesses<br /><span>you can help.</span></h1><p className={styles.lead}>Pursuit finds businesses that could use what you do, checks the public evidence and drafts a first message. You decide what happens next.</p><a className={styles.primary} href="#website-outreach">Try it with your website <ArrowRight size={19} /></a><a className={styles.quietLink} href={hub} target="_blank" rel="noopener noreferrer">Open private client hubs <ArrowUpRight size={16} /></a><p className={styles.honesty}>A free public research trial. Review the sources and draft before you contact anyone.</p></div>
      <div id="pursuit-canvas" className={styles.example} aria-label="Illustrative Pursuit example"><PursuitCanvasHero /></div></div>
      <div className={styles.heroFoot}><span>Find the evidence. Check the fit. Write the introduction.</span><Link href="/tools/agents">For agents and developers</Link></div>
    </section>
    <WebsiteOutreach />
    <LivePursuitCanvas />
    <section className={styles.connected} aria-labelledby="connected-title"><FluidField /><div className={styles.connectedIntro}><p className={styles.eyebrow}>Pursuit / DO / Studio</p><h2 id="connected-title">Found a reason<br />to get in touch?</h2><p>Keep the research, prepare the task or make something you can show.</p></div><div className={styles.productLinks}><a href={hub} target="_blank" rel="noopener noreferrer"><span>01 / Pursuit client hubs</span><h3>Continue your client work.</h3><p>Open your client workspace. Sign-in required.</p><ArrowUpRight /></a><Link href="/do"><span>02 / DO</span><h3>Put DO on the task.</h3><p>Give DO a specific job and review the proposed action.</p><ArrowUpRight /></Link><Link href="/creative-studio"><span>03 / Studio</span><h3>Make the first version.</h3><p>Build a demo, site, film or campaign in Studio.</p><ArrowUpRight /></Link></div></section>
    <section className={styles.offer} aria-labelledby="offer-title"><div><p className={styles.eyebrow}>work with assembl</p><h2 id="offer-title">Have a project<br />in mind?</h2><p>We can help research it, build a demo and prepare the first client conversation.</p><Link className={styles.primaryDark} href="/contact?product=pursuit">Discuss your project <ArrowUpRight size={19}/></Link></div><div className={styles.deliverables}><p className={styles.eyebrow}>agree the scope</p><ul><li>Research brief with sources</li><li>A clearly defined task</li><li>A working demo</li><li>A plan for trying it</li></ul><a href={hub} target="_blank" rel="noopener noreferrer">Open your existing client hubs <ArrowRight size={17}/></a></div></section>
    <footer className={styles.footer}><Link className={styles.wordmark} href="/">assembl</Link><p>Find it. DO it. Show it.<br/>Aotearoa New Zealand.</p><nav aria-label="Footer"><Link href="/">Home</Link><a href={hub} target="_blank" rel="noopener noreferrer">Pursuit hubs</a><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link><Link href="/tools/agents">Agent tools</Link><Link href="/contact">Contact</Link><Link href="/legal/privacy">Privacy</Link></nav></footer>
  </div>;
}
