'use client';

import NextImage from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Instrument_Serif } from 'next/font/google';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
import { footerMarkup } from '@/components/site/direction-4c/markup';
import { CHAPTERS, DEMONSTRATORS, EVIDENCE, MACHINES, frameAt, framePaths, loadOrder, sectionProgress, stepsDone, storyProgress, type Chapter } from './story';
import '@/components/site/direction-4c/direction-4c.css';
import './home-scroll-story.css';

// Kate's brief (30 Oct 2026) allows a serif italic accent like the lab's; it carries one word per heading only.
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', display: 'swap', variable: '--hss-serif' });

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19 19 5M5 5h14v14" /></svg>
);

const openGuide = () => window.dispatchEvent(new Event('assembl:open-public-guide'));

/** Isometric pastel cube, the lab's building block. Lilac and friends live only inside the worlds. */
function Cube({ c, i }: { c: [string, string, string]; i: number }) {
  return (
    <span className="hss-cube" style={{ ['--i' as string]: i }} aria-hidden="true">
      <svg viewBox="0 0 60 66"><path d="M30 2 58 18 30 34 2 18Z" fill={c[0]} /><path d="M2 18 30 34v30L2 48Z" fill={c[1]} /><path d="M58 18 30 34v30l28-16Z" fill={c[2]} /></svg>
    </span>
  );
}
const CUBES: Array<[string, string, string]> = [
  ['#F9D2B8', '#F0B79A', '#E39E80'], ['#D9CBF2', '#C3B0E8', '#AD98DB'], ['#BFE8D6', '#A3D9C1', '#86C8AC'],
  ['#F3B8C8', '#E99DB2', '#DB839C'], ['#BFDDF5', '#A2CBEC', '#86B7E0'], ['#D9CBF2', '#C3B0E8', '#AD98DB'],
];

function ChapterSection({ chapter, index }: { chapter: Chapter; index: number }) {
  return (
    <section id={chapter.id} className="hss-chapter" data-scroll="" data-chapter={index} aria-labelledby={`${chapter.id}-title`}>
      <div className="hss-sticky">
        <figure className="hss-world" data-frames={JSON.stringify(framePaths(chapter.frames))} data-phone-frames={chapter.phoneFrames ? JSON.stringify(framePaths(chapter.phoneFrames)) : undefined}>
          <picture>
            {chapter.phonePoster ? <source media="(max-width: 760px)" srcSet={chapter.phonePoster} /> : null}
            <img className="hss-poster" src={chapter.poster} alt="" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
          </picture>
          <canvas className="hss-canvas" aria-hidden="true" />
          {/* Mirrors the latest ticked step onto the world; the list beside it is the readable source. */}
          <p className="hss-now" aria-hidden="true"><span className="hss-now-tag">{chapter.steps[0].tag}</span><span className="hss-now-text">{chapter.steps[0].text}</span></p>
          <figcaption className="hss-label"><span className="hss-dot" aria-hidden="true" />{chapter.label}<span className="hss-world-name">{chapter.world}</span></figcaption>
        </figure>
        <div className="hss-copy">
          <p className="hss-kicker">{chapter.kicker}</p>
          <h2 id={`${chapter.id}-title`} className="hss-title">{chapter.title[0]}<em>{chapter.title[1]}</em>{chapter.title[2] ?? ''}</h2>
          <p className="hss-body">{chapter.body}</p>
          <ol className="hss-steps" aria-label="Illustrative work steps">
            {chapter.steps.map(step => (
              <li key={step.tag} className="hss-step"><span className="hss-tick" aria-hidden="true" /><span className="hss-tag">{step.tag}</span><span>{step.text}</span></li>
            ))}
          </ol>
          <div className="hss-actions">
            <a className="hss-btn" href={chapter.cta.href}>{chapter.cta.text} <Arrow /></a>
            {chapter.secondary ? <a className="hss-link" href={chapter.secondary.href}>{chapter.secondary.text} <Arrow /></a> : null}
          </div>
        </div>
        <div className="hss-progress" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}

/** Scroll-scrubbed frame player for one world. Frames load only when the chapter is near. */
class FramePlayer {
  private imgs: Array<HTMLImageElement | undefined> = [];
  private loaded: boolean[] = [];
  private started = false;
  private paths: string[] = [];
  private ctx: CanvasRenderingContext2D | null;
  private last = '';
  constructor(private figure: HTMLElement, private canvas: HTMLCanvasElement, private phone: boolean) {
    this.ctx = canvas.getContext('2d');
    const raw = (phone && figure.dataset.phoneFrames) || figure.dataset.frames || '[]';
    this.paths = JSON.parse(raw) as string[];
  }
  start() {
    if (this.started) return;
    this.started = true;
    const order = loadOrder(this.paths.length);
    let cursor = 0;
    // Two requests in flight keep the network polite while the coarse pass fills quickly.
    const next = () => {
      const i = order[cursor++];
      if (i === undefined) return;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { this.loaded[i] = true; this.last = ''; next(); };
      img.onerror = () => next();
      img.src = this.paths[i];
      this.imgs[i] = img;
    };
    next(); next();
  }
  private nearest(i: number): number {
    for (let d = 0; d < this.paths.length; d++) {
      if (this.loaded[i - d]) return i - d;
      if (this.loaded[i + d]) return i + d;
    }
    return -1;
  }
  draw(progress: number) {
    const ctx = this.ctx;
    if (!ctx || !this.paths.length) return;
    const { a, b, mix } = frameAt(progress, this.paths.length);
    const fa = this.nearest(a);
    if (fa < 0) return;
    const fb = this.loaded[b] ? b : fa;
    const key = `${fa}:${fb}:${Math.max(0, Math.min(1, (mix - 0.62) / 0.3)).toFixed(2)}:${this.canvas.width}`;
    if (key === this.last) return;
    this.last = key;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(rect.width * dpr)), h = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    const paint = (img: HTMLImageElement, alpha: number) => {
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };
    paint(this.imgs[fa]!, 1);
    // Hold each frame and dissolve only near the hand-over, so neighbours never sit half-blended.
    const blend = Math.max(0, Math.min(1, (mix - 0.62) / 0.3));
    if (fb !== fa && blend > 0.02) paint(this.imgs[fb]!, blend);
    ctx.globalAlpha = 1;
    this.figure.dataset.live = 'true';
  }
}

export function HomeScrollStory() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const phone = matchMedia('(max-width: 760px)');
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    let players: Array<{ section: HTMLElement; player: FramePlayer }> = [];
    let io: IntersectionObserver | undefined;
    let raf = 0;
    const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-scroll]'));
    const chapters = Array.from(root.querySelectorAll<HTMLElement>('.hss-chapter'));

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const section of sections) {
        const r = section.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const p = sectionProgress(r.top, r.height, vh);
        section.style.setProperty('--p', p.toFixed(4));
        const steps = section.querySelectorAll<HTMLElement>('.hss-step');
        if (steps.length) {
          const done = stepsDone(storyProgress(p), steps.length);
          steps.forEach((step, i) => step.toggleAttribute('data-done', i < done));
          const now = section.querySelector<HTMLElement>('.hss-now');
          const current = steps[Math.max(0, done - 1)];
          if (now && current && now.dataset.step !== String(done)) {
            now.dataset.step = String(done);
            now.querySelector('.hss-now-tag')!.textContent = current.querySelector('.hss-tag')?.textContent ?? '';
            now.querySelector('.hss-now-text')!.textContent = current.children[2]?.textContent ?? '';
            now.toggleAttribute('data-done', done > 0);
            now.classList.remove('hss-pop'); void now.offsetWidth; now.classList.add('hss-pop');
          }
        }
      }
      for (const { section, player } of players) {
        const r = section.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        player.draw(storyProgress(sectionProgress(r.top, r.height, vh)));
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };

    const setup = () => {
      io?.disconnect();
      players = [];
      root.toggleAttribute('data-motion', !reduced.matches);
      if (reduced.matches) {
        // Complete, assembled state: every step shown, posters only, no sequences fetched.
        root.querySelectorAll<HTMLElement>('.hss-step').forEach(step => step.setAttribute('data-done', ''));
        sections.forEach(section => section.style.setProperty('--p', '1'));
        return;
      }
      if (nav.connection?.saveData) return;
      players = chapters.map(section => ({
        section,
        player: new FramePlayer(section.querySelector('.hss-world')!, section.querySelector('canvas')!, phone.matches),
      }));
      io = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        players.find(p => p.section === entry.target)?.player.start();
        io?.unobserve(entry.target);
      }), { rootMargin: '150% 0px 150% 0px' });
      chapters.forEach(section => io!.observe(section));
      // Repaint as frames arrive, without a permanent animation loop.
      const tickWhileLoading = window.setInterval(schedule, 250);
      window.setTimeout(() => clearInterval(tickWhileLoading), 20000);
      schedule();
    };

    setup();
    const onScroll = () => schedule();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    reduced.addEventListener('change', setup);
    phone.addEventListener('change', setup);
    update();
    return () => {
      io?.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      reduced.removeEventListener('change', setup);
      phone.removeEventListener('change', setup);
    };
  }, []);

  return (
    <div ref={rootRef} className={`hss ${serif.variable}`}>
      <header className="hss-header">
        <a href="#top" className="hss-brand" aria-label="assembl, back to top"><GlassIdentity kind="assembl" size={40} /><span>assembl</span></a>
        <nav aria-label="Primary" className="hss-nav">
          <Link href="/assembling">Customer journeys</Link><Link href="/studio">Studio</Link><Link href="/lab">Lab</Link><Link href="/ai-ready">Website check</Link>
        </nav>
        <Link href="/contact" className="hss-btn hss-btn-sm">Bring us the work <Arrow /></Link>
      </header>

      <section id="top" className="hss-hero" data-scroll="" aria-labelledby="hero-title">
        <div className="hss-hero-sticky">
          <div className="hss-hero-copy">
            <p className="hss-kicker">agentic AI · built in Aotearoa New Zealand</p>
            <h1 id="hero-title" className="hss-title hss-hero-title">Less admin.<br />More time with <em>customers.</em></h1>
            <p className="hss-lede">We find the jobs that eat your day, build AI that gets them ready, and show you it working before anything goes live. A person you trust signs off every step.</p>
            <p className="hss-arc" aria-label="How we work"><span>Find the friction.</span> <span>Assemble the journey.</span> <span>Prove the result.</span></p>
            <div className="hss-actions">
              <Link className="hss-btn" href="/contact">Bring us the work <Arrow /></Link>
              <button type="button" className="hss-btn hss-btn-ghost" onClick={openGuide}>Ask DO about assembl</button>
            </div>
          </div>
          <div className="hss-hero-world">
            <div className="hss-hero-window">
              {/* eslint-disable-next-line @next/next/no-img-element -- LCP render, sized by srcset */}
              <img src="/home-story/hero-home.webp" srcSet="/home-story/hero-home-1000.webp 1000w, /home-story/hero-home.webp 2000w" sizes="(max-width: 760px) 100vw, 60vw" width={2000} height={1250} alt="Simulated cutaway model of a Kiwi home, its roof lifting off, from the assembl lab" fetchPriority="high" decoding="async" />
              <p className="hss-label"><span className="hss-dot" aria-hidden="true" />Simulated · a home from the assembl lab</p>
            </div>
            <div className="hss-cubes" aria-hidden="true">{CUBES.map((c, i) => <Cube key={i} c={c} i={i} />)}</div>
          </div>
          <p className="hss-cue" aria-hidden="true"><span>scroll to assemble</span><i /></p>
        </div>
      </section>

      {CHAPTERS.map((chapter, i) => <ChapterSection key={chapter.id} chapter={chapter} index={i} />)}

      <section id="study" className="hss-machines" data-scroll="" aria-labelledby="study-title">
        <div className="hss-machines-sticky">
          <div className="hss-machines-copy">
            <p className="hss-kicker">04 · Lab · study machines</p>
            <h2 id="study-title" className="hss-title">Learning, piece by <em>piece.</em></h2>
            <p className="hss-body">The same craft, made for students. Interactive 3D machines for NCEA and Years 7–10: turn them, run them, then practise with NZQA’s past papers.</p>
            <div className="hss-actions"><Link className="hss-link" href="/lab">See the study machines in Lab <Arrow /></Link></div>
          </div>
          <ul className="hss-machine-grid" aria-label="A few of the study machines">
            {MACHINES.map((m, i) => (
              <li key={m.src} className="hss-machine" style={{ ['--i' as string]: i }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- transparent cutout render */}
                <img src={m.src} alt="" width={m.w} height={m.h} loading="lazy" decoding="async" />
                <span>{m.name}</span>
              </li>
            ))}
          </ul>
          <p className="hss-label hss-label-static"><span className="hss-dot" aria-hidden="true" />Lab experiment · renders of the live machines</p>
        </div>
      </section>

      <section id="check" className="hss-check" aria-labelledby="check-title">
        <div className="hss-check-head">
          <div>
            <p className="hss-kicker">start with your own business</p>
            <h2 id="check-title" className="hss-title">See what to fix on your <em>website.</em></h2>
          </div>
          <div>
            <p className="hss-body">A check of your public website, the fixes in plain English, and a sketch of one customer journey worth improving. Download it and talk it through with your team.</p>
            <div className="hss-actions"><Link className="hss-btn" href="/ai-ready">Get your website action plan <Arrow /></Link></div>
          </div>
        </div>
        <div className="hss-demos">
          {DEMONSTRATORS.map(d => (
            <a key={d.href} className="hss-demo" href={d.href}>
              <NextImage src={d.img} alt={d.alt} width={d.w} height={d.h} loading="lazy" sizes="(max-width: 760px) 100vw, 50vw" />
              <span className="hss-demo-tag">{d.tag}</span>
              <span className="hss-demo-title">{d.title} <Arrow /></span>
              <span className="hss-demo-text">{d.text}</span>
            </a>
          ))}
        </div>
      </section>

      <section id="proof" className="hss-proof" aria-labelledby="proof-title">
        <div className="hss-proof-inner">
          <div>
            <p className="hss-kicker">05 · proof · why it is built this way</p>
            <h2 id="proof-title" className="hss-title">Prove the <em>result.</em></h2>
            <p className="hss-body">Three rules every job follows, and where each one comes from.</p>
          </div>
          <ol className="hss-receipt" aria-label="Rules and sources">
            {EVIDENCE.map((e, i) => (
              <li key={e.rule}><span className="hss-receipt-n">0{i + 1}</span><span><strong>{e.rule}</strong><span className="hss-receipt-src">source · {e.source}</span></span></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="try" className="hss-try" aria-label="Ask DO about assembl">
        <div className="hss-try-card">
          <GlassIdentity kind="do" size={64} />
          <div>
            <p className="hss-kicker">ask DO · about assembl</p>
            <h3 className="hss-try-title">What would you like to know?</h3>
            <p>Ask about assembl, our work or how to start.</p>
            <p className="hss-quiet">Public company information only. No access to private accounts, shopping baskets or bookings.</p>
            <button type="button" className="hss-btn" onClick={openGuide}>Ask DO about assembl</button>
          </div>
        </div>
      </section>

      <section id="contact" className="hss-contact" aria-labelledby="contact-title">
        {/* eslint-disable-next-line @next/next/no-img-element -- the same generated coast as /contact; never captioned as a real place */}
        <img className="hss-arch" src="/direction-4c/assets/footage/coast-gen-c-poster.jpg" alt="" loading="lazy" decoding="async" />
        <p className="hss-kicker">start a conversation</p>
        <h2 id="contact-title" className="hss-title hss-contact-title">Some assembly <em>required.</em></h2>
        <p className="hss-body">Bring a brief, an opportunity or a job that needs better thinking. We’ll agree the outcome and the first useful piece of work.</p>
        <div className="hss-actions hss-center">
          <Link className="hss-btn" href="/contact">Bring us the work <Arrow /></Link>
          <Link className="hss-btn hss-btn-ghost" href="/contact">Start a conversation</Link>
        </div>
      </section>

      <div className="direction-4c hss-footer" dangerouslySetInnerHTML={{ __html: footerMarkup }} />
    </div>
  );
}
