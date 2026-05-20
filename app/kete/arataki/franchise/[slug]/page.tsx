import { notFound } from 'next/navigation';
import { FranchisePage } from '@/components/arataki/FranchisePage';
import { franchisePages, franchiseSlugs, type FranchiseSlug } from '@/lib/arataki/franchises';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return franchiseSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const content = franchisePages[slug as FranchiseSlug];
  if (!content) return {};
  return {
    title: `${content.brand} dealerships — Arataki`,
    description: content.sub,
  };
}

export default async function AratakiFranchiseRoute({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const content = franchisePages[slug as FranchiseSlug];
  if (!content) notFound();
  return <FranchisePage content={content} />;
}
