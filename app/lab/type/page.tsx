import type { Metadata } from 'next';
import { TypeLab } from './TypeLab';

export const metadata: Metadata = {
  title: 'type lab · assembl',
  description: 'Six typographic directions for the homepage headline. Internal.',
  robots: { index: false, follow: false },
};

/* ?only=1…6 renders a single study on its own. Two reasons: it deep-links a
   direction so Kate can look at one without the others arguing with it, and it
   is the only reliable way to photograph these — the preview pane returns a
   blank frame for anything captured below the fold. */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ only?: string }>;
}) {
  const { only } = await searchParams;
  const n = Number(only);
  return <TypeLab only={Number.isFinite(n) && n >= 1 && n <= 6 ? n : undefined} />;
}
