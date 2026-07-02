import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt = 'assembl — purpose-built agents. limitless potential.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function HomeOgImage() {
  return v2OgImage({
    eyebrow: 'built in aotearoa',
    headline: 'purpose-built agents. limitless potential',
    sub: 'specialist agents draft the work. your people approve it.',
  });
}
