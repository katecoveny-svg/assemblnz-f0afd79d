import { OG_SIZE, v2OgImage } from '@/lib/v2/og';
import { bundleBySlug } from '@/lib/marketplace/bundles';

export const alt = 'assembl — purpose-built collection';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function BundleOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = bundleBySlug(slug);
  const first = bundle ? (bundle.subtitle.split(/(?<=\.)\s/)[0] ?? bundle.subtitle) : '';
  return v2OgImage({
    eyebrow: bundle ? `collection · ${bundle.category}` : 'collection',
    headline: bundle ? bundle.name.toLowerCase() : 'collections',
    sub: first ? first.charAt(0).toLowerCase() + first.slice(1) : undefined,
  });
}
