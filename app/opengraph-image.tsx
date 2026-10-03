import { OG_SIZE, v2OgImage } from '@/lib/v2/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt =
  'assembl. Assemble useful work. Strategy, design and AI. Pursuit, DO and Studio.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function HomeOgImage() {
  const artwork = await readFile(join(process.cwd(), 'public/brand/assembl-assembled-plum-og.png'));
  return v2OgImage({
    eyebrow: 'built in new zealand',
    headline: 'Assemble useful work.',
    sub: 'Strategy, design and AI for useful work and better customer experiences.',
    identityArt: `data:image/png;base64,${artwork.toString('base64')}`,
  });
}
