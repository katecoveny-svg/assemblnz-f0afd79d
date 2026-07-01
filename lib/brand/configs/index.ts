import type { BrandConfig } from '@/lib/brand/brand-config';
import { happyTailsConfig } from '@/lib/brand/configs/happy-tails';
import { airNzConfig } from '@/lib/brand/configs/air-nz';
import { everydayRewardsConfig } from '@/lib/brand/configs/everyday-rewards';
import { aucklandZooConfig } from '@/lib/brand/configs/auckland-zoo';
import { aironautConfig } from '@/lib/brand/configs/aironaut';
import { lulaInnConfig } from '@/lib/brand/configs/lula-inn';

export const brandConfigs: Record<string, BrandConfig> = {
  'happy-tails': happyTailsConfig,
  'air-nz': airNzConfig,
  'everyday-rewards': everydayRewardsConfig,
  'auckland-zoo': aucklandZooConfig,
  aironaut: aironautConfig,
  'lula-inn': lulaInnConfig,
};

export const brandSlugs = Object.keys(brandConfigs) as Array<
  keyof typeof brandConfigs
>;

export function getBrandConfig(slug: string): BrandConfig | undefined {
  return brandConfigs[slug];
}
