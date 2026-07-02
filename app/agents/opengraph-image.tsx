import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt = 'assembl — discover agents. explore purpose-built collections.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function AgentsOgImage() {
  return v2OgImage({
    eyebrow: 'agent marketplace',
    headline: 'discover agents',
    sub: 'purpose-built collections that work together across your business.',
  });
}
