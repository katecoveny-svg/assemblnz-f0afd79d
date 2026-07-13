'use client';

import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import { GENOME_SURFACES } from '@/lib/customers/auckland-dog-trainer/genome';
import type { DomeSurface } from './DomeScene';
import { DomePoster } from './DomePoster';
import styles from './genome-dome.module.css';

/**
 * The Business Genome hero — Kate's liquid-dome spec, end to end:
 * header · interactive glass dome (560px) · click a gold node to open the
 * genome drawer for that surface. WebGL failure or reduced budgets fall
 * back to the PNG with a CSS float. The heavy 3D chunk lazy-loads after
 * first paint; the poster shows immediately.
 */

const DomeScene = dynamic(() => import('./DomeScene'), { ssr: false, loading: () => <Poster /> });

let webglSupport: boolean | null = null;
function detectWebgl(): boolean | null {
  if (webglSupport === null) {
    try {
      const c = document.createElement('canvas');
      webglSupport = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

function Poster() {
  return <DomePoster className={styles.poster} />;
}

export function GenomeDomeExperience({
  facts,
  live,
}: {
  facts: GenomeFact[];
  live: boolean;
}) {
  // WebGL support decides 3D vs the floating PNG (spec fallback). Detected
  // once on the client; the server snapshot says null so hydration matches.
  const webgl = React.useSyncExternalStore(
    () => () => {},
    detectWebgl,
    () => null,
  );

  const [selected, setSelected] = React.useState<DomeSurface | null>(null);
  const [hovered, setHovered] = React.useState<DomeSurface | null>(null);

  const surfaces: DomeSurface[] = React.useMemo(
    () => GENOME_SURFACES.map((s) => ({ id: s.id, name: s.name })),
    [],
  );
  const selectedMeta = selected
    ? GENOME_SURFACES.find((s) => s.id === selected.id)
    : null;
  const selectedFacts = selected
    ? facts.filter((f) => (f.readBy as string[]).includes(selected.id))
    : [];

  return (
    <div className={styles.stage}>
      <h1 style={{ margin: 0 }}>
        <span className={styles.brandline}>assembl</span>
        <span className={styles.wordmark} style={{ display: 'block' }}>
          business genome
        </span>
      </h1>
      <p className={styles.subtitle}>Tāmaki Makaurau as a connected business city. One source of truth beneath the glass.</p>
      <p className={styles.samplenote}>
        sample business — details fictional{live ? ' · reading live from the database' : ''}
      </p>

      <div className={styles.domeBox} aria-label="Interactive Business Genome dome">
        {webgl === false ? <Poster /> : webgl ? (
          <DomeScene surfaces={surfaces} onSelect={setSelected} onHover={setHovered} />
        ) : (
          <Poster />
        )}
      </div>
      <p className={styles.hoverHint} aria-live="polite">
        {hovered ? (
          <>
            <strong>{hovered.name.toLowerCase()}</strong> — click to open the genome
          </>
        ) : webgl ? (
          'each gold node is a surface reading the genome — click one'
        ) : (
          ' '
        )}
      </p>

      <div className={styles.surfaceTray} aria-label="Business Genome surfaces">
        {surfaces.map((surface) => (
          <button key={surface.id} type="button" onClick={() => setSelected(surface)}>
            <span aria-hidden /> {surface.name}
          </button>
        ))}
      </div>

      <nav aria-label="Genome links" className={styles.quietRow}>
        <Link href="/living-site" className={styles.quietLink}>
          the living site tour
        </Link>
        <Link href="/os" className={styles.quietLink}>
          the operating system
        </Link>
        <Link href="/install" className={styles.quietLink}>
          install your own
        </Link>
      </nav>

      {selected ? (
        <>
          <button
            type="button"
            aria-label="Close the genome drawer"
            className={styles.drawerScrim}
            onClick={() => setSelected(null)}
          />
          <aside className={styles.drawer} aria-label={`${selected.name} — genome facts`}>
            <button
              type="button"
              aria-label="Close"
              className={styles.drawerClose}
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <p className={styles.drawerLabel}>reads the genome</p>
            <h2 className={styles.drawerTitle}>{selected.name}</h2>
            {selectedMeta ? <p className={styles.drawerReads}>{selectedMeta.reads}</p> : null}
            {selectedFacts.map((f) => (
              <div key={f.id} className={styles.drawerFact}>
                <p className={styles.drawerFactLabel}>{f.label}</p>
                <p className={styles.drawerFactValue}>{f.value}</p>
              </div>
            ))}
            {selectedFacts.length === 0 ? (
              <p className={styles.drawerReads}>No facts wired to this surface yet.</p>
            ) : null}
          </aside>
        </>
      ) : null}
    </div>
  );
}
