'use client';

import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import { GENOME_SURFACES } from '@/lib/customers/auckland-dog-trainer/genome';
import type { DomeSurface } from './DomeScene';
import { InteractiveDome, type DomeView } from './InteractiveDome';
import styles from './genome-dome.module.css';

/**
 * The Business Genome hero — Kate's liquid-dome direction, end to end:
 * header · the pale-palette dome render, tilting with the mouse, its gold
 * network clickable · click a node to open the genome drawer for that
 * surface, live from the database.
 *
 * The render IS the default experience (it's the signed-off look). The
 * WebGL scene switches on automatically only when the real droplet GLB
 * exists at /brand/genome/assembl_liquid_dome.glb — never the procedural
 * stand-in, which read as a weird blob next to the renders.
 */

const DomeScene = dynamic(() => import('./DomeScene'), { ssr: false });

const DOME_GLB = '/brand/genome/assembl_liquid_dome.glb';

// Resolved once per page load: real GLB present AND WebGL available.
let webglPromise: Promise<boolean> | null = null;
let webglResult: boolean | null = null;
function checkTrue3d(): Promise<boolean> {
  if (!webglPromise) {
    webglPromise = (async () => {
      try {
        const c = document.createElement('canvas');
        if (!c.getContext('webgl2') && !c.getContext('webgl')) return false;
        const head = await fetch(DOME_GLB, { method: 'HEAD' });
        const type = head.headers.get('content-type') ?? '';
        webglResult = head.ok && !type.includes('text/html');
      } catch {
        webglResult = false;
      }
      return webglResult ?? false;
    })();
  }
  return webglPromise;
}

export function GenomeDomeExperience({
  facts,
  live,
}: {
  facts: GenomeFact[];
  live: boolean;
}) {
  const [true3d, setTrue3d] = React.useState(false);
  React.useEffect(() => {
    let mounted = true;
    checkTrue3d().then((ok) => {
      if (mounted && ok) setTrue3d(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const [view, setView] = React.useState<DomeView>('hero');
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
      <p className={styles.subtitle}>One source of truth. Everything connected.</p>
      <p className={styles.samplenote}>
        sample business — details fictional{live ? ' · reading live from the database' : ''}
      </p>

      <div className={styles.domeBox} aria-label="Interactive Business Genome dome">
        {true3d ? (
          <DomeScene surfaces={surfaces} onSelect={setSelected} onHover={setHovered} />
        ) : (
          <InteractiveDome
            surfaces={surfaces}
            view={view}
            onSelect={setSelected}
            onHover={setHovered}
          />
        )}
      </div>

      {!true3d ? (
        <div className={styles.viewRow} role="group" aria-label="Dome view">
          <button
            type="button"
            className={`${styles.viewChip} ${view === 'hero' ? styles.viewChipActive : ''}`}
            onClick={() => setView('hero')}
          >
            harbour view
          </button>
          <button
            type="button"
            className={`${styles.viewChip} ${view === 'topdown' ? styles.viewChipActive : ''}`}
            onClick={() => setView('topdown')}
          >
            from above
          </button>
        </div>
      ) : null}

      <p className={styles.hoverHint} aria-live="polite">
        {hovered ? (
          <>
            <strong>{hovered.name.toLowerCase()}</strong> — click to open the genome
          </>
        ) : (
          'each gold node is a surface reading the genome — click one'
        )}
      </p>

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
