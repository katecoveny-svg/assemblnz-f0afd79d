'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './world.module.css';
const Scene = dynamic(() => import('./WorldScene'), { ssr: false });
class Boundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() { return this.state.failed ? <p className={styles.fallback}>The 3D view is unavailable. You can still open each workspace below.</p> : this.props.children; }
}
const chapters = [
  {id:'find', label:'01 / Pursuit', title:'Find.', description:'Find the work worth doing.', href:'/pursuit', action:'Open Pursuit'},
  {id:'do', label:'02 / DO', title:'DO.', description:'Prepare useful work with your specialist DOs.', href:'/do', action:'assembl your DO'},
  {id:'show', label:'03 / Studio', title:'Show.', description:'Turn the opportunity into something people can experience.', href:'/studio', action:'Open Studio'},
];
export default function World() {
  const progress = useRef(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(query.matches);
    const scroll = () => { progress.current = Math.min(1, Math.max(0, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))); };
    motion(); scroll(); query.addEventListener('change', motion); addEventListener('scroll', scroll, {passive:true}); addEventListener('resize', scroll);
    return () => { query.removeEventListener('change', motion); removeEventListener('scroll', scroll); removeEventListener('resize', scroll); };
  }, []);
  return <div className={styles.world}>
    <div className={styles.stage} aria-hidden="true"><Boundary><Scene progress={progress} paused={paused || reduced} /></Boundary></div>
    <h1 className={styles.srOnly}>assembl — Find. DO. Show.</h1><header className={styles.header}><Link href="/" className={styles.brand}>assembl</Link><span>World study</span><Link href="/do">Open DO ↗</Link></header>
    <nav className={styles.nav} aria-label="Explore the work">{chapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`}>{chapter.title}</a>)}<button onClick={() => setPaused(!paused)} disabled={reduced}>{reduced ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion'}</button></nav>
    {chapters.map(chapter => <section key={chapter.id} id={chapter.id} className={styles.chapter}><div><p className={styles.label}>{chapter.label}</p><h2>{chapter.title}</h2><p className={styles.description}>{chapter.description}</p><Link className={styles.action} href={chapter.href}>{chapter.action} <span>↗</span></Link></div></section>)}
    <footer className={styles.footer}>An imagined workspace. This architectural study does not show live agent activity.</footer>
  </div>;
}
