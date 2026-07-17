import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt = 'assembl pricing — start with one workflow.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function PricingOgImage() {
  return v2OgImage({
    eyebrow: 'pricing',
    headline: 'start with one workflow',
    sub: 'pilot · NZ$1,500 + GST · ten working days.',
  });
}
