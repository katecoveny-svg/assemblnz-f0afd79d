import { SocialStudio } from '@/components/ops/shared/SocialStudio';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { OsScrollReveal } from '@/components/ops/shared/OsMotion';

/**
 * TOA practice social desk — LinkedIn / Instagram drafts from site stills.
 * Concept pitch only; not endorsed by TOA Architects.
 */
export default function ToaSocialPage() {
  return (
    <div className="flex flex-col gap-5">
      <DemoRibbon />
      <OsScrollReveal>
        <SocialStudio pilot="toa-architects" />
      </OsScrollReveal>
    </div>
  );
}
