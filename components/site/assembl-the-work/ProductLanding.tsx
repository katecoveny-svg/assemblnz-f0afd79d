import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { DoFilm } from '@/components/do/DoFilm';
import { PRODUCT_DESTINATIONS, PURSUIT_SITE_ORIGIN } from '@/lib/product-destinations';
import './assembl-the-work.css';
import './product-landing.css';

const content = {
  pursuit: {
    name: 'Pursuit', line: 'find it.', eyebrow: 'RESEARCH. REASON. POSSIBILITY.',
    heading: <>Find the opening.<br />Build the possibility.</>,
    body: 'Bring client context, sources and a useful idea into one pursuit. Prepare work worth taking to the next conversation.',
    action: 'Open your Pursuit hub', photo: '/do/world/atelier-poster.png',
    steps: [
      ['Find a reason to act.', 'Research relevant public signals and the context you supply. Keep the original sources, dates and questions to validate.'],
      ['Shape a credible idea.', 'Bring the customer moment, evidence and a proposed task onto the board. Develop the idea with the agent, then review the result.'],
      ['Make the next conversation useful.', 'Keep the brief, opportunity, demonstrator and review notes in the private client workspace. Share only the experience you approve.'],
    ],
    offer: 'A Pursuit sprint', deliverable: 'A focused opportunity brief, a developed concept and a plan for the next conversation.',
    boundary: 'Your hub holds client work behind sign-in. New workspaces and business connections are set up as part of an agreed engagement.',
  },
  studio: {
    name: 'Studio', line: 'show it.', eyebrow: 'DIRECTION. CRAFT. SOMETHING YOU CAN TRY.',
    heading: <>Give the idea<br />a world of its own.</>,
    body: 'Turn a brief, an opportunity or a piece of work into a demonstrator, website, campaign, film or experience people can step inside.',
    action: 'Open your Creative Studio', photo: '/do/world/atelier-poster.png',
    steps: [
      ['Start with the work.', 'Bring an independent brief, a Pursuit opportunity or a DO result. Agree the audience, brand, useful outcome and what the experience needs to prove.'],
      ['Make it tangible.', 'Build the experience around something a person can see, change or try. Keep the source, prepared work and review decisions together.'],
      ['Review, then take it out.', 'Edit and export the work you approve. Provider connections, publication and project permissions are agreed before external actions are enabled.'],
    ],
    offer: 'A Studio engagement', deliverable: 'An agreed set of demonstrators, websites, campaign, film, pitch or interactive assets. Start with the smallest useful proof.',
    boundary: 'Your creative workspace requires sign-in. Media generation and publication use the providers and permissions agreed for your project.',
  },
} as const;

export function ProductLanding({ product }: { product: 'pursuit' | 'studio' }) {
  const c = content[product];
  const destination = PRODUCT_DESTINATIONS[product];
  const pursuitHub = PURSUIT_SITE_ORIGIN;
  const studioWorkspace = PRODUCT_DESTINATIONS.studio.workspace;
  const doDoor = PRODUCT_DESTINATIONS.do.overview;
  return (
    <div className="atw product-page">
      <section
        className="product-hero"
        style={{
          backgroundImage: `linear-gradient(105deg,#240b21f2 0%,#240b21cc 42%,#654a4e66 72%,#240b2133),radial-gradient(120% 80% at 78% 40%,#916a7040,transparent 55%),url(${c.photo})`,
        }}
      >
        <header className="atw-nav">
          <Link className="atw-wordmark" href="/">
            assembl
          </Link>
          <nav aria-label="Primary">
            <a href={pursuitHub} target="_blank" rel="noopener noreferrer">
              Pursuit
            </a>
            <Link href={doDoor}>DO</Link>
            <a href={studioWorkspace} target="_blank" rel="noopener noreferrer">
              Studio
            </a>
          </nav>
        </header>
        <div className="product-hero-copy">
          <p className="atw-kicker">
            {c.name.toUpperCase()} / {c.eyebrow}
          </p>
          <h1>{c.heading}</h1>
          <p>{c.body}</p>
          <div>
            {product === 'studio' ? (
              <a className="atw-pill" href={studioWorkspace} target="_blank" rel="noopener noreferrer">
                {c.action}
                <ArrowUpRight size={18} />
              </a>
            ) : (
              <a className="atw-pill" href={pursuitHub} target="_blank" rel="noopener noreferrer">
                {c.action}
                <ArrowUpRight size={18} />
              </a>
            )}
            <Link className="atw-text-link" href={`/contact?product=${product}`}>
              Bring a brief
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      {product === 'studio' ? (
        <>
          <section
            className="studio-work atw-section"
            id="studio-work"
            aria-labelledby="studio-work-title"
          >
            <header>
              <div>
                <p className="atw-kicker">OPEN THE WORK. SHOW THE POSSIBILITY.</p>
                <h2 id="studio-work-title">See the work.</h2>
              </div>
              <p>
                Walk the Auckland atelier on the homepage rail, open DO where you already work,
                or step into your Creative Studio workspace.
              </p>
            </header>
            <div className="studio-doors">
              <Link className="atw-text-link" href="/preview/do-world">
                Walk through the atelier
                <ArrowRight size={17} />
              </Link>
              <Link className="atw-text-link" href={doDoor}>
                See how DO works
                <ArrowUpRight size={17} />
              </Link>
              <a className="atw-text-link" href={studioWorkspace} target="_blank" rel="noopener noreferrer">
                Open Creative Studio
                <ArrowUpRight size={17} />
              </a>
            </div>
          </section>
          <DoFilm />
        </>
      ) : null}
      <section className="product-work atw-section">
        <div>
          <p className="atw-kicker">
            {c.name.toUpperCase()} / {c.line.toUpperCase()}
          </p>
          <h2>
            From a brief
            <br />
            to something
            <br />
            worth trying.
          </h2>
        </div>
        <ol>
          {c.steps.map(([title, body], i) => (
            <li key={title}>
              <span>0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="product-offer atw-section">
        <p className="atw-kicker">USE ONE. CONNECT TWO. RUN THE WHOLE LOOP.</p>
        <h2>{c.offer}.</h2>
        <p>{c.deliverable}</p>
        <div>
          <Link className="atw-pill atw-pill-dark" href={`/contact?product=${product}`}>
            Scope the work
            <ArrowUpRight size={18} />
          </Link>
          <a
            className="atw-text-link"
            href={product === 'pursuit' ? pursuitHub : destination.workspace}
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.action}
            <ArrowUpRight size={18} />
          </a>
        </div>
        <small>{c.boundary}</small>
      </section>
      <footer className="atw-footer">
        <Link className="atw-wordmark" href="/">
          assembl
        </Link>
        <p>
          find it. DO it. show it.
          <br />
          Built in New Zealand.
        </p>
        <nav aria-label="Product footer">
          <Link href="/">Home</Link>
          <a
            href={product === 'pursuit' ? pursuitHub : destination.workspace}
            target="_blank"
            rel="noopener noreferrer"
          >
            Your workspace
          </a>
          <Link href="/contact">Contact</Link>
          <Link href="/legal/privacy">Privacy</Link>
        </nav>
        <span>Client work stays in its private workspace.</span>
      </footer>
    </div>
  );
}
