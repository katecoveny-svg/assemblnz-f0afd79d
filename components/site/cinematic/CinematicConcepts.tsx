'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CineFooter } from './CineFooter';

/**
 * /concepts — the public, name-free answer to "does this only work for
 * groceries?"
 *
 * Five industries retain their original descriptions and selection controls.
 * The shared watch frame supplies the page's assembly artwork.
 *
 * Every named client is redacted here on purpose. The signed concept sites stay
 * private to the person they were prepared for.
 */

type Shape = 'trolley' | 'wing' | 'meter' | 'roof' | 'quote';

interface Journey {
  id: Shape;
  n: string;
  sector: string;
  wait: string;
  assembled: string;
  boundary: string;
  measured: string;
}

const JOURNEYS: Journey[] = [
  {
    id: 'trolley',
    n: '01',
    sector: 'Grocery & loyalty',
    wait: 'A shopper opens the app to plan the weekly shop and spends anywhere between five and forty minutes browsing. The app gives nothing back for that time.',
    assembled: 'The week ahead read from the household calendar, a basket drafted against the usual brands and the dietary rules, and one approval to review — not thirty decisions.',
    boundary: 'It can prepare a basket. It cannot buy, substitute or redeem. The retailer keeps the ledger and every consequential action.',
    measured: 'Minutes returned per shopper per week, completion of the wait, basket-review rate, and zero unapproved actions.',
  },
  {
    id: 'wing',
    n: '02',
    sector: 'Airline & travel',
    wait: 'A flight is delayed and several hundred people reach for their phones at once. The wait is spent in a queue, and it is where loyalty is won or lost.',
    assembled: 'Three ranked rebooking options prepared before the passenger reaches the desk — seat preference held, connection risk checked, the reason for the ranking written in plain words.',
    boundary: 'It can prepare options and stage them. It cannot rebook, refund or override an operations decision. Nothing is confirmed without the passenger and the airline both saying yes.',
    measured: 'Calls deflected, option-review rate, confirmed in-app rebookings, and zero unapproved actions.',
  },
  {
    id: 'meter',
    n: '03',
    sector: 'Energy & utilities',
    wait: 'The bill is being assembled and the customer does not know yet whether it is going to hurt. The first they hear of a bad month is the number itself.',
    assembled: 'The rise explained before it lands — this month against last, the weather that drove it, whether the meter looks normal, and one adjustment staged for review.',
    boundary: 'It can explain and stage. It cannot switch a plan, apply a credit or change a payment arrangement. The retailer approves anything that touches money.',
    measured: 'Bill-understanding uplift, calls asking "why is my bill this?", opt-in rate, and zero unapproved changes.',
  },
  {
    id: 'roof',
    n: '04',
    sector: 'Retirement living & care',
    wait: 'A family asks for the information pack about moving a parent, and what arrives is the same pack everyone gets. The hardest part — working out whether it is affordable and whether she would be happy — is left to them.',
    assembled: 'The same published guides, opened at the parts that apply to this family: her town, her price range, what the fees actually mean, and what happens if her needs change.',
    boundary: 'It can prepare reading and answer from published information. It touches no care record, no clinical system and no resident data. An advisor decides what is sent.',
    measured: 'Enquiry-to-visit rate, time to a first useful answer, and zero unapproved sends.',
  },
  {
    id: 'quote',
    n: '05',
    sector: 'Trades & professional services',
    wait: 'Someone asks for a quote on a Friday afternoon. It sits in an inbox until Monday, by which time two competitors have replied.',
    assembled: 'A draft quote built from the last job like it, the current rates and the questions still unanswered — ready for the owner to check on the phone and send in a minute.',
    boundary: 'It can draft and price from your own rate card. It cannot send, commit to a date or discount. You read it before the customer does.',
    measured: 'Time to first reply, quotes sent per week, win rate against the baseline, and zero unapproved sends.',
  },
];

/**
 * How many sectors we have actually mapped end to end. The homepage counts
 * this rather than quoting a number, so the two can never disagree.
 */
export const CONCEPT_SECTOR_COUNT = JOURNEYS.length;

export function CinematicConcepts() {
  const [active, setActive] = useState(0);

  const j = JOURNEYS[active];

  return (
    <div className="cine">
      <div className="content">
        <nav className="nav">
          <Link className="wordmark" href="/">assembl</Link>
          <div className="nav-links">
            <Link href="/concepts">concepts</Link>
            <Link href="/agents">agents</Link>
            <Link href="/pricing">pricing</Link>
            <Link href="/assembling">the agentic journey</Link>
          </div>
          <Link className="nav-cta" href="/">← home</Link>
        </nav>

        <header className="page-header" style={{ paddingBottom: 20 }}>
          <div className="kicker">concepts · how it works</div>
          <h1>Five waits.<br /><span className="accent">Same pattern.</span></h1>
          <p className="lede" style={{ marginTop: 12 }}>
            People ask if this only works for groceries. It doesn&rsquo;t. Each concept is the same shape: a real customer wait,
            useful work prepared inside it, and a named person who says yes before anything happens. Pick an industry and watch
            the object rebuild — live demo / preview / concept labels stay honest.
          </p>
        </header>

        <div className="page-body">
          <div className="concept-grid">
            <div className="concept-stage">
                      <div className="builder-hint"><span className="live-dot" />{j.sector.toLowerCase()}</div>
            </div>

            <div className="concept-read">
              <div className="concept-tabs">
                {JOURNEYS.map((x, i) => (
                  <button
                    key={x.id}
                    className={`concept-tab ${i === active ? 'active' : ''}`}
                    onClick={() => setActive(i)}
                  >
                    <span className="ct-n">{x.n}</span>
                    <span className="ct-s">{x.sector}</span>
                  </button>
                ))}
              </div>

              <div className="concept-detail">
                <dl>
                  <dt>the wait</dt><dd>{j.wait}</dd>
                  <dt>what gets assembled</dt><dd>{j.assembled}</dd>
                  <dt>the boundary</dt><dd>{j.boundary}</dd>
                  <dt>what gets measured</dt><dd>{j.measured}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="glass-panel concept-note">
            <div className="panel-header">the same four questions <span className="live">every industry</span></div>
            <p>
              Where does your customer already wait? What could be ready by the time they look? Who signs it off? And how would
              you know it worked? Answer those four and the journey is most of the way built — the industry only decides what
              gets prepared.
            </p>
            <p style={{ marginTop: 14 }}>
              Working versions of these exist, prepared for named businesses and shared privately with the person they were
              written for. The versions here are stripped of every client name on purpose.
            </p>
            <div className="concept-cta">
              <Link className="btn btn-solid" href="/assembling">see the agentic journey →</Link>
              <Link className="btn btn-glass" href="/ai-ready">see your industry&apos;s journey, drafted</Link>
            </div>
          </div>
        </div>

        <CineFooter />
      </div>
    </div>
  );
}
