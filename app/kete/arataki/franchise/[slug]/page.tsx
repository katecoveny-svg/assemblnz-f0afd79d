import { notFound } from 'next/navigation';
import { FranchisePage } from '@/components/arataki/FranchisePage';
import { franchisePages, type FranchiseSlug } from '@/lib/arataki/franchises';

type Params = { slug: string };

export const dynamic = 'force-dynamic';

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
