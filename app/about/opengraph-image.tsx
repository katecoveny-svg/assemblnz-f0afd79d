import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt = 'about assembl — less admin. make the wait useful.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function AboutOgImage() {
  return v2OgImage({
    eyebrow: 'about assembl',
    headline: 'less admin. make the wait useful',
    sub: 'built in new zealand. founded by kate hudson. agents draft, people decide.',
  });
}
