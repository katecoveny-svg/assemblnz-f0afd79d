import { HERO, POSITIONING } from '@/components/site/assembl-the-work/copy';
import { OG_SIZE, v2OgImage } from '@/lib/v2/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt =
  `assembl. ${HERO.headline} Pursuit, DO and Studio.`;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function HomeOgImage() {
  const artwork = await readFile(join(process.cwd(), 'public/brand/assembl-assembled-plum-og.png'));
  return v2OgImage({
    eyebrow: POSITIONING.newZealand,
    headline: HERO.headline,
    sub: 'Strategy, design and AI agents. Complete business journeys.',
    identityArt: `data:image/png;base64,${artwork.toString('base64')}`,
  });
}
