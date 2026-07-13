'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { GENOME_SURFACES } from '@/lib/customers/auckland-dog-trainer/genome';
import { DomePoster } from './DomePoster';
import styles from './genome-dome-visual.module.css';

const DomeScene = dynamic(() => import('./DomeScene'), {
  ssr: false,
  loading: () => <DomePoster className={styles.poster} />,
});

let webglSupport: boolean | null = null;
function detectWebgl(): boolean | null {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    webglSupport = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

export function GenomeDomeVisual({ link = true, label = 'Explore the Business Genome' }: { link?: boolean; label?: string }) {
  const webgl = useSyncExternalStore(() => () => {}, detectWebgl, () => null);
  const surfaces = GENOME_SURFACES.map((surface) => ({ id: surface.id, name: surface.name }));
  return (
    <div className={styles.visual}>
      {webgl ? <DomeScene surfaces={surfaces} /> : <DomePoster className={styles.poster} />}
      <span className={styles.context}>Tāmaki Makaurau · Auckland</span>
      {link ? <Link href="/genome" className={styles.link}>{label} <span aria-hidden>↗</span></Link> : null}
    </div>
  );
}
