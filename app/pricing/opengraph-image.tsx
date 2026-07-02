import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt = 'assembl pricing — one ladder, no surprises.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function PricingOgImage() {
  return v2OgImage({
    eyebrow: 'pricing',
    headline: 'one ladder. no surprises',
    sub: 'tōro · operator · leader · enterprise · outcome — all prices nzd.',
  });
}
