'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import styles from './do-living-blob.module.css';

const DoLivingBlobScene = dynamic(
  () => import('./DoLivingBlobScene').then((m) => m.DoLivingBlobScene),
  { ssr: false },
);

type Props = {
  /** Meeting hero · home · portable */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
};

/**
 * Living DO identity blob — Spatial C rose/plum volumetric presence.
 * Progressive enhancement: flat rose orb fallback until WebGL mounts.
 */
export function DoLivingBlob({ size = 'md', className, label = 'DO' }: Props) {
  const [ok, setOk] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener('change', onChange);
    setOk(true);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div
      className={[styles.wrap, styles[size], className].filter(Boolean).join(' ')}
      role="img"
      aria-label={`${label} living mark`}
    >
      <div className={styles.fallback} aria-hidden="true" />
      {ok && !reduce ? (
        <Suspense fallback={null}>
          <DoLivingBlobScene />
        </Suspense>
      ) : null}
    </div>
  );
}
