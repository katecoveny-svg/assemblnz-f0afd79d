import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt =
  'assembl — purpose-built agents for New Zealand business. Less admin. Make the wait useful.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function HomeOgImage() {
  return v2OgImage({
    eyebrow: 'built in new zealand',
    headline: 'purpose-built agents for new zealand business. less admin. make the wait useful',
    sub: 'specialist agents draft the work. your people approve it.',
  });
}
