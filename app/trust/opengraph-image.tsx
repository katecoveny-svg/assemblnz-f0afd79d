import { OG_SIZE, v2OgImage } from '@/lib/v2/og';

export const alt = 'assembl trust — proof, not promises.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function TrustOgImage() {
  return v2OgImage({
    eyebrow: 'trust · in plain english',
    headline: 'proof, not promises',
    sub: 'mana receipts, the knowledge tier model, and the privacy act 2020 posture.',
  });
}
