import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { getVertical } from '@/lib/verticals/config';
import { verticalMetadata, verticalViewport } from '@/lib/verticals/metadata';
import { VerticalPhone } from '@/components/verticals/VerticalPhone';
import { VerticalAppTools } from '@/components/verticals/VerticalAppTools';

export const viewport = verticalViewport;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const v = getVertical((await params).slug);
  if (!v) return {};
  const metadata = verticalMetadata(v.slug);
  return { ...metadata, title: { absolute: `${v.name} · assembl` }, description: v.description, robots: { index: false, follow: false }, alternates: { canonical: `/agents/${v.slug}/app` }, openGraph: { ...metadata.openGraph, title: `${v.name} · assembl`, description: v.description, url: `/agents/${v.slug}/app`, type: 'website' } };
}

export default async function VerticalAppPage({ params }: { params: Promise<{ slug: string }> }) {
  const v = getVertical((await params).slug);
  if (!v) notFound();
  return <div className="va-workspace">
    <header className="va-app-header"><a href={`/agents/${v.slug}`} className="va-app-wordmark">{v.name}<span>by assembl</span></a><VerticalAppTools slug={v.slug} app /></header>
    <main className="va-workspace-grid">
      <aside className="va-app-cover">
        <div><p className="va-eyebrow">{v.field}</p><h1>{v.title}</h1><p>{v.description}</p><a href={`/agents/${v.slug}`}>Explore the story<ArrowUpRight size={16} /></a></div>
        <Image src={v.image} alt={v.imageAlt} fill priority sizes="55vw" />
        <span className="va-cover-credit">Illustrative study · assembl</span>
      </aside>
      <VerticalPhone slug={v.slug} native />
    </main>
  </div>;
}
