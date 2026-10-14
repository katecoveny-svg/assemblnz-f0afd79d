'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { DoPresence } from './DoPresence';
import styles from './do-entry-object.module.css';

const DoObjectCanvas = dynamic(() => import('./DoObjectCanvas').then(module => module.DoObjectCanvas), { ssr: false });
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

/** A small, optional real 3D object. The complete SVG composition is always the fallback. */
export function DoEntryObject({ compact = false, working = false, finish = 'plum', avatar = 'bloom' }: { compact?: boolean; working?: boolean; finish?: 'plum' | 'paper'; avatar?: 'bloom' | 'orbit' | 'pebble' | 'spark' }) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { setAllowed(!media.matches); setReady(false); };
    change(); media.addEventListener('change', change);
    const observer = new IntersectionObserver(([entry]) => { setVisible(entry.isIntersecting); if (!entry.isIntersecting) setReady(false); }, { rootMargin: '60px' });
    if (root.current) observer.observe(root.current);
    return () => { media.removeEventListener('change', change); observer.disconnect(); };
  }, []);
  const enhance = visible && allowed && !failed;
  return <div ref={root} className={styles.object} data-compact={compact || undefined} data-avatar={avatar} data-renderer={ready && enhance ? '3d' : 'static'} aria-hidden="true">
    <div className={styles.fallback} data-hidden={ready && enhance || undefined}><span className={styles.petal} /><span className={styles.tile} /><DoPresence size="large" working={working} finish={finish} />{avatar === 'orbit' && <span className={styles.personalOrbit} />}{avatar === 'spark' && <span className={styles.personalSpark}>＋</span>}</div>
    {enhance && <SceneBoundary onFailure={() => { setFailed(true); setReady(false); }}><DoObjectCanvas finish={finish} avatar={avatar} onReady={() => setReady(true)} onFailure={() => { setFailed(true); setReady(false); }} /></SceneBoundary>}
  </div>;
}
