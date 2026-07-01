/**
 * Bundle display metadata — the CODE mirror of public.bundles, used to render
 * the bundle cards on the shelf and the /bundles/<slug> detail pages.
 *
 * Kaitiaki is the eighth bundle (animal health, welfare, service & conservation)
 * per KAITIAKI-VERTICAL-SPEC-2026-06-29-v2. Lead agent: Keeper. The specialty
 * slugs + ordering below drive the three grouped sections on /bundles/kaitiaki;
 * per-agent copy lives in lib/marketplace/agents.ts (bundleAgents('kaitiaki')).
 */

export type BundleGroup = {
  /** section label on the bundle page */
  label: string;
  /** one-line section blurb */
  blurb: string;
  /** specialty slugs, in display order */
  slugs: string[];
};

export type BundleMeta = {
  slug: string;
  name: string;
  /** te reo label — kept where it earns its place (feedback_te_reo_lighter) */
  teReo: string;
  /** the bundle-page subtitle */
  subtitle: string;
  /** vertical / category */
  category: string;
  /** front-door lead agent slug */
  leadSlug: string;
  /** one-line pitch for the shelf card */
  shortPitch: string;
  /** headline bundle price (NZD/mo) */
  monthlyNzd: number;
  /** standalone per-seat price (NZD/mo) */
  seatNzd: number;
  /** AgentIcon key */
  icon: string;
  /** cream/canary accent */
  accent: string;
  groups: BundleGroup[];
};

export const KAITIAKI_BUNDLE: BundleMeta = {
  slug: 'kaitiaki',
  name: 'Kaitiaki',
  teReo: 'Kaitiakitanga',
  subtitle:
    'Animal care, welfare and conservation, drafted for a licensed vet or authorised welfare officer to sign.',
  category: 'animal',
  leadSlug: 'keeper',
  shortPitch:
    'Animal health, welfare, service and conservation — one front door. Keeper routes to a companion vet, farm, equine or exotic specialist, doggy daycare, welfare triage, wildlife rehab or Threatened Species Recovery.',
  monthlyNzd: 399,
  seatNzd: 199,
  icon: 'paw',
  accent: '#FFF7EC',
  groups: [
    {
      label: 'Vet clinical',
      blurb: 'Companion, production, equine and exotic — a draft for a registered veterinarian to examine and sign.',
      slugs: ['vet-small-animal', 'vet-large-animal', 'vet-equine', 'vet-exotic'],
    },
    {
      label: 'Welfare & service',
      blurb: 'Case triage, multi-agency rescue, and the operating system for a boutique NZ doggy daycare.',
      slugs: ['spca-workflow', 'rescue-coordination', 'doggy-daycare'],
    },
    {
      label: 'Conservation & wildlife',
      blurb:
        'Wildlife hospital, zoo vet, and Threatened Species Recovery. Taonga species never ship model-only — a named kaitiaki reviewer is always in the loop.',
      slugs: ['kakapo-recovery', 'kiwi-conservation', 'wildbase-recovery', 'zoo-vet', 'species-recovery'],
    },
  ],
};

export const BUNDLES: Record<string, BundleMeta> = {
  kaitiaki: KAITIAKI_BUNDLE,
};

export function bundleBySlug(slug: string): BundleMeta | undefined {
  return BUNDLES[slug];
}
