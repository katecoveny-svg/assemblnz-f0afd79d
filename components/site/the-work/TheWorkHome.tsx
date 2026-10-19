'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, FileText, Home, Lightbulb, MapPin, Menu, PenLine, RefreshCw, Search, Sparkles, X } from 'lucide-react';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
import { useResearchAvailability } from '@/components/site/pursuit/useResearchAvailability';
import styles from './the-work.module.css';

const LivePursuitCanvas = dynamic(() => import('../pursuit/LivePursuitCanvas').then(module => module.LivePursuitCanvas), { ssr: false });

const NAV = [
  { label: 'Pursuit', href: '/pursuit' },
  { label: 'DO', href: '/do' },
  { label: 'Studio', href: '/creative-studio' },
  { label: 'Industries', href: '/industries' },
  { label: 'About', href: '/about' },
];

const CHAPTERS = [
  { id: 'vision', label: 'Vision' },
  { id: 'pursuit', label: 'Pursuit' },
  { id: 'do', label: 'DO' },
  { id: 'studio', label: 'Studio' },
  { id: 'impact', label: 'Impact' },
];

/** Suggestions only fill the question box. Research still needs the visitor's brief and consent. */
const SUGGESTIONS = [
  ['Find growth opportunities in NZ aged care', 'Build a loyalty concept for a NZ supermarket'],
  ['Map service gaps for regional freight', 'Plan a better first week for new tenants'],
  ['Find quick wins in a council customer journey', 'Shape a pitch for an energy retailer'],
];

const DO_STEPS = [
  { label: 'Research', detail: 'Reading public sources', Icon: Search },
  { label: 'Analyse', detail: 'Finding what matters', Icon: Lightbulb },
  { label: 'Create', detail: 'Drafting your plan', Icon: PenLine },
  { label: 'Deliver', detail: 'Ready for your review', Icon: Check },
];

const CANVAS_STEPS = ['Searching public sources', 'Reading key players', 'Finding opportunities', 'Building the pitch deck'];

const SECTORS = ['Retail', 'Energy', 'Aviation', 'Insurance', 'Aged care', 'Freight', 'Hospitality'];

export function TheWorkHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [suggestionSet, setSuggestionSet] = useState(0);
  const [canvasGoal, setCanvasGoal] = useState<string | null>(null);
  const [chapter, setChapter] = useState('vision');
  const dialog = useRef<HTMLDialogElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const status = useResearchAvailability();

  // The chapter bar follows the reader down the page.
  useEffect(() => {
    const targets = CHAPTERS.map(item => document.getElementById(`chapter-${item.id}`)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setChapter(visible.target.id.replace('chapter-', ''));
    }, { threshold: [0.25, 0.5, 0.75] });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  // Sections assemble once as they arrive.
  useEffect(() => {
    // Hidden-until-revealed only once script is running, so nothing is lost without it.
    root.current?.setAttribute('data-motion', '');
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.setAttribute('data-revealed', ''); observer.unobserve(entry.target); }
    }), { threshold: 0.18 });
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (canvasGoal !== null) dialog.current?.showModal();
    else dialog.current?.close();
  }, [canvasGoal]);

  function openCanvas(goal = '') { setCanvasGoal(goal); }
  function ask(event: FormEvent) { event.preventDefault(); openCanvas(question.trim()); }

  const badge = status === null ? 'Checking' : status.ready ? 'Live' : 'Paused';

  return <div className={styles.page} ref={root}>
    <a className={styles.skip} href="#chapter-pursuit">Skip to the products</a>

    <section className={styles.hero} id="chapter-vision" aria-labelledby="the-work-title">
      <div className={styles.scene} aria-hidden="true">
        <picture>
          <source media="(max-width: 700px)" srcSet="/do/world/franklin-v1/hero-mobile.jpg" />
          <img src="/do/world/franklin-v1/hero-wide.jpg" alt="" />
        </picture>
      </div>
      <div className={styles.grade} aria-hidden="true" />

      <header className={styles.nav}>
        <Link href="/" className={styles.wordmark} aria-label="assembl home">assembl</Link>
        <nav aria-label="Primary" className={styles.links}>{NAV.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
        <div className={styles.navActions}>
          <button type="button" className={styles.navCta} onClick={() => openCanvas()}>Try the canvas <ArrowRight size={16} aria-hidden="true" /></button>
          <button type="button" className={styles.menuButton} aria-expanded={menuOpen} aria-controls="the-work-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
        <nav id="the-work-menu" aria-label="Menu" className={styles.menu} hidden={!menuOpen}>{[...NAV, { label: 'Pricing', href: '/pricing' }, { label: 'Contact', href: '/contact' }].map(item => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ArrowUpRight size={18} aria-hidden="true" /></Link>)}</nav>
      </header>

      <div className={styles.heroCopy}>
        <h1 id="the-work-title"><span className={styles.word} style={{ '--w': 0 } as CSSProperties}>assembl</span><span className={styles.word} style={{ '--w': 1 } as CSSProperties}>the work.</span></h1>
        <p className={styles.verbs}><span>find it.</span> <span>DO it.</span> <span>show it.</span></p>
        <p className={styles.lede}>Real opportunities. Agentic work.<br />Extraordinary outcomes.</p>
        <div className={styles.ctas}>
          <button type="button" className={styles.ctaLight} onClick={() => openCanvas()}>Try the live canvas <ArrowRight size={18} aria-hidden="true" /></button>
          <a href="#chapter-pursuit" className={styles.ctaGhost}>Explore Pursuit <ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </div>

      <p className={styles.etched} aria-hidden="true"><span>A more capable</span><span>New Zealand</span><i /><span>Businesses</span><span>People</span><span>Communities</span></p>

      <aside className={styles.agent} aria-labelledby="the-work-agent-title">
        <div className={styles.agentHead}>
          <GlassIdentity kind="assembl" size={46} />
          <div><h2 id="the-work-agent-title">Work with an Assembl agent</h2><p>Research opportunities, analyse markets, create a plan, right here.</p></div>
          <span className={styles.badge} data-state={badge.toLowerCase()} title={status?.message}>{badge}</span>
        </div>
        <form className={styles.ask} onSubmit={ask}>
          <label htmlFor="the-work-question" className={styles.srOnly}>What would you like to explore?</label>
          <input id="the-work-question" value={question} maxLength={600} onChange={event => setQuestion(event.target.value)} placeholder="What would you like to explore?" autoComplete="off" />
          <button type="submit" aria-label="Open the canvas with this question"><ArrowRight size={18} /></button>
        </form>
        <div className={styles.suggestions}>
          <div>{SUGGESTIONS[suggestionSet].map(text => <button type="button" key={text} onClick={() => setQuestion(text)}>{text}</button>)}</div>
          <button type="button" className={styles.shuffle} aria-label="Show other suggestions" onClick={() => setSuggestionSet((suggestionSet + 1) % SUGGESTIONS.length)}><RefreshCw size={17} /></button>
        </div>
      </aside>

      <div className={styles.chapterBar}>
        <a href="#chapter-pursuit" className={styles.scrollCue}><span><ArrowDown size={17} aria-hidden="true" /></span>Scroll to explore</a>
        <nav aria-label="Chapters" className={styles.chapters}>{CHAPTERS.map((item, index) => <a key={item.id} href={`#chapter-${item.id}`} aria-current={chapter === item.id ? 'true' : undefined}><b>{String(index + 1).padStart(2, '0')}</b>{item.label}</a>)}</nav>
        <p className={styles.place}><MapPin size={15} aria-hidden="true" />Tāmaki Makaurau, Auckland</p>
      </div>
    </section>

    <section className={styles.ways} aria-labelledby="the-work-ways">
      <header className={styles.waysHead} data-reveal>
        <h2 id="the-work-ways" className={styles.kicker}>Three ways<br />to go further</h2>
        <p>One system. Different starting points. A more capable New Zealand.</p>
        <Link href="/about">Explore all <ArrowRight size={16} aria-hidden="true" /></Link>
      </header>
      <div className={styles.cards}>
        <article className={styles.card} id="chapter-pursuit" data-reveal style={{ '--i': 0 } as CSSProperties}>
          <div className={styles.plate} data-plate="pursuit" aria-hidden="true">
            <Image src="/direction-4c/assets/footage/coast-gen-c-poster.jpg" alt="" fill sizes="(max-width: 900px) 100vw, 33vw" />
            <span className={styles.cube} data-cube="a" /><span className={styles.cube} data-cube="b" /><span className={styles.cube} data-cube="c" />
          </div>
          <h3>Pursuit</h3><p>Find the work.<br />Turn signals into real opportunities.</p>
          <Link href="/pursuit" className={styles.cardLink} aria-label="Open Pursuit"><ArrowRight size={18} /></Link>
        </article>
        <article className={styles.card} id="chapter-do" data-reveal style={{ '--i': 1 } as CSSProperties}>
          <div className={styles.plate} data-plate="do" aria-hidden="true">
            <ol className={styles.doSteps}>{DO_STEPS.map(({ label, detail, Icon }, index) => <li key={label} style={{ '--s': index } as CSSProperties}><span><Icon size={15} /></span><b>{label}</b><small>{detail}</small></li>)}</ol>
          </div>
          <h3>DO</h3><p>Move the work.<br />Agentic work, with your say at each step.</p>
          <Link href="/do" className={styles.cardLink} aria-label="Open DO"><ArrowRight size={18} /></Link>
        </article>
        <article className={styles.card} id="chapter-studio" data-reveal style={{ '--i': 2 } as CSSProperties}>
          <div className={styles.plate} data-plate="studio" aria-hidden="true">
            <Image src="/do/world/scandi-v1/studio-lounge.jpg" alt="" fill sizes="(max-width: 900px) 100vw, 33vw" />
            <span className={styles.sphere} />
          </div>
          <h3>Studio</h3><p>Show the possibility.<br />Demos, sites, campaigns and more.</p>
          <Link href="/creative-studio" className={styles.cardLink} aria-label="Open Studio"><ArrowRight size={18} /></Link>
        </article>
      </div>
    </section>

    <section className={styles.plan} id="chapter-impact" aria-labelledby="the-work-plan">
      <div className={styles.planCopy} data-reveal>
        <p className={styles.kicker}>From possibility to progress</p>
        <h2 id="the-work-plan">Start with a question.<br />Leave with a plan.</h2>
        <p>Use the live canvas to research public sources with Assembl’s agents. Turn what you find into a branded, editable pitch deck.</p>
        <button type="button" className={styles.ctaDark} onClick={() => openCanvas()}>Open the canvas <ArrowRight size={18} aria-hidden="true" /></button>
      </div>
      <figure className={styles.mock} data-reveal aria-label="Illustration of the canvas: a question becomes four research steps and a pitch deck">
        <div className={styles.mockBar}><i /><i /><i /><span>Illustration · not a live result</span></div>
        <div className={styles.mockBody}>
          <ul className={styles.rail} aria-hidden="true">{[Home, Search, FileText, Sparkles, PenLine].map((Icon, index) => <li key={index}><Icon size={15} /></li>)}</ul>
          <div className={styles.chat}>
            <p className={styles.userBubble}>Find growth opportunities in New Zealand’s retirement living market and create a pitch deck.</p>
            <div className={styles.agentBubble}><GlassIdentity kind="assembl" size={30} /><p>I’ll research the market, read the key players, find opportunities and build a branded pitch deck for you.</p></div>
            <ul className={styles.ticks}>{CANVAS_STEPS.map((step, index) => <li key={step} style={{ '--s': index } as CSSProperties}><span><Check size={12} strokeWidth={3} /></span>{step}</li>)}</ul>
            <div className={styles.composer}><span>Message Assembl…</span><b><ArrowRight size={15} /></b></div>
          </div>
          <div className={styles.deck}>
            <p>Your pitch deck is ready</p>
            <div className={styles.cover}><strong>A brighter tomorrow for New Zealand</strong><small>assembl</small></div>
            <div className={styles.thumbs}>
              <Image src="/direction-4c/assets/footage/coast-gen-c-poster.jpg" alt="" width={160} height={90} />
              <Image src="/do/world/scandi-v1/harbour-workroom.jpg" alt="" width={160} height={90} />
              <Image src="/do/world/franklin-v1/studio.jpg" alt="" width={160} height={90} />
            </div>
          </div>
        </div>
      </figure>
    </section>

    <section className={styles.sectors} aria-labelledby="the-work-sectors">
      <h2 id="the-work-sectors" className={styles.kicker}>Built for<br />New Zealand work</h2>
      <p>Concepts and demonstrators across the sectors New Zealand runs on.</p>
      <ul>{SECTORS.map(sector => <li key={sector}>{sector}</li>)}</ul>
      <Link href="/industries">See all industries <ArrowRight size={16} aria-hidden="true" /></Link>
    </section>

    <footer className={styles.footer}>
      <Link href="/" className={styles.footMark}>assembl</Link>
      <nav aria-label="Footer">{[...NAV.slice(0, 5), { label: 'Pricing', href: '/pricing' }, { label: 'Contact', href: '/contact' }].map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
      <p>Less admin, more mahi.</p>
      <small>Imagined Auckland office, rendered. Skyline photograph by Chiara Coetzee, 2012, CC0.</small>
    </footer>

    <dialog ref={dialog} className={styles.canvasDialog} aria-label="Live research canvas" onClose={() => setCanvasGoal(null)} onCancel={() => setCanvasGoal(null)}>
      <button type="button" className={styles.dialogClose} onClick={() => setCanvasGoal(null)} aria-label="Close the canvas"><X size={20} /></button>
      {canvasGoal !== null && <LivePursuitCanvas homepage initialGoal={canvasGoal} />}
    </dialog>
  </div>;
}
