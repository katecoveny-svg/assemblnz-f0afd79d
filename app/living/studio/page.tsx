import type { Metadata } from 'next';
import { AESTHETICS, SPACES, SURFACES, kitById, requireSpace, type Aesthetic, type SpaceId, type Surface } from '@/lib/living';
import { SpaceStudio } from './SpaceStudio';
import '../living.css';

export const metadata: Metadata = {
  title: 'Space Studio — assembl / living',
  description:
    'Show us your space. See three ways to improve it, assemble a design from one modular system, confirm fit on your own measurements and save a quote-ready configuration.',
  robots: { index: false, follow: false },
};

function pick<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Public Space Studio. `?space=`, `?surface=`, `?aesthetic=` and `?kit=`
 * pre-fill the studio from the storefront doors; nothing is persisted
 * server-side and nothing is purchasable.
 */
export default async function SpaceStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ space?: string; surface?: string; aesthetic?: string; kit?: string }>;
}) {
  const sp = await searchParams;
  const kit = sp.kit ? kitById(sp.kit) ?? null : null;
  const space: SpaceId = pick(kit?.space ?? sp.space, SPACES, 'my-room');
  const entry = requireSpace(space);
  const surface: Surface = pick(sp.surface, SURFACES, kit ? 'wall' : entry.surfaces[0]);
  const aesthetic: Aesthetic = pick(kit?.aesthetic ?? sp.aesthetic, AESTHETICS, entry.defaultAesthetic);
  return (
    <div className="lv">
      <SpaceStudio space={space} surface={surface} aesthetic={aesthetic} kit={kit} />
    </div>
  );
}
