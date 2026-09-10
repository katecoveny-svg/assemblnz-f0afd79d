import Image from 'next/image';
import { ENSEMBLE_BRAND_BOARD, ENSEMBLE_PACKAGE_STAGES } from '@/lib/ensemble/demo-package';

/** The existing café brief, presented as two physical proofs on the studio desk. */
export function EnsembleHeroArtwork() {
  const still = ENSEMBLE_BRAND_BOARD.find((item) => item.id === 'prism-cafe');
  const copy = ENSEMBLE_BRAND_BOARD.find((item) => item.id === 'muse-winter');
  if (!still?.src || !copy?.text) return null;

  return (
    <figure className="ens-hero-visual" aria-label="Sample creative package">
      <div className="ens-proof-desk">
        <div className="ens-proof-register ens-mono" aria-hidden="true">
          <span>Harbour winter brief</span>
          <span>DEMO</span>
        </div>
        <div className="ens-proof-backing" aria-hidden="true" />
        <div className="ens-proof-still">
          <div className="ens-proof-sheet-label ens-mono">
            <span>{still.agent}</span>
            <span>{still.note}</span>
          </div>
          <Image
            src={still.src}
            alt="Prism café campaign sample: a ceramic coffee cup in studio light, staged for review"
            width={1024}
            height={1024}
            sizes="(max-width: 760px) 78vw, (max-width: 1100px) 42vw, 560px"
            priority
          />
          <div className="ens-proof-crop-marks" aria-hidden="true"><i /><i /><i /><i /></div>
        </div>
        <div className="ens-proof-copy">
          <div className="ens-proof-sheet-label ens-mono">
            <span>{copy.agent}</span><span>02 · Copy</span>
          </div>
          <p>{copy.text.split('\n')[0]}</p>
          <span className="ens-proof-copy-status ens-mono">draft-only · DEMO</span>
        </div>
      </div>
      <figcaption className="ens-hero-stamp ens-mono">sample · DEMO · not live media</figcaption>
      <div className="ens-proof-disciplines ens-mono" aria-label="Package disciplines">
        {ENSEMBLE_PACKAGE_STAGES.map((stage) => <span key={stage.id}>{stage.label}</span>)}
      </div>
    </figure>
  );
}
