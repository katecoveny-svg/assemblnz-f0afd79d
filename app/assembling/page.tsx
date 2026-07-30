import type { Metadata } from 'next';
import Link from 'next/link';
import { WaitState } from '@/components/site/cinematic/WaitState';
import { TierPlayground } from './TierPlayground';
import { AssemblingScene } from './AssemblingScene';
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
    'Your application makes customers wait. assembling turns that wait into a loyalty layer: agents work in the open and the person earns something they keep. Opt-in, NZ-built.',
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

/** A direct line to Kate. The body pre-fills the three things she otherwise
 *  has to ask for, so the first reply can be a real answer. */
const CONTACT =
  'mailto:assembl@assembl.co.nz?subject=A%20productive%20wait%20in%20our%20product&body=Kia%20ora%20Kate%2C%0A%0AOur%20product%3A%20%0AWhere%20our%20customers%20currently%20wait%3A%20%0AWhat%20we%20would%20want%20them%20to%20earn%3A%20%0A%0A';

export default function AssemblingPage() {
  return (
    <div className="asm">
      <div className="wrap">
        {/* ── hero: the claim on the left, the product itself on the right ── */}
        <section className="asm-hero">
          <AssemblingScene />
          <div className="asm-hero-copy">
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
              <a className="asm-cta" href="#waitlist">put one in your product</a>
              <Link className="asm-cta ghost" href="/assembling/for-ai-builders">for AI builders →</Link>
            </div>
          </div>
          <div className="asm-stage">
            <WaitState />
            <div className="asm-stage-note mono">tier 01 — live today · the module itself, not a picture of it</div>
          </div>
        </section>

        {/* ── the three tiers — the monetisation architecture ── */}
        <section className="asm-band" id="tiers">
          <span className="mono">the framework</span>
          <h2>Three tiers of agentic value.</h2>
          <p className="sub">
            Beyond subscriptions: co-branded experience wrapped around the moments customers
            already spend waiting and deciding. No banner ads — plain, warm, contextual
            intelligence, labelled when it is sponsored.
          </p>
          <div className="asm-doors">
            <div className="asm-door">
              <div>
                <span className="mono">tier 01 · low friction</span>
                <b>The assembling loader</b>
                <p>Idle wait time becomes a contextual, co-branded interstitial — the customer
                watches the real work assemble, and a partner slot rides inside the genuine steps.
                Live today; that is the module above.</p>
              </div>
              <span className="go">planning interstitials</span>
            </div>
            <div className="asm-door">
              <div>
                <span className="mono">tier 02 · medium integration</span>
                <b>The sponsored chat line</b>
                <p>A labelled co-pilot behind the primary journey. It steps forward only when it
                has found something worth saying — a saving, a shortcut, a better slot — and it
                never pretends to be the journey itself.</p>
              </div>
              <span className="go">co-pilot specialists</span>
            </div>
            <div className="asm-door">
              <div>
                <span className="mono">tier 03 · high utility</span>
                <b>The joint-venture UI</b>
                <p>A shared, co-branded surface where a partner&rsquo;s capability is woven natively
                into the journey — book, redeem, optimise in place. Deep utility, and every action
                still ends in a human approval.</p>
              </div>
              <span className="go">immersive portals</span>
            </div>
          </div>
        </section>

        {/* ── the playground ── */}
        <section className="asm-band" id="playground">
          <span className="mono">interactive studio</span>
          <h2>See a tier in a journey.</h2>
          <p className="sub">
            Pick a demonstrator and a tier. The demonstrators are deliberately generic — the
            named-buyer versions live in their own concept rooms.
          </p>
          <TierPlayground />
        </section>

        {/* ── the roadmap ── */}
        <section className="asm-band" id="roadmap">
          <span className="mono">the path forward</span>
          <h2>The rollout, in three phases.</h2>
          <div className="asm-pow asm-road">
            <div>
              <i className="mono">phase 01 · now</i>
              <b>Tactical assembling interstitials</b>
              <span>Tier-one loaders into the live demonstrators — the wait shown, the wait paid.
              This phase is shipping: fifteen concept demos already run it.</span>
            </div>
            <div>
              <i className="mono">phase 02 · next</i>
              <b>Contextual sponsored co-pilots</b>
              <span>Labelled chat-line specialists behind active journeys, stepping forward only
              with found value — piloted with one partner per demonstrator.</span>
            </div>
            <div>
              <i className="mono">phase 03 · then</i>
              <b>Immersive joint-venture environments</b>
              <span>Co-branded transactional surfaces for the deepest journeys — and, further out,
              wait-slots matched to partners in real time. Trust rules travel with every phase.</span>
            </div>
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

        {/* ── talk to Kate ──────────────────────────────────────────────
            Kate, 30 July 2026: "the wait list i want to come direct ot me not
            through brevo".

            This was a waitlist form whose notification travelled through the
            Brevo edge function and which also added the person to a Brevo
            mailing list. Two problems with that. The list subscription was
            never what she wanted, and the notification leg has form: Brevo's
            "Authorised IPs" allowlist silently ate sends during the 17 June
            outage, so a lead could submit successfully and never arrive.

            It is now a direct email. Their own mail client, their own address,
            straight to assembl@assembl.co.nz, with the three things she always
            has to ask for already in the body. No provider in the path, nothing
            to misconfigure, nothing to go quietly missing — and she gets a real
            reply-able thread rather than a notification about a form.

            "Early access" and "waitlist" also had to go. The whole site now
            points here as the agentic journey; a waitlist on the destination
            reads as "we are not ready yet". */}
        <section className="asm-band asm-wait" id="waitlist">
          <span className="mono">talk to a person</span>
          <h2>Put a productive wait in your product.</h2>
          <p className="sub">
            Tell me where your customers currently wait and what you would want them to earn for
            it. I read these myself and I answer them myself.
          </p>
          <div className="panel" style={{ marginTop: 34 }}>
            <a className="asm-cta" href={CONTACT}>email me directly &rarr;</a>
            <p className="fine">
              Straight to assembl@assembl.co.nz from your own mail client. No form, no list, and
              nothing in between. assembling is part of assembl &mdash; intuitive agentic customer
              journeys.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
