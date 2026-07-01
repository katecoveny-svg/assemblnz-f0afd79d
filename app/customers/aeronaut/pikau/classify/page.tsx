import type { Metadata } from 'next';
import { ClassifyTool } from './ClassifyTool';
import { PageHeader } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'HS Classify' };

export default function ClassifyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Pīkau intelligence"
        title="HS classification"
        lead="Describe the goods and Pīkau suggests HS headings with General Rules of Interpretation (GRI) reasoning, an indicative duty rate, FTA preference eligibility, and whether to seek a binding tariff ruling. Three candidates, always — a licensed broker selects and confirms."
      />
      <ClassifyTool />
    </div>
  );
}
