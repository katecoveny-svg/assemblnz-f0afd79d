import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { widgetSpec } from '@/lib/living';
import { ProductWidget } from './ProductWidget';
import '../../living.css';
import '../widget.css';

export const metadata: Metadata = {
  title: 'Product widget — assembl / living',
  robots: { index: false, follow: false },
};

/**
 * One product, made yours. Embedded by stores through /living/widget.js
 * (`?embed=1&origin=<store origin>`), or opened directly. Nothing is sold
 * here; the item configuration travels to the host page's own form.
 */
export default async function ProductWidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ embed?: string; origin?: string }>;
}) {
  const { handle } = await params;
  const sp = await searchParams;
  if (!widgetSpec(handle)) notFound();
  const embed = sp.embed === '1';
  const origin = embed && sp.origin && /^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(sp.origin) ? sp.origin : null;
  return <ProductWidget handle={handle} embed={embed} origin={origin} />;
}
