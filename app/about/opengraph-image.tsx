import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt = 'About assembl — business intelligence, strategy and software. Built in Aotearoa New Zealand.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function AboutOgImage() {
  return v2OgImage({
    eyebrow: 'about assembl',
    headline: 'Good thinking. Useful work.',
    sub: 'Business intelligence, strategy and software. Built in Aotearoa New Zealand. Agents help prepare the work; people review the decisions.',
  });
}
