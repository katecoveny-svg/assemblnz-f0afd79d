import { LivingSiteDashboard } from '@/components/living-site/LivingSiteDashboard';
import { getBrandFonts } from '@/lib/brand/fonts';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import type { SampleVertical } from '@/lib/living-site/verticals';

/**
 * Shared renderer for every fictional vertical and visitor-generated install.
 * The server owns font loading; the client dashboard owns navigation and
 * interactions. One shell keeps every Living Site visibly part of the same OS.
 */
export function SampleSite({
  v,
  facts,
  live,
  install,
}: {
  v: SampleVertical;
  facts: GenomeFact[];
  live: boolean;
  install?: { id: string };
}) {
  const fonts = getBrandFonts(v.fontSlug);
  const brandVars = `${fonts.display.variable} ${fonts.body.variable} ${fonts.mono.variable}`;

  return (
    <div className={brandVars}>
      <LivingSiteDashboard v={v} facts={facts} live={live} install={install} />
    </div>
  );
}
