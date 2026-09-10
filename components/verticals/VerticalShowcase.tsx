import Image from 'next/image';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { VERTICALS, type VerticalSlug } from '@/lib/verticals/config';
import { VerticalPhone } from './VerticalPhone';

export function VerticalShowcase({ slug }: { slug: VerticalSlug }) {
  const v = VERTICALS[slug];
  return <section className="va-showcase" id="live-agent" aria-labelledby={`va-title-${slug}`}>
    <div className="va-showcase-copy">
      <p className="va-eyebrow"><span>In your hands</span><ArrowDownRight size={18} aria-hidden /></p>
      <h2 id={`va-title-${slug}`}>{v.title}</h2>
      <p className="va-intro">{v.description}</p>
      <a className="va-text-link" href={`/agents/${slug}/app`}>Open {v.name} as an app<ArrowUpRight size={18} aria-hidden /></a>
      <figure className="va-object-study"><Image src={v.image} alt={v.imageAlt} width={800} height={600} sizes="(max-width: 780px) 90vw, 42vw" /><figcaption><span>{v.field}</span><span>Illustrative study</span></figcaption></figure>
      <div className="va-how"><span>01 · Ask</span><span>02 · Prepare</span><span>03 · Review</span></div>
      <p className="va-small va-showcase-note">A real reply from {v.agentName}. You review the draft before taking it to your {v.reviewer.toLowerCase()}.</p>
    </div>
    <VerticalPhone slug={slug} />
  </section>;
}
