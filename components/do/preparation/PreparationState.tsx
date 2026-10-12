import type { PreparationRun } from '@/lib/do/preparation/contracts';
/** Shared receipt/provenance grammar; domains keep their own quantities and timeline. */
export function PreparationState({ run }: { run: PreparationRun | null }) {
  if (!run) return null;
  return <div aria-label="Preparation record">
    <p className="prep-eyebrow">Run {run.runId} · v{run.version} · revision {run.revision}</p>
    <p role="status">Preparation {run.status} · {run.execution} · external action: none</p>
    <details><summary>Preparation provenance</summary><ul>{run.provenance.map(e => <li key={e.id}>{e.label}: {e.detail} · source {e.sourceRef} · observed {e.createdAt}</li>)}</ul></details>
  </div>;
}
