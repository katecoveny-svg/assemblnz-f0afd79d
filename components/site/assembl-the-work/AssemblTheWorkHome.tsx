'use client';

import Link from 'next/link';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import { AssemblWorldHero } from './AssemblWorldHero';
import { DoFilm } from '@/components/do/DoFilm';
import { LivingBrief, ProductDoors } from './ImmersiveExperience';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
import { HERO } from './copy';
import './assembl-the-work.css';
import './assembl-spatial.css';
import './immersive-home.css';

/** One front door. The atelier, the work, then the three real product paths. */
export function AssemblTheWorkHome({ preview = false }: { preview?: boolean }) {
  return (
    <div className="atw atw-spatial atw-immersive" data-preview={preview}>
      <a className="atw-skip" href="#products">Skip to products</a>
      {preview && <div className="atw-preview-ribbon"><strong>PREVIEW</strong><span>Homepage review</span><Link href="/">Live homepage <ArrowUpRight size={14} /></Link></div>}
      <AssemblWorldHero preview={preview} />
      <section className="atw-product-strip" aria-label="Three products, one system">
        <Link href="/pursuit"><strong>Pursuit</strong><span>find it.</span></Link>
        <Link href="/do"><strong>DO</strong><span>DO it.</span></Link>
        <Link href="/creative-studio"><strong>Studio</strong><span>show it.</span></Link>
        <p>{HERO.loopLine}</p>
      </section>
      <LivingBrief />
      <ProductDoors />
      <section className="immersive-statement" aria-labelledby="statement-title">
        <p>less starting over. more moving forward.</p>
        <h2 id="statement-title">The idea is only<br />the <span>beginning.</span></h2>
        <div><p>Find the opening. Prepare the work. Give the possibility a form someone can see, change and try.</p><Link href="/creative-studio">See what Studio can do <ArrowUpRight size={19} aria-hidden="true" /></Link></div>
      </section>
      <DoFilm />
      <section className="immersive-close" id="choose" aria-labelledby="choose-title">
        <div><p className="atw-kicker">start with the work in front of you.</p><h2 id="choose-title">What could we<br /><span>assembl together?</span></h2><p>Bring an opportunity, a repetitive job or an idea that needs to be seen. Start with one product, or connect the whole system.</p><Link className="atw-pill atw-pill-dark" href="/contact?product=system">Bring us the work <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        <aside aria-label="Existing workspaces"><p>Already working with assembl?</p><a href={PRODUCT_DESTINATIONS.pursuit.workspace} target="_blank" rel="noopener noreferrer"><span><small>Pursuit</small>Open client hubs</span><ArrowUpRight size={20} aria-hidden="true" /></a><a href={PRODUCT_DESTINATIONS.studio.workspace} target="_blank" rel="noopener noreferrer"><span><small>Studio</small>Open Creative Studio</span><ArrowUpRight size={20} aria-hidden="true" /></a><small><LockKeyhole size={12} aria-hidden="true" />Your existing private workspaces. Sign-in required.</small></aside>
      </section>
      <footer className="atw-footer">
        <Link className="atw-wordmark" href="/">assembl</Link><p>Find it. DO it. Show it.<br />Built in New Zealand.</p>
        <nav aria-label="Footer"><Link href="/pursuit">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/legal/privacy">Privacy</Link></nav>
        <span>Good work comes together.</span>
      </footer>
    </div>
  );
}
