import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, breadcrumbNode, SITE_URL } from '@/lib/seo/schema';
import './industries.css';

/**
 * /industries — what assembl works in, evidenced by what actually exists.
 *
 * Kate, 29 July 2026: "I need to have somewhere on the site what are the
 * industries that assembl supports."
 *
 * Every industry here is backed by a working concept — the wait named is the
 * one that industry actually has, and the link goes to a live demonstrator you
 * can walk through. Where a concept is for a named business it is an
 * INDEPENDENT concept, never a client relationship, so this page speaks in
 * sectors and links to the demonstrators.
 */

export const metadata: Metadata = {
  title: 'Industries — where agentic customer journeys already work',
  description:
    'The industries assembl works in: insurance, lending, energy, retail, logistics, property, retirement living, travel, tax and construction — each with a working concept you can walk through.',
  alternates: { canonical: '/industries' },
  openGraph: {
    title: 'Industries — assembl',
    description: 'Insurance, lending, energy, retail, logistics, property, retirement, travel, tax, construction — each with a live concept.',
  },
};

type Industry = {
  name: string;
  wait: string;
  what: string;
  demo?: { label: string; href: string };
  status?: 'coming';
};

const INDUSTRIES: Industry[] = [
  {
    name: 'General insurance',
    wait: 'Lodgement to decision — measured in weeks, felt as silence.',
    what: 'The claim prepared in the open: photos read, the assessor booked, the decision drafted for a person. One question — is your home liveable tonight — reorders the queue.',
    demo: { label: 'walk the claims concept', href: 'https://assembling-tower.pages.dev' },
  },
  {
    name: 'Health insurance',
    wait: 'Prior approval before a procedure — the silence between diagnosis and theatre.',
    what: 'The approval assembled like a surgical checklist, each line of the quote tested against the plan, with the cases that need a person held back from the run.',
    demo: { label: 'walk the remediation concept', href: 'https://assembling-southern-cross.pages.dev' },
  },
  {
    name: 'Lending & consumer finance',
    wait: 'The gap between a quote and money landing, usually under pressure.',
    what: 'The statement reads itself into lanes while affordability checks light green — and a person signs before anything moves.',
    demo: { label: 'walk the lending concept', href: 'https://assembling-nectar.pages.dev' },
  },
  {
    name: 'Banking',
    wait: 'A home-loan application against an offer deadline.',
    what: 'The engine room made visible: valuation ordered, serviceability tested, policy slots checked — ending at a named assessor, never a machine decision.',
    demo: { label: 'walk the banking demonstrator', href: 'https://assembling-demo-banking.pages.dev' },
  },
  {
    name: 'Investing & KiwiSaver',
    wait: 'A transfer that goes dark for days while savings are in transit.',
    what: 'The money shown in motion — old provider, the middle leg, landed — with the portfolio assembling as the cash clears.',
    demo: { label: 'walk the investing concept', href: 'https://assembling-sharesies.pages.dev' },
  },
  {
    name: 'Tax & fintech',
    wait: 'End of financial year: filed, then assessed, in silence.',
    what: 'The year replayed — every invoice splitting into its streams as it happened — ending on one number that was already paid along the way.',
    demo: { label: 'walk the tax concept', href: 'https://assembling-hnry.pages.dev' },
  },
  {
    name: 'Postal & logistics',
    wait: '“Out for delivery” — a six-hour window at somebody’s door.',
    what: 'The real network lit up, scan by scan, to the van on your street — and one answer (a safe place) that ends the redelivery loop.',
    demo: { label: 'walk the parcel concept', href: 'https://assembling-nzpost.pages.dev' },
  },
  {
    name: 'Marketplace & property',
    wait: 'The silence after a rental application, or a listing that has gone quiet.',
    what: 'A key being cut — a notch for each completed check — and a vendor note drafted from what the listing data actually says.',
    demo: { label: 'walk the property concept', href: 'https://assembling-trademe.pages.dev' },
  },
  {
    name: 'Energy & utilities',
    wait: 'Switch limbo, and the bill nobody can explain.',
    what: 'The switch shown day by day, the bill explained against the actual weather, and a free hour placed on tonight’s real demand curve.',
    demo: { label: 'walk the energy concept', href: 'https://assembling-electrickiwi.pages.dev' },
  },
  {
    name: 'Grocery & retail',
    wait: 'The picking window — decided without the shopper.',
    what: 'The trolley picked live, aisle by aisle, with every substitution raised as a card to approve rather than a doorstep surprise.',
    demo: { label: 'walk the grocery demonstrator', href: 'https://assembling-demo-grocery.pages.dev' },
  },
  {
    name: 'Subscription & meal kits',
    wait: 'Delivery day — when takeaways steal the night.',
    what: 'Tonight’s dinner assembling on the bench, substitutions explained rather than swapped silently, the window tightened to forty minutes.',
    demo: { label: 'walk the meal-kit concept', href: 'https://assembling-myfoodbag.pages.dev' },
  },
  {
    name: 'Retirement living & care',
    wait: 'The exit repayment — a family waiting months, mid-grief, while fees accrue.',
    what: 'The relicensing pipeline in the open — refurbishment, listing, viewings, settlement — and a question that can release money early for care.',
    demo: { label: 'walk the retirement demonstrator', href: 'https://assembling-demo-retirement.pages.dev' },
  },
  {
    name: 'Airlines & travel',
    wait: 'The gap between a cancellation and a new itinerary.',
    what: 'Three ways home assembled with seats held while you choose — group kept together, earliest arrival, fewest connections — ticketed by a person.',
    demo: { label: 'walk the airline demonstrator', href: 'https://assembling-demo-airline.pages.dev' },
  },
  {
    name: 'Trades & professional services',
    wait: 'The quote that takes three evenings to write.',
    what: 'The quote drafted from your own rates and terms while the customer is still interested — held at draft until you approve it.',
    demo: { label: 'see the journey', href: '/concepts' },
  },
  {
    name: 'Construction & architecture',
    wait: 'The gap between a question about the model and someone with a licence to answer it.',
    what: 'Your IFC export becomes something a client can walk in a browser, quantities counted from the model rather than retyped, and a 4D sequence drafted from your programme — every output held for the practice.',
    demo: { label: 'walk the construction demonstrator', href: 'https://assembling-construction.pages.dev' },
  },
];

export default function IndustriesPage() {
  return (
    <main className="ind">
      <JsonLd
        data={graph(
          {
            '@type': 'ItemList',
            '@id': `${SITE_URL}/industries#list`,
            name: 'Industries assembl works in',
            itemListElement: INDUSTRIES.map((i, n) => ({
              '@type': 'ListItem',
              position: n + 1,
              name: i.name,
              description: i.what,
            })),
          },
          breadcrumbNode([
            { name: 'assembl', path: '/' },
            { name: 'Industries', path: '/industries' },
          ]),
        )}
      />
      <div className="ind-wrap">
        <p className="ind-kicker">assembl · intuitive agentic customer journeys</p>
        <h1>The industries<br /><span className="metal">we work in.</span></h1>
        <p className="ind-lede">
          Every industry below has a wait in it — a moment where a customer is left holding
          nothing while real work happens out of sight. We have built a working concept for each
          one, on that industry&rsquo;s own published facts. Walk any of them.
        </p>

        <div className="ind-grid">
          {INDUSTRIES.map((i) => (
            <article key={i.name} className={`ind-card${i.status === 'coming' ? ' soon' : ''}`}>
              <h2>{i.name}</h2>
              <p className="ind-wait"><span>the wait</span>{i.wait}</p>
              <p className="ind-what">{i.what}</p>
              {i.demo ? (
                <a className="ind-go" href={i.demo.href}>{i.demo.label} →</a>
              ) : (
                <span className="ind-soon">in build</span>
              )}
            </article>
          ))}
        </div>

        <div className="ind-foot">
          <p>
            The named-company concepts are <b>independent concepts</b> — built from public
            material to show what that journey could be. They are not clients, and nothing on
            them was built with a customer&rsquo;s data.
          </p>
          <div className="ind-cta-row">
            <Link className="ind-cta" href="/ai-ready">see your own journey, drafted</Link>
            <Link className="ind-cta ghost" href="/assembling">the wait state framework</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
