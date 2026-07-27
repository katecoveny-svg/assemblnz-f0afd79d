import type { Metadata } from 'next';
import Link from 'next/link';
import { WaitState } from '@/components/site/cinematic/WaitState';
import { DashWaitlistForm } from './DashWaitlistForm';
import './assembling-canon.css';

/**
 * /assembling — the loyalty layer for the agentic wait, on current canon.
 *
 * Rebuilt 2026-07-28 from Kate's monetised-wait-state blueprint (tokens
 * corrected to the live brand): the Birdie dachshund, canary yellow and
 * fill-the-dog loader are retired. The hero demonstrates the actual product —
 * the same live WaitState module the homepage and the concept demos run — and
 * the proof section promises measurement, not invented percentages.
 *
 * Product claims (charity at launch, KiwiSaver/points rails to follow, never
 * reads prompts/content/files/code) are carried over unchanged from the
 * previous page — they are product truth until Kate says otherwise.
 */

export const metadata: Metadata = {
  title: 'assembling. by assembl — the wait state, productive',
  description:
    'Your application makes customers wait. assembling turns that wait into a loyalty layer: while agents work in the open, the person earns something they keep — a donation at launch, with KiwiSaver, power bills and points rails to follow as partners sign. Opt-in, NZ-built, assembl-governed.',
  alternates: { canonical: '/assembling' },
  openGraph: {
    title: 'assembling — the wait state, productive.',
    description: 'The loyalty layer for the agentic wait, by assembl — intuitive agentic customer journeys.',
    type: 'website',
    siteName: 'assembling. by assembl',
    url: '/assembling',
    locale: 'en_NZ',
    images: [{ url: '/images/dash/og-image.png', width: 1200, height: 630, alt: 'assembling — the wait state, productive.' }],
  },
};

export default function AssemblingPage() {
  return (
    <div className="asm">
      <div className="wrap">
        {/* ── hero: the claim on the left, the product itself on the right ── */}
        <section className="asm-hero">
          <div>
            <span className="mono">assembling · the loyalty layer for the agentic wait</span>
            <h1>
              The wait state,
              <br />
              <span className="metal">productive.</span>
            </h1>
            <p className="lede">
              Every agentic journey has a pause — the minutes while agents research, draft and
              check. Today that pause is a spinner. assembling makes it the most generous moment
              in your customer journey: the work shown as it happens, value earned for the
              minutes, and one optional question answered back. One line of code to add it.
            </p>
            <div className="asm-cta-row">
              <a className="asm-cta" href="#waitlist">join the waitlist</a>
              <Link className="asm-cta ghost" href="/assembling/for-ai-builders">for AI builders →</Link>
            </div>
          </div>
          <div className="asm-stage">
            <WaitState />
            <div className="asm-stage-note mono">live — the module itself, not a picture of it</div>
          </div>
        </section>

        {/* ── how the wait is powered — same four steps as every assembl surface ── */}
        <section className="asm-band" id="flagship">
          <span className="mono">how it earns</span>
          <h2>Four steps, none of them a trick.</h2>
          <p className="sub">
            The same pattern that runs on every assembl concept: honest progress made valuable.
            Never a wait stretched to fill, never a fake bar.
          </p>
          <div className="asm-pow">
            <div><i className="mono">01 — intent signal</i><b>The agent detects the wait</b><span>What the customer is waiting for, and why it matters right now.</span></div>
            <div><i className="mono">02 — honest duration</i><b>How long, truthfully</b><span>Real steps, real progress — the work shown as it actually happens.</span></div>
            <div><i className="mono">03 — value delivery</i><b>Something worth the minutes</b><span>Useful, short, skippable. The person watches the work, not a spinner.</span></div>
            <div><i className="mono">04 — value exchange</i><b>The wait pays</b><span>The customer earns as they watch, and one optional question comes back the other way.</span></div>
          </div>
        </section>

        {/* ── three doors ── */}
        <section className="asm-band">
          <span className="mono">one wait · everyone wins</span>
          <h2>Three doors into the same moment.</h2>
          <div className="asm-doors">
            <Link className="asm-door" href="/assembling/for-ai-builders">
              <div>
                <b>For AI builders</b>
                <p>One line of code and your wait states start giving something back. Fully
                asynchronous, degrades to nothing if it ever fails — your app never waits for us.</p>
              </div>
              <span className="go">the loader SDK →</span>
            </Link>
            <a className="asm-door" href="#waitlist">
              <div>
                <b>For businesses</b>
                <p>Your credit, your points, your cause — the value earned in the wait is yours to
                brand and yours to fund. The loyalty your customers feel is the minutes you gave back.</p>
              </div>
              <span className="go">the loyalty integration →</span>
            </a>
            <Link className="asm-door" href="/assembling/privacy">
              <div>
                <b>For people</b>
                <p>Opt-in, always. assembling never reads prompts, content, files or code — it sees
                that a wait is happening, never what the wait is about. Decline any question and
                the work still finishes.</p>
              </div>
              <span className="go">how your data is treated →</span>
            </Link>
          </div>
        </section>

        {/* ── the rewards truth, unchanged product claims ── */}
        <section className="asm-band" id="rewards">
          <span className="mono">what the wait earns</span>
          <h2>Real value, in rails that exist.</h2>
          <div className="asm-truth">
            <b>At launch, the wait gives:</b> a donation to charity (SPCA New Zealand) — every
            completed wait, something real. <b>Rolling out as partners sign:</b> KiwiSaver
            contributions, power-bill credits and points rails. NZ-only, opt-in, and
            assembl-governed — the reward comes from the business running the journey, never
            from selling the person waiting.
          </div>
        </section>

        {/* ── honest proof: what a pilot measures — no invented percentages ── */}
        <section className="asm-band">
          <span className="mono">the proof</span>
          <h2>We measure it, or we don&rsquo;t claim it.</h2>
          <p className="sub">
            No projected percentages on this page. A pilot instruments four things, and the
            numbers you quote afterwards are your own.
          </p>
          <div className="asm-measure">
            <div><b>Waits completed v. abandoned</b><span>Do people stay when the wait shows its work? Measured against your current spinner.</span></div>
            <div><b>Value earned and redeemed</b><span>What the waits gave, and whether people came back to spend it.</span></div>
            <div><b>Questions answered v. declined</b><span>The one optional question, and what your business learned from the answers.</span></div>
            <div><b>Approval, always human</b><span>Every output that followed a wait, held for a named person — audited, on the record.</span></div>
          </div>
        </section>

        {/* ── waitlist ── */}
        <section className="asm-band asm-wait" id="waitlist">
          <span className="mono">early access</span>
          <h2>Put a productive wait in your product.</h2>
          <p className="sub">
            We are onboarding NZ builders and businesses in small groups, so every integration
            gets looked at properly.
          </p>
          <div className="panel" style={{ marginTop: 34 }}>
            <DashWaitlistForm />
            <p className="fine">
              assembling is part of assembl — intuitive agentic customer journeys. Your email is
              used for the waitlist and nothing else.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
