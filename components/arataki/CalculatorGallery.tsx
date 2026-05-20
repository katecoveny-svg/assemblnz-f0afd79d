import { ToolCard } from './ToolCard';
import type { ToolLink } from '@/lib/arataki/calculators';

export function CalculatorGallery({ tools }: { tools: ToolLink[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </div>
  );
}
