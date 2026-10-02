"use client";

import { useId } from 'react';
import { DO_IDENTITY as colour, DO_GLASS as glass } from '@/lib/brand/do-identity';
import { DO_MARK_PATH } from './DoMark';
import styles from './do-presence.module.css';

/** The same D at every scale. Light is a material finish, never connectivity evidence. */
export function DoPresence({ size = 'medium', working = false, className = '', finish = 'plum' }: {
  size?: 'small' | 'medium' | 'large'; working?: boolean; className?: string; finish?: 'plum' | 'paper' | 'glass';
}) {
  const id = useId().replaceAll(':', '');
  return <span className={`${styles.presence} ${className}`} data-size={size} data-finish={finish} data-working={working || undefined} aria-hidden="true">
    <span className={styles.shadow} />
    <svg viewBox="0 0 80 80" className={styles.sculpture} focusable="false">
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2=".7" y2="1">
          <stop stopColor={finish === 'glass' ? glass.highlight : finish === 'paper' ? colour.paper : '#B98DAB'} /><stop offset=".3" stopColor={finish === 'glass' ? colour.cobalt : finish === 'paper' ? '#EAC8DF' : '#654A4E'} /><stop offset=".6" stopColor={finish === 'glass' ? glass.reflection : finish === 'paper' ? '#F5F1F2' : '#240B21'} /><stop offset="1" stopColor={finish === 'glass' ? colour.cobalt : '#916A70'} />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={finish === 'glass' ? colour.ice : '#916A70'} /><stop offset=".5" stopColor={finish === 'glass' ? colour.cobalt : '#654A4E'} /><stop offset="1" stopColor={finish === 'glass' ? colour.ink : '#240B21'} /></linearGradient>
        <radialGradient id={`${id}-dot`} cx="30%" cy="25%"><stop stopColor="#FFFDFB" /><stop offset=".55" stopColor={finish === 'glass' ? colour.peach : '#F5E4E7'} /><stop offset="1" stopColor={finish === 'glass' ? colour.peach : '#EAC8DF'} /></radialGradient>
        <radialGradient id={`${id}-glow`}><stop stopColor="#EAC8DF" stopOpacity=".8" /><stop offset="1" stopColor="#EAC8DF" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform="translate(6 5)">
        {[5, 4, 3, 2, 1].map(depth => <path key={depth} d={DO_MARK_PATH} fill="none" stroke={`url(#${id}-edge)`} strokeWidth="9" strokeLinejoin="round" transform={`translate(${depth} ${depth * .65})`} />)}
        <path d={DO_MARK_PATH} fill="none" stroke={`url(#${id}-face)`} strokeWidth="9" strokeLinejoin="round" />
        <path d="M13 49V12Q13 9 16 9H29C43 9 53 18 55 28" fill="none" stroke="#FFFDFB" strokeWidth=".45" strokeOpacity=".7" strokeLinecap="round" />
        {finish !== 'glass' && <circle cx="30" cy="32" r="16" fill={`url(#${id}-glow)`} className={styles.light} />}
        <circle cx="30" cy="32" r="6" fill={`url(#${id}-dot)`} stroke="#FFFDFB" strokeOpacity=".7" strokeWidth=".3" />
        <circle cx="28" cy="30" r="1.8" fill="#FFFDFB" opacity=".7" />
      </g>
    </svg>
  </span>;
}
