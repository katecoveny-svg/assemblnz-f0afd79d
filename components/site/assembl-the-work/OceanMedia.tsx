'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
export function OceanMedia({ paused = false }: { paused?: boolean }) {
  const video = useRef<HTMLVideoElement>(null), layer = useRef<HTMLDivElement>(null);
  const [stopped, setStopped] = useState(false), [playing, setPlaying] = useState(false), [ready, setReady] = useState(false);
  useEffect(() => {
    const media = video.current, element = layer.current;
    if (!media || !element) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, frame = 0;
    const apply = () => { if (paused || stopped || reduced.matches || document.hidden || !visible) media.pause(); else void media.play().catch(() => {}); };
    const position = () => { frame = 0; element.style.transform = !reduced.matches && visible ? `translate3d(0,${Math.min(scrollY * .17, 180)}px,0) scale(1.035)` : 'none'; };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(position); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; apply(); scroll(); }, { threshold: 0 });
    observer.observe(element); reduced.addEventListener('change', apply); document.addEventListener('visibilitychange', apply); window.addEventListener('scroll', scroll, { passive: true });
    return () => { observer.disconnect(); cancelAnimationFrame(frame); reduced.removeEventListener('change', apply); document.removeEventListener('visibilitychange', apply); window.removeEventListener('scroll', scroll); media.pause(); };
  }, [paused, stopped]);
  return <><div className="atw-ocean" ref={layer} aria-hidden="true"><video data-ready={ready} onLoadedData={() => setReady(true)} onError={() => setReady(false)} ref={video} muted playsInline loop preload="metadata" poster="/cinematic-nature/ocean-assembly.webp" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}><source src="/cinematic-nature/ocean-assembly.mp4" type="video/mp4" /></video></div><button className="atw-motion-control" aria-label={playing ? 'Pause ocean film' : 'Play ocean film'} onClick={() => { if (playing) setStopped(true); else { setStopped(false); void video.current?.play().catch(() => {}); } }}>{playing ? <Pause size={15} /> : <Play size={15} />}</button></>;
}
