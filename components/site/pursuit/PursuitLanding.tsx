'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { GlowDoWidget } from '../assembl-the-work/GlowDoWidget';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
import { PursuitCanvasHero } from './PursuitCanvasHero';
import '../assembl-the-work/assembl-the-work.css';
import styles from './pursuit.module.css';

const flow = [
  {
    name: 'Signals',
    title: 'NZ live intelligence, gathered.',
    body: 'Assembl watches New Zealand opportunities and signals — tenders, market moves, buyer clues and useful change — and keeps the evidence with them.',
  },
  {
    name: 'Canvas',
    title: 'An idea you can rearrange.',
    body: 'On the Pursuit canvas you move agent-suggested parts until the story holds. Radar and API work stay behind the scenes.',
  },
  {
    name: 'Demonstrator',
    title: 'Into a brand or client frame.',
    body: 'The same parts settle into a client Pursuit demonstrator — something a team can review, question and take into the next conversation.',
  },
] as const;

export function PursuitLanding() {
  const [paused, setPaused] = useState(false);
  // Launch directly into the authenticated client-hub index. The ChatGPT Site
  // may still require sign-in, but its return_to now lands on /studios rather
  // than the generic root.
  const hub = PRODUCT_DESTINATIONS.pursuit.workspace;
  const studio = PRODUCT_DESTINATIONS.studio.overview;

  return (
    <div className={`atw ${styles.page}`} data-paused={paused || undefined}>
      <a href="#pursuit-canvas" className="atw-skip">
        Skip to the canvas
      </a>

      <section className={styles.hero} aria-labelledby="pursuit-title">
        <div className={styles.ambient} aria-hidden="true" />
        <header className={styles.header}>
          <Link href="/" className={styles.wordmark}>
            assembl
          </Link>
          <nav aria-label="Primary">
            <Link href="/pursuit" aria-current="page">
              Pursuit
            </Link>
            <Link href="/do">DO</Link>
            <Link href={studio}>Studio</Link>
          </nav>
          <GlowDoWidget />
        </header>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Pursuit / find it.</p>
            <h1 id="pursuit-title">
              NZ signals.
              <br />
              <span>A client Pursuit you can show.</span>
            </h1>
            <p className={styles.lead}>
              Assembl brings New Zealand live intelligence into a demonstrator — a Pursuit your
              client can see, rearrange and take forward. The radar stays backstage.
            </p>
            <a className={styles.primary} href={hub} target="_blank" rel="noopener noreferrer">
              Open the Pursuit client hubs <ArrowUpRight size={19} aria-hidden="true" />
            </a>
            <a className={styles.quietLink} href="#pursuit-canvas">
              See the canvas experience <ArrowRight size={16} aria-hidden="true" />
            </a>
            <p className={styles.honesty}>
              Public page: the story and canvas proof. Private client work opens in the authenticated Pursuit hub.
            </p>
          </div>

          <div id="pursuit-canvas" className={styles.example} aria-label="Pursuit canvas preview">
            <div className={styles.exampleTop}>
              <span>Canvas · rearrange → brand</span>
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? 'Resume visual motion' : 'Pause visual motion'}
              >
                {paused ? <Play size={15} /> : <Pause size={15} />}
              </button>
            </div>
            <PursuitCanvasHero paused={paused} />
          </div>
        </div>

        <div className={styles.heroFoot}>
          <span>NZ signals → Pursuit canvas → client demonstrator</span>
          <span>Live intelligence behind the scenes</span>
        </div>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <div>
          <p className={styles.eyebrow}>What Pursuit does</p>
          <h2 id="process-title">
            From a New Zealand
            <br />
            signal to a working demo.
          </h2>
          <p className={styles.sectionLead}>
            Pursuit is the find door. It turns live and gathered NZ intelligence into a Pursuit you
            can open with a client — not a dashboard of endpoints.
          </p>
        </div>
        <ol>
          {flow.map((item, index) => (
            <li key={item.name}>
              <span>0{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.connected} aria-labelledby="connected-title">
        <div className={styles.connectedIntro}>
          <p className={styles.eyebrow}>Find. DO. Show.</p>
          <h2 id="connected-title">
            One system,
            <br />
            clear doors.
          </h2>
          <p>
            Start in Pursuit. Use DO when the work needs doing — a small agent
            that sits where you already work (<Link href="/do">/do</Link>).
            Open Studio when the idea needs to be seen.
          </p>
        </div>
        <div className={styles.productLinks}>
          <a href={hub} target="_blank" rel="noopener noreferrer">
            <span>01 / Pursuit client hubs</span>
            <h3>Find and frame the opportunity.</h3>
            <p>Private client workspaces and Pursuit boards.</p>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <Link href="/do">
            <span>02 / DO</span>
            <h3>Do the bounded work.</h3>
            <p>Portable agents, tools and approvals around the job.</p>
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href={studio}>
            <span>03 / Studio</span>
            <h3>Make it tangible.</h3>
            <p>Visual demonstrations, sites, film, campaigns and experiences.</p>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className={styles.offer} aria-labelledby="offer-title">
        <div>
          <p className={styles.eyebrow}>Work with assembl</p>
          <h2 id="offer-title">
            A focused
            <br />
            Pursuit sprint.
          </h2>
          <p>
            Research one NZ opportunity, shape a demonstrator on the canvas, and prepare the next
            client conversation.
          </p>
          <Link className={styles.primaryDark} href="/contact?product=pursuit">
            Discuss your project <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.deliverables}>
          <p className={styles.eyebrow}>What we agree together</p>
          <ul>
            <li>NZ signal and opportunity brief</li>
            <li>Canvas-shaped concept</li>
            <li>Client demonstrator frame</li>
            <li>Practical next-step plan</li>
          </ul>
          <p>
            Hub access is set up for the agreed engagement. The private client hubs require ChatGPT sign-in.
          </p>
          <a href={hub} target="_blank" rel="noopener noreferrer">
            Already working with us? Open your client hubs <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link className={styles.wordmark} href="/">
          assembl
        </Link>
        <p>
          Find it. DO it. Show it.
          <br />
          Aotearoa New Zealand.
        </p>
        <nav aria-label="Footer">
          <Link href="/">Home</Link>
          <a href={hub} target="_blank" rel="noopener noreferrer">
            Pursuit hubs
          </a>
          <Link href="/do">DO</Link>
          <Link href={studio}>Studio</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/legal/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
