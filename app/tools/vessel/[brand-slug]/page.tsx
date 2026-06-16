import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServiceClient } from '@/lib/supabase/service';
import { VesselGenerator } from '@/components/tools/VesselGenerator';

export const dynamic = 'force-dynamic';

type Params = { 'brand-slug': string };

type PresetRow = {
  slug: string;
  brand_name: string;
  brand_color: string;
  logo_url: string | null;
  default_prompt: string | null;
};

async function loadPreset(slug: string): Promise<PresetRow | null> {
  try {
    const service = getServiceClient();
    const { data } = await service
      .from('vessel_brand_presets')
      .select('slug,brand_name,brand_color,logo_url,default_prompt')
      .eq('slug', slug)
      .maybeSingle();
    return (data as PresetRow | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { 'brand-slug': slug } = await params;
  const preset = await loadPreset(slug);
  if (!preset) {
    return { title: 'vessel generator' };
  }
  return {
    title: `${preset.brand_name} vessel generator`,
    description: `Generate an on-brand vessel image for ${preset.brand_name}. Pre-filled with their brand colour.`,
  };
}

export default async function BrandedVesselToolPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { 'brand-slug': slug } = await params;
  const preset = await loadPreset(slug);
  if (!preset) notFound();

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)]">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-12 md:px-10 md:pt-16">
        <header className="mb-10 max-w-3xl">
          <p className="font-mono text-[10px] tracking-[0.28em] text-[color:var(--text-secondary)]">
            assembl · tools · {preset.brand_name.toLowerCase()}
          </p>
          <h1 className="font-display mt-2 text-4xl leading-tight text-[color:var(--text-primary)] md:text-5xl">
            Cast a vessel for {preset.brand_name}.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[color:var(--text-secondary)]">
            Brand colour and starter prompt pre-filled. Tweak the subject, generate, share. Five
            per IP per day — assembl covers generation.
          </p>
        </header>

        <VesselGenerator
          initialPreset={{
            slug: preset.slug,
            brandName: preset.brand_name,
            brandColor: preset.brand_color,
            logoUrl: preset.logo_url,
            defaultPrompt: preset.default_prompt,
          }}
        />

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(35,33,31,0.10)] pt-6 text-xs text-[color:var(--text-secondary)]">
          <span>
            <Link href="/tools/vessel" className="underline-offset-2 hover:underline">
              ← generic vessel generator
            </Link>
          </span>
          <Link href="/pilot-sprint" className="underline-offset-2 hover:underline">
            Run this on your real work in a Pilot Sprint →
          </Link>
        </footer>
      </div>
    </main>
  );
}
