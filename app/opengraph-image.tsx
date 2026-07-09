import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt = 'assembl — mahi that earns its proof.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function HomeOgImage() {
  return v2OgImage({
    eyebrow: 'built in aotearoa',
    headline: 'mahi that earns its proof',
    sub: 'specialist agents draft the work. your people approve it.',
  });
}
