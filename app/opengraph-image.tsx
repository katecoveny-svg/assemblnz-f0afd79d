import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt = 'assembl — purpose-built agents for New Zealand business. Less admin. More mahi.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function HomeOgImage() {
  return v2OgImage({
    eyebrow: 'built in aotearoa',
    headline: 'purpose-built agents for new zealand business. less admin. more mahi',
    sub: 'specialist agents draft the work. your people approve it.',
  });
}
