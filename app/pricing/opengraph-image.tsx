import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt = 'assembl Living Site pricing — prove one working loop.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function PricingOgImage() {
  return v2OgImage({
    eyebrow: 'pricing',
    headline: 'buy the working loop first',
    sub: 'founding pilot · NZ$1,500 + GST · ten working days.',
  });
}
