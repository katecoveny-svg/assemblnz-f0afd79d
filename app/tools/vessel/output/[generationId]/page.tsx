import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

type Params = { generationId: string };

type GenerationRow = {
  id: string;
  brand_slug: string | null;
  brand_name: string;
  brand_color: string;
  prompt: string;
  image_url: string;
  byok: boolean;
  created_at: string;
};

async function loadGeneration(id: string): Promise<GenerationRow | null> {
  try {
    const service = getServiceClient();
    const { data } = await service
      .from('vessel_generations')
      .select('id,brand_slug,brand_name,brand_color,prompt,image_url,byok,created_at')
      .eq('id', id)
      .maybeSingle();
    return (data as GenerationRow | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { generationId } = await params;
  const row = await loadGeneration(generationId);
  if (!row) return { title: 'vessel' };
  return {
    title: `${row.brand_name} vessel`,
    description: row.prompt,
    openGraph: {
      title: `${row.brand_name} vessel`,
      description: row.prompt,
      images: [{ url: row.image_url }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [row.image_url],
    },
  };
}

export default async function VesselOutputPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { generationId } = await params;
  const row = await loadGeneration(generationId);
  if (!row) notFound();

  const issuedAt = new Intl.DateTimeFormat('en-NZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Pacific/Auckland',
  }).format(new Date(row.created_at));

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)]">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-12 md:px-10 md:pt-16">
        <header className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              assembl · vessel
            </p>
            <h1 className="font-display mt-2 text-3xl leading-tight text-[color:var(--text-primary)] md:text-4xl">
              {row.brand_name}
            </h1>
          </div>
          <div className="text-xs text-[color:var(--text-secondary)]">{issuedAt} NZT</div>
        </header>

        <figure className="overflow-hidden rounded-md border border-[rgba(35,33,31,0.10)] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.image_url}
            alt={`Vessel generated for ${row.brand_name}: ${row.prompt}`}
            className="block w-full"
          />
          <figcaption className="border-t border-[rgba(35,33,31,0.10)] px-5 py-4 text-sm text-[color:var(--text-secondary)]">
            <span className="font-display text-[color:var(--text-primary)]">
              {row.prompt}
            </span>
            <span className="ml-3 inline-flex items-center gap-2 align-middle">
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: row.brand_color }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.28em]">
                {row.brand_color}
              </span>
            </span>
          </figcaption>
        </figure>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(35,33,31,0.10)] pt-6 text-xs text-[color:var(--text-secondary)]">
          <span>
            Generated via{' '}
            <Link
              href={row.brand_slug ? `/tools/vessel/${row.brand_slug}` : '/tools/vessel'}
              className="underline-offset-2 hover:underline"
            >
              the assembl vessel generator
            </Link>
            .
          </span>
          <Link href="/pilot-sprint" className="underline-offset-2 hover:underline">
            Run this on your real work in a Pilot Sprint →
          </Link>
        </div>
      </div>
    </main>
  );
}
