import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt = 'about assembl — less admin. more mahi.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function AboutOgImage() {
  return v2OgImage({
    eyebrow: 'about assembl',
    headline: 'less admin. more mahi',
    sub: 'built in aotearoa. founded by kate hudson. agents draft, people decide.',
  });
}
