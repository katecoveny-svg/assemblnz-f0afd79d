import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt =
  'assembl the work. find it. DO it. show it. Pursuit, DO and Studio.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function HomeOgImage() {
  return v2OgImage({
    eyebrow: 'built in new zealand',
    headline: 'assembl the work. find it. DO it. show it.',
    sub: 'Pursuit finds opportunities. DO prepares the work. Studio makes it visible.',
  });
}
