"use client";

import { GlassIdentity } from '@/components/brand/GlassIdentity';
import styles from './do-presence.module.css';

/** Locked glass artwork at every scale. Movement never implies connectivity. */
export function DoPresence({ size = 'medium', working = false, className = '', finish = 'plum' }: {
  size?: 'small' | 'medium' | 'large'; working?: boolean; className?: string; finish?: 'plum' | 'paper' | 'glass';
}) {
  const pixels = size === 'small' ? 48 : size === 'large' ? 240 : 180;
  return <span className={`${styles.presence} ${className}`} data-size={size} data-finish={finish} data-working={working || undefined} aria-hidden="true">
    <span className={styles.sculpture}><GlassIdentity kind="do" size={pixels} /></span>
  </span>;
}
