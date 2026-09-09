'use client';

import { BlueprintScene } from '@/components/agent-app/BlueprintScene';
import { ArcAssembleParts } from '@/components/arc/ArcPlanSvg';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';

/** Arc assemble stage — BlueprintScene with terrace part set. */
export function ArcAssembleStage() {
  return (
    <BlueprintScene
      sectionId="arc-assemble"
      titleId="arc-assemble-title"
      eyebrow={ARC_PREVIEW.assembleEyebrow}
      title={ARC_PREVIEW.assembleTitle}
      support={ARC_PREVIEW.assembleSupport}
      titleBlock={[
        { label: 'PROJECT', value: 'Harbour terrace · DEMO' },
        { label: 'DRAWING', value: 'GA plan · A1' },
        { label: 'SCALE', value: '1:100' },
        { label: 'REV', value: 'P0 · preview' },
      ]}
      caption="fictional Auckland terrace · sample business · details fictional"
      ariaLabel="DEMO Auckland terrace plan assembling from flat-lay parts"
      gridPatternId="arc-eng-grid"
    >
      <ArcAssembleParts />
    </BlueprintScene>
  );
}
