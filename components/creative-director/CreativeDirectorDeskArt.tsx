/**
 * Hero desk plate — Ensemble-family proof surface for Creative Director.
 * Creative desk DNA (layered plates), never architecture floor-plan.
 */

'use client';

const STAGES = [
  { n: '01', label: 'Understand' },
  { n: '02', label: 'Art direct' },
  { n: '03', label: 'Targets' },
  { n: '04', label: 'Construct' },
  { n: '05', label: 'Critic' },
] as const;

export function CreativeDirectorDeskArt() {
  return (
    <figure className="cd-hero-visual" aria-label="Creative director desk — DEMO plate">
      <div className="cd-proof-desk">
        <div className="cd-proof-register cd-mono">
          <span>studio desk</span>
          <span>DEMO</span>
        </div>

        <div className="cd-proof-backing" aria-hidden="true" />

        <div className="cd-proof-still">
          <p className="cd-proof-sheet-label cd-mono">direction board</p>
          <ol className="cd-proof-stages">
            {STAGES.map((s) => (
              <li key={s.n}>
                <span className="cd-mono">{s.n}</span>
                <strong>{s.label}</strong>
              </li>
            ))}
          </ol>
        </div>

        <div className="cd-proof-copy">
          <p className="cd-proof-copy-status cd-mono">idea → direction → world</p>
          <p>Three directions before a single line of construct.</p>
          <span className="cd-mono">sample business · details fictional</span>
        </div>
      </div>
      <figcaption className="cd-hero-stamp cd-mono">
        creative director · PREVIEW plate
      </figcaption>
    </figure>
  );
}
