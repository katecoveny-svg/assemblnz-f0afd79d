import { getBrandConfig } from '@/lib/brand/configs';
import { notFound } from 'next/navigation';
import { Brand3DHero } from '@/components/ops/Brand3DHero';
import { FinancePanel } from '@/components/ops/widgets/FinancePanel';
import { RosterTable } from '@/components/ops/widgets/RosterTable';
import { CommsDrafts } from '@/components/ops/widgets/CommsDrafts';
import { CustomerCRM } from '@/components/ops/widgets/CustomerCRM';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import {
  happyTailsRoster,
  happyTailsFinance,
  happyTailsComms,
  happyTailsCustomers,
} from '@/lib/customers/happy-tails/demo-data';

/**
 * Reference implementation — Happy Tails ops landing wired to the demo data
 * set and the real brand imagery.
 *
 * Because Next.js takes the more specific route first, this file is what
 * renders at /customers/happy-tails/ops. The [slug]/ops route is the anchor
 * for the other five brands.
 *
 * The 8-photo array below MUST stay in the same order as `happyTailsCustomers`:
 * Franklin first (anchor), then the 7 gallery portraits. The CRM widget picks
 * `avatars[index % avatars.length]` for each row.
 */
const happyTailsAvatars = [
  '/brand/happy-tails/franklin-black-longhair-rear.png',
  '/brand/happy-tails/dog-tan-play-stance.png',
  '/brand/happy-tails/dog-dalmatian-leap.png',
  '/brand/happy-tails/dog-dalmatian-standing.png',
  '/brand/happy-tails/dog-corgi-tail.png',
  '/brand/happy-tails/dog-husky-fluffy-tail.png',
  '/brand/happy-tails/dog-terrier-tan-tail.png',
  '/brand/happy-tails/dog-poodle-curls.png',
];

export default function HappyTailsOpsHome() {
  const config = getBrandConfig('happy-tails');
  if (!config) notFound();

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <Brand3DHero config={config} />
      <FinancePanel summary={happyTailsFinance} />
      <RosterTable rows={happyTailsRoster} />
      <CustomerCRM customers={happyTailsCustomers} avatars={happyTailsAvatars} />
      <CommsDrafts drafts={happyTailsComms} />
    </div>
  );
}
