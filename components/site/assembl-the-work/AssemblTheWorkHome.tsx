'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Play, X } from 'lucide-react';
import { OceanMedia } from './OceanMedia';
import { GlowDoWidget } from './GlowDoWidget';
import { DoIntentInput } from './DoIntentInput';
import { DoProductStory } from './DoProductStory';
import { CustomerJourneys } from './CustomerJourneys';
import { PRODUCTS, HERO, FOOTER } from './copy';
import './assembl-the-work.css';
export function AssemblTheWorkHome({ preview = false }: { preview?: boolean }) {
  const filmDialog = useRef<HTMLDialogElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const [cinema, setCinema] = useState(false);
  function openFilm() { setCinema(true); filmDialog.current?.showModal(); void film.current?.play().catch(() => {}); }
  return <div className="atw" data-preview={preview}>
    <GlowDoWidget />
    <a className="atw-skip" href="#products">Skip to products</a>
    {preview && <div className="atw-preview-ribbon"><strong>PREVIEW</strong><span>Homepage review</span><Link href="/">Live homepage <ArrowUpRight size={14} /></Link></div>}
    <section className="atw-hero" aria-labelledby="atw-hero-title">
      <OceanMedia paused={cinema} /><div className="atw-hero-shade" aria-hidden="true" />
      <header className="atw-nav"><Link className="atw-wordmark" href="/" aria-label="assembl home">assembl</Link><nav aria-label="Primary"><Link href="/pursuit">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link></nav></header>
      <div className="atw-hero-copy"><h1 id="atw-hero-title" aria-label={HERO.headline}>assembl<br />the work.</h1><p className="atw-hero-sub">{HERO.subhead}</p><p className="atw-hero-body">Find the opportunity. Prepare the work. Make it tangible.</p><div className="atw-hero-actions"><a className="atw-pill" href="#do-input" onClick={() => document.getElementById('atw-do-intent')?.focus()}>Give DO a job <ArrowRight size={21} /></a><button className="atw-pill" onClick={openFilm}><span className="atw-play"><Play size={14} fill="currentColor" /></span>Watch the film</button></div></div>
      <div className="atw-hero-job" id="do-input"><DoIntentInput compact /></div>
    </section>
    <section className="atw-product-strip" aria-label="Three products, one system"><Link href="/pursuit"><strong>Pursuit</strong><span>— <em>find it.</em></span></Link><Link href="/do"><strong>DO</strong><span>— <em>do it.</em></span></Link><Link href="/creative-studio"><strong>Studio</strong><span>— <em>show it.</em></span></Link><p>Available separately.<br />Stronger together.</p></section>
    <section className="atw-intro atw-section" id="products"><p className="atw-kicker">THREE PRODUCTS. ONE SHARED DIRECTION.</p><h2>Good work<br />comes <em>together.</em></h2><div><p>Start with an opening. Give the work a shape. Make something people can see, try and use.</p><p>Pursuit, DO and Studio are available as standalone engagements or as one connected system, scoped around the work you need done.</p><a className="atw-text-link" href="#choose">Find your starting point <ArrowDown size={18} /></a></div></section>
    <section className="atw-product-list atw-section" aria-label="Explore the products">{PRODUCTS.items.map((product, index) => <article className="atw-product-row" id={product.id} key={product.id}><span className="atw-product-number">0{index + 1}</span><div className="atw-product-name"><p>{product.verb.split('·')[1]?.trim()}</p><h2>{product.name}</h2></div><div className="atw-product-description"><p>{product.body}</p><Link className="atw-text-link" href={product.href}>{product.explore}<ArrowUpRight size={20} /></Link><small>{product.note}</small></div></article>)}</section>
    <DoProductStory />
    <CustomerJourneys compact />
    <section className="atw-how atw-section" id="how-it-works"><div><p className="atw-kicker">THE WORK MOVES. YOU STAY IN CONTROL.</p><h2>Prepare it.<br />Review it.<br /><em>Take it forward.</em></h2></div><ol><li><span>01</span><div><h3>Bring what matters.</h3><p>Your goal, your context and the sources you choose to use. Start with one real piece of work.</p></div></li><li><span>02</span><div><h3>See what comes together.</h3><p>Get an editable draft, a response plan or a creative direction. Keep the evidence and open questions close.</p></div></li><li><span>03</span><div><h3>Choose the next step.</h3><p>A person reviews the result. Sending, publishing and connecting another system each need an agreed permission.</p></div></li></ol></section>
    <section className="atw-choose atw-section" id="choose"><p className="atw-kicker">START WHERE THE WORK IS.</p><h2>One product.<br />Or the <em>whole system.</em></h2><p>Choose a focused engagement with Pursuit, DO or Studio. Or bring them together around a customer journey, a team or a business.</p><div><Link className="atw-pill atw-pill-dark" href="/contact?product=single">Discuss one product <ArrowUpRight size={19} /></Link><Link className="atw-text-link" href="/contact?product=system">Plan the complete system <ArrowUpRight size={19} /></Link></div><small>Scope, price, connections and delivery are agreed with you before work begins.</small></section>
    <footer className="atw-footer"><Link className="atw-wordmark" href="/">assembl</Link><p>{FOOTER.tagline}<br />{FOOTER.place}</p><nav aria-label="Footer"><Link href="/pursuit">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link><Link href="/contact">Contact</Link><Link href="/legal/privacy">Privacy</Link></nav><span>Original generated nature studies.</span></footer>
    <dialog ref={filmDialog} className="atw-film-dialog" aria-label="assembl nature film" onClose={() => { setCinema(false); film.current?.pause(); }}><button className="atw-film-close" aria-label="Close film" onClick={() => filmDialog.current?.close()}><X size={22} /></button><video ref={film} controls playsInline preload="none" poster="/cinematic-nature/ocean-assembly.webp" aria-label="Fish schools and gannets assembling over the ocean"><source src="/cinematic-nature/ocean-assembly.mp4" type="video/mp4" /></video><p>A generated nature study. Thousands of fish sweep into a shared current as gannets move in formation above the coast.</p></dialog>
  </div>;
}
