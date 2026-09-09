import type { TitleBlockField } from '@/lib/agent-app/types';

export function TitleBlock({
  fields,
  className = '',
}: {
  fields: TitleBlockField[];
  className?: string;
}) {
  return (
    <div className={`aa-title-block aa-mono ${className}`.trim()} aria-hidden>
      {fields.map((f) => (
        <div key={f.label} className="aa-title-block-row">
          <span>{f.label}</span>
          <strong>{f.value}</strong>
        </div>
      ))}
    </div>
  );
}
