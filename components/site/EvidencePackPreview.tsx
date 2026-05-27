import { CitationChip } from '@/components/site/CitationChip';
import { HairlineRule } from '@/components/site/HairlineRule';

export type EvidencePackPreviewProps = {
  title?: string;
  workflowId?: string;
  reviewer?: string;
  generatedAt?: string;
  accent?: string;
  citations?: string[];
  checks?: string[];
  statusLabel?: string;
  className?: string;
};

export function EvidencePackPreview({
  title = 'Evidence pack preview',
  workflowId = 'ASM-WAI-0148',
  reviewer = 'Named reviewer pending',
  generatedAt = 'Generated at review time',
  accent = 'var(--assembl-pounamu)',
  citations = ['Privacy Act 2020', 'Health and Safety at Work Act 2015', 'Building Act 2004'],
  checks = ['Source record attached', 'Named human reviewer', 'Audit record kept'],
  statusLabel = 'Reviewed',
  className = '',
}: EvidencePackPreviewProps) {
  return (
    <article
      className={`overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/70 shadow-card ${className}`}
      style={{ ['--preview-accent' as string]: accent }}
    >
      <div className="border-l-4 p-5" style={{ borderColor: accent }}>
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Evidence pack
            </p>
            <h3 className="mt-2 font-display text-3xl font-light leading-none text-[color:var(--text-primary)]">
              {title}
            </h3>
          </div>
          <div className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ borderColor: `${accent}55`, color: accent }}>
            {statusLabel}
          </div>
        </div>

        <HairlineRule className="my-5" accent={accent} />

        <dl className="grid gap-3 text-sm text-[color:var(--text-body)] sm:grid-cols-3">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">Record ID</dt>
            <dd className="mt-1">{workflowId}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">Reviewer</dt>
            <dd className="mt-1">{reviewer}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">Timestamp</dt>
            <dd className="mt-1">{generatedAt}</dd>
          </div>
        </dl>

        <div className="mt-5 grid gap-4">
          <div className="space-y-2 rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)]/70 p-4">
            {checks.map((check) => (
              <div key={check} className="flex items-center gap-3 text-sm text-[color:var(--text-body)]">
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                {check}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap content-start gap-2">
            {citations.map((citation) => (
              <CitationChip key={citation} accent={accent}>
                {citation}
              </CitationChip>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
