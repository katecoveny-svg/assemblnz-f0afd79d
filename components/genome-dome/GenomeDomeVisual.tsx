'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { GENOME_SURFACES } from '@/lib/customers/auckland-dog-trainer/genome';
import styles from './genome-dome-visual.module.css';

const DomeScene = dynamic(() => import('./DomeScene'), {
  ssr: false,
  loading: () => <Image src="/brand/genome/genome-city.png" alt="" width={720} height={560} className={styles.poster} />,
});

export function GenomeDomeVisual({ link = true, label = 'Explore the Business Genome' }: { link?: boolean; label?: string }) {
  const surfaces = GENOME_SURFACES.map((surface) => ({ id: surface.id, name: surface.name }));
  return (
    <div className={styles.visual}>
      <DomeScene surfaces={surfaces} />
      <span className={styles.context}>Tāmaki Makaurau · Auckland</span>
      {link ? <Link href="/genome" className={styles.link}>{label} <span aria-hidden>↗</span></Link> : null}
    </div>
  );
}
