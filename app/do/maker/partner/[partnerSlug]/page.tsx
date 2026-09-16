import { redirect } from 'next/navigation';
import { getPartnerSkin, partnerMakerHref, type PartnerSlug } from '@/lib/studio/task-do-maker';

type PageProps = {
  params: Promise<{ partnerSlug: string }>;
};

/**
 * Thin DO-namespace alias for Mode B partner skins.
 * Canonical maker remains /studio/do-maker?mode=partner&partner=<slug>
 */
export default async function PartnerDoMakerAliasPage({ params }: PageProps) {
  const { partnerSlug } = await params;
  const skin = getPartnerSkin(partnerSlug);
  if (!skin) {
    redirect('/studio/do-maker?mode=partner&partner=bp');
  }
  redirect(partnerMakerHref(skin.slug as PartnerSlug));
}
