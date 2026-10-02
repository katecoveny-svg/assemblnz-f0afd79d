'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { PursuitRecordedRun } from '../pursuit/PursuitRecordedRun';
const AssemblWorldHero = dynamic(() => import('./AssemblWorldHero').then(module => module.AssemblWorldHero));
import { DoFilm } from '@/components/do/DoFilm';
import { LivingBrief } from './ImmersiveExperience';
const LivePursuitCanvas = dynamic(() => import('../pursuit/LivePursuitCanvas').then(module => module.LivePursuitCanvas));
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
import { PRODUCTS } from './copy';
import { FluidField } from '../craft/FluidField';
import { HomeLiveData } from '../HomeLiveData';
import '../craft/fluid-type.css';
import './assembl-the-work.css';
import './assembl-spatial.css';
import './immersive-home.css';
import './refined-home.css';
import './public-nz-home.css';

export function AssemblTheWorkHome({ preview = false }: { preview?: boolean }) {
  const [researchOpen, setResearchOpen] = useState(false);
  const [filmOpen, setFilmOpen] = useState(false);
  const [atelierOpen, setAtelierOpen] = useState(false);
  return <div className="atw atw-spatial atw-immersive atw-refined" data-preview={preview}>
    <a className="atw-skip" href="#products">Skip to the products</a>
    {preview && <div className="atw-preview-ribbon"><strong>PREVIEW</strong><span>Homepage review</span><Link href="/">Live homepage <ArrowUpRight size={14} /></Link></div>}
    <AssemblWorldHero preview={preview} />
    <section id="products" className="refined-products" aria-labelledby="products-title">
      <header><p className="atw-kicker">A PLACE FOR THE WORK.</p><h2 id="products-title">From a loose end<br />to a useful next step.</h2><p>Everyday jobs with DO. Business opportunities with Pursuit. Ideas made tangible in Studio.</p></header>
      <div className="refined-product-grid">{PRODUCTS.items.map((product, index) => <Link href={product.href} key={product.id} className="refined-product" data-product={product.id}>
        <div className="refined-product-art" aria-hidden="true"><span className="refined-shape" /><span className="refined-shape" /><span className="refined-shape" /><small>0{index + 1}</small><strong>{product.verb.split(' · ')[1]}</strong></div>
        <div className="refined-product-copy"><h3>{product.name}<ArrowUpRight size={22} /></h3><p>{product.body}</p><span>{product.id === 'do' ? 'Open DO' : `Explore ${product.name}`} <ArrowUpRight size={16} /></span></div>
      </Link>)}</div>
    </section>
    <PursuitRecordedRun />
    <details className="refined-atelier" open={atelierOpen} onToggle={event => setAtelierOpen(event.currentTarget.open)}><summary>See the work take shape <Plus size={20} /></summary>{atelierOpen && <LivingBrief />}</details>
    <section className="refined-explore" aria-label="Explore the products in more detail">
      <details open={researchOpen} onToggle={event => setResearchOpen(event.currentTarget.open)}><summary><span>Try Pursuit research<small>Bring a company or a question</small></span><Plus size={22} /></summary>{researchOpen && <LivePursuitCanvas />}</details>
      <details open={filmOpen} onToggle={event => setFilmOpen(event.currentTarget.open)}><summary><span>See DO in motion<small>A closer look at the experience</small></span><Plus size={22} /></summary>{filmOpen && <DoFilm />}</details>
    </section>
    <HomeLiveData variant="refined" />
    <section className="immersive-close refined-close" id="choose" aria-labelledby="choose-title"><FluidField /><div><p className="atw-kicker">LESS ADMIN. MORE MAHI.</p><h2 id="choose-title">What needs<br /><span className="fluid-text">doing?</span></h2><p>Bring an opportunity, a repetitive job or an idea that needs to be seen. We’ll help you turn it into useful work.</p><Link className="atw-pill atw-pill-dark" href="/contact?product=system">Bring us the work <ArrowUpRight size={18} /></Link></div></section>
    <footer className="atw-footer"><Link className="atw-wordmark" href="/">assembl</Link><p>Find it. DO it. Show it.<br />Built in New Zealand.</p><nav aria-label="Footer"><Link href="/pursuit">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/legal/privacy">Privacy</Link></nav><details className="refined-workspaces"><summary>Existing workspaces</summary><a href={PRODUCT_DESTINATIONS.pursuit.workspace} target="_blank" rel="noopener noreferrer">Pursuit hubs ↗</a><a href={PRODUCT_DESTINATIONS.studio.workspace} target="_blank" rel="noopener noreferrer">Creative Studio ↗</a><small>Private workspaces · sign-in required</small></details></footer>
  </div>;
}
