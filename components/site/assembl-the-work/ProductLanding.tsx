import Link from 'next/link';
import { ArrowDown, ArrowUpRight, LockKeyhole } from 'lucide-react';
import { StudioGallery } from './ImmersiveExperience';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';
import './assembl-the-work.css';
import './product-landing.css';
import './immersive-studio.css';

const content = {
  pursuit: {
    name:'Pursuit', verb:'find it.', heading:<>Find the opening.<br />Build the possibility.</>,
    body:'Bring signals, source evidence and business context together. Work out what is worth acting on and what the next move should be.',
    action:'Open client hubs', image:'/do/world/atelier-poster.png',
    steps:[['Find a reason to act.','Keep relevant signals with their sources, dates and questions to validate.'],['Shape a credible idea.','Bring the customer moment, evidence and proposed work into one brief.'],['Make the conversation useful.','Keep the opportunity, demonstrator and review notes together. Share only the work you approve.']],
    offer:'A focused Pursuit sprint.', deliverable:'An opportunity brief, a developed concept and a plan for the next conversation.',
  },
  studio: {
    name:'Studio', verb:'show it.', heading:<>Give the idea<br />a world of its own.</>,
    body:'Interactive demonstrations. Websites. Campaigns. Image and film. Turn the possibility into something people can see, change and try.',
    action:'Open Creative Studio', image:'/do/office/office-poster.webp',
    steps:[['Start with the work.','Bring an independent brief, a Pursuit opportunity or a DO result. Agree the audience, the brand and what the experience needs to prove.'],['Make it tangible.','Build the demonstrator, website, campaign or film around something a person can see, change or try.'],['Review. Refine. Release.','Keep the work and review decisions together. Export or publish through the providers and permissions agreed for your project.']],
    offer:'Start with one useful proof.', deliverable:'A demonstrator, website, pitch, campaign or film. Agree the smallest useful scope, then build from there.',
  },
} as const;

export function ProductLanding({product}:{product:'pursuit'|'studio'}) {
  const c=content[product];
  const workspace=PRODUCT_DESTINATIONS[product].workspace;
  return <div className="atw product-page immersive-studio">
    <a className="atw-skip" href="#studio-work">Skip to the work</a>
    <section className="product-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(36,11,33,.72),rgba(36,11,33,.18)),url(${c.image})`}}>
      <header className="atw-nav"><Link className="atw-wordmark" href="/">assembl</Link><nav aria-label="Primary"><Link href="/pursuit" aria-current={product==='pursuit'?'page':undefined}>Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio" aria-current={product==='studio'?'page':undefined}>Studio</Link></nav></header>
      <div className="product-hero-copy"><p className="atw-kicker">{c.name} / {c.verb}</p><h1>{c.heading}</h1><p>{c.body}</p><div><a className="atw-pill" href="#studio-work">See the possibilities <ArrowDown size={18} aria-hidden="true" /></a><a className="atw-text-link" href={workspace} target="_blank" rel="noopener noreferrer">{c.action}<ArrowUpRight size={18} aria-hidden="true" /></a></div><small className="studio-workspace-note"><LockKeyhole size={12} aria-hidden="true" />Your existing private workspace. Sign-in required.</small></div>
    </section>
    {product==='studio'?<StudioGallery />:<section className="product-work atw-section" id="studio-work"><h2>The opportunity.<br />The evidence.<br />The next move.</h2></section>}
    <section className="product-work atw-section"><div><p className="atw-kicker">the work behind the experience</p><h2>From a brief<br />to something<br />worth trying.</h2></div><ol>{c.steps.map(([title,body],index)=><li key={title}><span>0{index+1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>
    <section className="product-offer atw-section"><p className="atw-kicker">use one. connect two. run the whole loop.</p><h2>{c.offer}</h2><p>{c.deliverable}</p><div><Link className="atw-pill atw-pill-dark" href={`/contact?product=${product}`}>Bring a brief <ArrowUpRight size={18} aria-hidden="true" /></Link><a className="atw-text-link" href={workspace} target="_blank" rel="noopener noreferrer">{c.action}<ArrowUpRight size={18} aria-hidden="true" /></a></div><small>Client work stays private. Provider connections, publication and permissions are agreed for each project.</small></section>
    <footer className="atw-footer"><Link className="atw-wordmark" href="/">assembl</Link><p>find it. DO it. show it.<br />Built in New Zealand.</p><nav aria-label="Product footer"><Link href="/">Home</Link><Link href="/pursuit">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link><Link href="/contact">Contact</Link><Link href="/legal/privacy">Privacy</Link></nav><span>Good work comes together.</span></footer>
  </div>;
}
