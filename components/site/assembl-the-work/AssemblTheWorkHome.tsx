'use client';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { GlowDoWidget } from './GlowDoWidget';
import { AssemblWorldHero } from './AssemblWorldHero';
import { DoFilm } from '@/components/do/DoFilm';
import { DoSpatialScene } from '@/components/do/DoSpatialScene';
import { PRODUCTS } from './copy';
import './assembl-the-work.css';
import './assembl-spatial.css';

export function AssemblTheWorkHome({ preview = false }: { preview?: boolean }) {
  return <div className="atw atw-spatial" data-preview={preview}>
    <GlowDoWidget />
    <a className="atw-skip" href="#products">Skip to products</a>
    {preview && <div className="atw-preview-ribbon"><strong>PREVIEW</strong><span>Homepage review</span><Link href="/">Live homepage <ArrowUpRight size={14} /></Link></div>}
    <AssemblWorldHero preview={preview} />
    <section className="atw-product-strip" aria-label="Three products, one system"><Link href="/pursuit"><strong>Pursuit</strong><span>— <em>find it.</em></span></Link><Link href="/do"><strong>DO</strong><span>— <em>do it.</em></span></Link><Link href="/creative-studio"><strong>Studio</strong><span>— <em>show it.</em></span></Link><p>Use one.<br />Connect the whole loop.</p></section>
    <section className="atw-companion-story" aria-labelledby="companion-story-title">
      <div className="atw-companion-copy"><p className="atw-kicker">DO / YOUR PORTABLE COMPANION</p><h2 id="companion-story-title">A little DO.<br />A world of help.</h2><p>A reply to write. A week to organise. An idea to build. Give the work its own DO and keep it close.</p>
        <article><span>01 / MAKE IT YOURS</span><h3>Your writing. Your work.</h3><p>Choose a specialist, add the material it needs and shape how it helps. Drag a skill into your DO or tap to choose.</p><Link className="atw-text-link" href="/do#your-dos">Choose your DO <ArrowUpRight size={17} /></Link></article>
        <article><span>02 / KEEP IT CLOSE</span><h3>Beside the thing you’re doing.</h3><p>The glowing companion opens your workspace. Move it where it suits you. Bring selected context through the browser side panel or the Mac development app.</p><Link className="atw-text-link" href="/do#take-do-with-you">Take DO with you <ArrowUpRight size={17} /></Link></article>
        <article><span>03 / SEE WHAT NEEDS YOU</span><h3>A place for your DOs.</h3><p>Open the Office to see work, approvals and receipts. Builder DO prepares your software jobs; connections give your DOs the tools you approve.</p><Link className="atw-text-link" href="/do/office">Step into DO Office <ArrowUpRight size={17} /></Link></article>
      </div><div className="atw-companion-scene"><DoSpatialScene /></div>
    </section>
    <section className="atw-intro atw-section" id="products"><p className="atw-kicker">THREE PRODUCTS. ONE SHARED OPERATING LAYER.</p><h2>the work stays<br />connected.</h2><div><p>Pursuit finds the work worth doing. DO brings the right agents, context and tools to it. Studio makes the result visible enough to test, sell or ship.</p><p>The context, permissions, evidence and learning travel with the work instead of restarting in every app or chat.</p><a className="atw-text-link" href="#choose">Choose where to start <ArrowDown size={18} /></a></div></section>
    <section className="atw-product-list atw-section" aria-label="Explore the products">{PRODUCTS.items.map((product, index) => <article className="atw-product-row" id={product.id} key={product.id}><span className="atw-product-number">0{index + 1}</span><div className="atw-product-name"><p>{product.verb.split('·')[1]?.trim()}</p><h2>{product.name}</h2></div><div className="atw-product-description"><p>{product.body}</p><Link className="atw-text-link" href={product.href}>{product.explore}<ArrowUpRight size={20} /></Link><small>{product.note}</small></div></article>)}</section>
    <section className="atw-system atw-section" aria-labelledby="atw-system-title"><div className="atw-system-copy"><p className="atw-kicker">ONE CONTEXT. MANY MODELS. VISIBLE PROOF.</p><h2 id="atw-system-title">the model can change.<br />the work remembers.</h2><p>DO is the portable execution layer. It can use different models for coding, research, voice, vision or creative work while keeping the same context, tools, permissions and evidence.</p><Link className="atw-text-link" href="/do">Meet DO <ArrowUpRight size={18} /></Link></div><ol className="atw-system-loop"><li><span>01</span><strong>FIND</strong><p>Pursuit brings evidence-backed opportunities into view.</p></li><li><span>02</span><strong>DO</strong><p>Your DOs research, prepare, build and coordinate around the work.</p></li><li><span>03</span><strong>SHOW</strong><p>Studio turns the result into something people can see, try and understand.</p></li><li><span>04</span><strong>LEARN</strong><p>Proof and decisions feed the next job instead of disappearing into a chat.</p></li></ol></section>
    <DoFilm />
    <section className="atw-how atw-section" id="how-it-works"><div><p className="atw-kicker">THE WORK MOVES. YOU STAY IN CONTROL.</p><h2>context in.<br />work out.<br /><em>proof attached.</em></h2></div><ol><li><span>01</span><div><h3>Bring what matters.</h3><p>Your goal, business context and the sources you choose to connect.</p></div></li><li><span>02</span><div><h3>Let the right DO take it.</h3><p>assembl brings the relevant specialist, tools and model to the work.</p></div></li><li><span>03</span><div><h3>Review what happens next.</h3><p>Approvals, evidence and receipts stay visible. Sending, publishing and spending remain permissioned actions.</p></div></li></ol></section>
    <section className="atw-choose atw-section" id="choose"><p className="atw-kicker">START WHERE THE WORK IS.</p><h2>one product.<br />or the <em>whole system.</em></h2><p>Start with Pursuit, DO or Studio. Connect them when you want one operating loop from signal to execution to proof.</p><div><Link className="atw-pill atw-pill-dark" href="/do">Try DO <ArrowUpRight size={19} /></Link><Link className="atw-text-link" href="/contact?product=system">Plan the complete system <ArrowUpRight size={19} /></Link></div><small>Connections, permissions and delivery are agreed before consequential actions are enabled.</small></section>
    <footer className="atw-footer"><Link className="atw-wordmark" href="/">assembl</Link><p>Find it. DO it. Show it.<br />Built in New Zealand.</p><nav aria-label="Footer"><Link href="/pursuit">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link><Link href="/contact">Contact</Link><Link href="/legal/privacy">Privacy</Link></nav><span>One shared context · portable agents · proof that compounds.</span></footer>
  </div>;
}
