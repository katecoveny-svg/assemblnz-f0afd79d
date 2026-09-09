'use client';

import { PlanPins } from '@/components/agent-app/PlanPins';
import { ArcTerraceUnderlay } from '@/components/arc/ArcPlanSvg';
import { ARC_DEMO_VIOLATIONS } from '@/lib/arc/demo-violations';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';

/** Arc model demo — PlanPins with terrace GA underlay. */
export function ArcModelDemo() {
  return (
    <PlanPins
      id="arc-model"
      pins={ARC_DEMO_VIOLATIONS}
      titleBlock={[
        { label: 'SHEET', value: 'Issues overlay · DEMO' },
        { label: 'CODES', value: 'NZBC / AUP-class' },
        { label: 'STATUS', value: 'staged · not lodged' },
      ]}
      underlay={<ArcTerraceUnderlay />}
      caption="harbour terrace GA · DEMO pins · NZBC / AUP-class citations"
      demoBadge={ARC_PREVIEW.demoBadge}
      evidenceLabel={ARC_PREVIEW.evidenceLabel}
      ariaLabel="DEMO terrace plan with clickable NZ code pins"
      gridPatternId="arc-eng-grid-pins"
    />
  );
}
