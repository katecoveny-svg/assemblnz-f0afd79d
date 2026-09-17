'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './pursuit.module.css';

const MP4 = '/pursuit/media/pursuit-canvas-loop.mp4';
const WEBM = '/pursuit/media/pursuit-canvas-loop.webm';
const POSTER = '/pursuit/media/pursuit-canvas-poster.jpg';

type Phase = 'scatter' | 'arrange' | 'brand';

/**
 * Hero proof for /pursuit: muted loop of canvas rearrange → brand, with a
 * live CSS PREVIEW canvas as progressive enhancement / reduced-motion fallback.
 */
export function PursuitCanvasHero({ paused }: { paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>('scatter');
  const [videoOk, setVideoOk] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.pause();
      return;
    }
    void video.play().catch(() => setVideoOk(false));
  }, [paused]);

  useEffect(() => {
    if (paused) return;
    const order: Phase[] = ['scatter', 'arrange', 'brand'];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % order.length;
      setPhase(order[i]);
    }, 2800);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div className={styles.canvasHero} data-phase={phase} data-paused={paused || undefined}>
      <div className={styles.canvasStage}>
        {videoOk ? (
          <video
            ref={videoRef}
            className={styles.canvasVideo}
            poster={POSTER}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-label="PREVIEW: Pursuit canvas — rearrange agent-suggested parts, then into a brand frame"
            onError={() => setVideoOk(false)}
          >
            <source src={WEBM} type="video/webm" />
            <source src={MP4} type="video/mp4" />
          </video>
        ) : (
          <img
            className={styles.canvasVideo}
            src={POSTER}
            alt="PREVIEW poster of the Pursuit canvas moving from scattered parts into a brand demonstrator"
          />
        )}

        <div className={styles.liveCanvas} aria-hidden="true">
          <div className={styles.canvasChrome}>
            <span>Pursuit canvas</span>
            <span className={styles.previewBadge}>PREVIEW</span>
          </div>
          <div className={styles.canvasBoard}>
            {[
              ['signal', 'NZ signal'],
              ['idea', 'Suggested part'],
              ['moment', 'Customer moment'],
              ['proof', 'Evidence'],
              ['step', 'Next step'],
              ['brand', 'Brand frame'],
            ].map(([id, label]) => (
              <article key={id} className={styles.canvasCard} data-card={id}>
                <span>Part</span>
                <strong>{label}</strong>
              </article>
            ))}
            <div className={styles.brandRail}>
              <span>assembl · client demonstrator</span>
            </div>
          </div>
        </div>
      </div>
      <p className={styles.canvasCaption}>
        <span className={styles.previewBadge}>PREVIEW</span>
        Canvas proof — rearrange an agent-suggested idea, then into a brand / client frame. Radar and
        APIs stay behind the scenes.
      </p>
    </div>
  );
}
