import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { GlowDoWidget } from './GlowDoWidget';
import { DoFilm } from '@/components/do/DoFilm';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
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

const studies = [
  { id: 'world', title: 'Step inside the idea.', type: '3D / INTERACTIVE STUDY', image: '/do/world/atelier-poster.png', href: '/preview/do-world', action: 'Walk through the atelier', description: 'A Blender-authored world with a scroll-led camera, an accessible still view and three connected spaces.', status: 'Architectural study. Not live agent activity.' },
  { id: 'maker', title: 'Give the work its own DO.', type: 'PRODUCT / TASK DO MAKER', image: '/do/canvas/dimensional-d.png', href: '/studio/do-maker', action: 'Try the Task DO Maker', description: 'Shape a task-specific DO from purpose, context and permissions. Review the definition before taking it further.', status: 'Preview and export. Not an activated worker.' },
  { id: 'office', title: 'Make the next step visible.', type: 'INTERFACE / SPATIAL PROJECTION', image: '/do/office/office-poster.webp', href: '/do/office', action: 'Open DO Office', description: 'A spatial view paired with a readable board for work, decisions and receipts.', status: 'Office preview. Saved jobs and execution are distinct.' },
] as const;

export function ProductLanding({ product }: { product: 'pursuit' | 'studio' }) {
  const c = content[product];
  const destination = PRODUCT_DESTINATIONS[product];
  return <div className="atw product-page">
    <GlowDoWidget />
    <section className="product-hero" style={{ backgroundImage: `linear-gradient(90deg,#240b21ed,#240b2180 55%,#240b2133),url(${c.photo})` }}>
      <header className="atw-nav"><Link className="atw-wordmark" href="/">assembl</Link><nav aria-label="Primary"><Link href="/pursuit" aria-current={product === 'pursuit' ? 'page' : undefined}>Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio" aria-current={product === 'studio' ? 'page' : undefined}>Studio</Link></nav></header>
      <div className="product-hero-copy"><p className="atw-kicker">{c.name.toUpperCase()} / {c.eyebrow}</p><h1>{c.heading}</h1><p>{c.body}</p><div>
        {product === 'studio' ? <a className="atw-pill" href="#studio-work">See the work <ArrowRight size={18} /></a> : <a className="atw-pill" href={destination.workspace}>{c.action}<ArrowUpRight size={18} /></a>}
        <Link className="atw-text-link" href={`/contact?product=${product}`}>Bring a brief<ArrowUpRight size={18} /></Link>
      </div><small className="product-hero-note">An imagined atelier. The work below is labelled by its actual state.</small></div>
    </section>
    {product === 'studio' && <>
      <section className="studio-work atw-section" id="studio-work" aria-labelledby="studio-work-title">
        <header><div><p className="atw-kicker">OPEN IT. MOVE THROUGH IT. TRY IT.</p><h2 id="studio-work-title">See the work.</h2></div><p>Existing assembl studies and product experiences. Open each one to see what it does and what still needs connecting.</p></header>
        <div className="studio-studies">{studies.map(study => <article className={`studio-study studio-study-${study.id}`} key={study.id}>
          <Link className="studio-study-image" href={study.href} aria-label={study.action}><Image src={study.image} alt="" fill sizes={study.id === 'world' ? '(max-width:650px) 100vw, 70vw' : '(max-width:650px) 100vw, 40vw'} /><span>{study.type}</span><ArrowUpRight size={26} aria-hidden="true" /></Link>
          <div className="studio-study-copy"><h3>{study.title}</h3><p>{study.description}</p><Link className="atw-text-link" href={study.href}>{study.action}<ArrowUpRight size={17} /></Link><small>{study.status}</small></div>
        </article>)}</div>
      </section>
      <DoFilm />
    </>}
    <section className="product-work atw-section"><div><p className="atw-kicker">{c.name.toUpperCase()} / {c.line.toUpperCase()}</p><h2>From a brief<br />to something<br />worth trying.</h2></div><ol>{c.steps.map(([title, body], i) => <li key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>
    <section className="product-offer atw-section"><p className="atw-kicker">USE ONE. CONNECT TWO. RUN THE WHOLE LOOP.</p><h2>{c.offer}.</h2><p>{c.deliverable}</p><div><Link className="atw-pill atw-pill-dark" href={`/contact?product=${product}`}>Scope the work<ArrowUpRight size={18} /></Link><a className="atw-text-link" href={destination.workspace}>{c.action}<ArrowUpRight size={18} /></a></div><small>{c.boundary}</small></section>
    <footer className="atw-footer"><Link className="atw-wordmark" href="/">assembl</Link><p>find it. DO it. show it.<br />Built in New Zealand.</p><nav aria-label="Product footer"><Link href="/">Home</Link><a href={destination.workspace}>Your workspace</a><Link href="/contact">Contact</Link><Link href="/legal/privacy">Privacy</Link></nav><span>Client work stays in its private workspace.</span></footer>
  </div>;
}
