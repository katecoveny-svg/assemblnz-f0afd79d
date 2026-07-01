import { getBrandConfig } from '@/lib/brand/configs';
import { notFound } from 'next/navigation';
import { Brand3DHero } from '@/components/ops/Brand3DHero';
import { FinancePanel } from '@/components/ops/widgets/FinancePanel';
import { RosterTable } from '@/components/ops/widgets/RosterTable';
import { CommsDrafts } from '@/components/ops/widgets/CommsDrafts';
import { CustomerCRM } from '@/components/ops/widgets/CustomerCRM';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import {
  aucklandZooRoster,
  aucklandZooFinance,
  aucklandZooComms,
  aucklandZooCustomers,
} from '@/lib/customers/auckland-zoo/demo-data';

/**
 * Auckland Zoo ops landing — wired to the demo data set and the real brand
 * imagery Kate uploaded on 2026-07-01. Mirrors the Happy Tails reference
 * implementation.
 *
 * The 6-photo array below MUST stay in the same order as
 * `aucklandZooCustomers`: giraffe (anchor) first, then red panda, lionesses,
 * squirrel monkey, Asian elephant, otter. The CRM widget picks
 * `avatars[index % avatars.length]` for each row.
 *
 * Cultural rule: the four taonga species called out in the brief are
 * kaumātua-hold. The prior taonga-species parallax hero has been removed. Do
 * not add those species to this page, hero, config, or demo data without
 * sign-off.
 */
const aucklandZooAvatars = [
  '/brand/auckland-zoo/portrait-giraffe.png',
  '/brand/auckland-zoo/portrait-red-panda.png',
  '/brand/auckland-zoo/portrait-lionesses.png',
  '/brand/auckland-zoo/portrait-squirrel-monkey.png',
  '/brand/auckland-zoo/portrait-asian-elephant.png',
  '/brand/auckland-zoo/portrait-otter.png',
];

export default function AucklandZooOpsHome() {
  const config = getBrandConfig('auckland-zoo');
  if (!config) notFound();

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <Brand3DHero config={config} />
      <FinancePanel summary={aucklandZooFinance} />
      <RosterTable rows={aucklandZooRoster} />
      <CustomerCRM customers={aucklandZooCustomers} avatars={aucklandZooAvatars} />
      <CommsDrafts drafts={aucklandZooComms} />
    </div>
  );
}
