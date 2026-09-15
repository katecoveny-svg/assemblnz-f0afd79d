"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import styles from "./do-film.module.css";

/** Last night's approved plum film; media never represents task progress. */
export function DoFilm() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [motionOptIn, setMotionOptIn] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const sync = () => {
      if (
        paused ||
        (media.matches && !motionOptIn) ||
        !inView ||
        document.hidden ||
        failed
      )
        video.current?.pause();
      else void video.current?.play().catch(() => setPlaying(false));
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    if (root.current) observer.observe(root.current);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused, failed, motionOptIn]);
  return (
    <section ref={root} className={styles.film} aria-label="The DO film">
      <video
        ref={video}
        loop
        muted
        playsInline
        preload="none"
        poster="/do/cinema/do-orb-poster.webp"
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      >
        <source src="/do/cinema/do-orb-loop.mp4" type="video/mp4" />
      </video>
      <div className={styles.copy}>
        <span>AN IMAGINED WORLD. YOUR NEXT PIECE OF WORK.</span>
        <h2>
          A little possibility.
          <br />
          Put into motion.
        </h2>
        <Link href="/do">
          assembl your DO <ArrowUpRight size={20} />
        </Link>
      </div>
      <div className={styles.controls}>
        <span>
          {failed ? "Film unavailable · still view" : "DO / motion study"}
        </span>
        <button
          type="button"
          disabled={failed}
          aria-label={playing ? "Pause DO film" : "Play DO film"}
          onClick={() => {
            if (playing) {
              setPaused(true);
              video.current?.pause();
            } else {
              setMotionOptIn(true);
              setPaused(false);
              void video.current?.play().catch(() => setPlaying(false));
            }
          }}
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>
      </div>
    </section>
  );
}
