'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroVessel } from '@/lib/site-config';

/**
 * CinematicHero — full-bleed background with the vessel-rotate video.
 * Scroll-bound playback (GSAP + ScrollTrigger): frame advances with scroll.
 * Honours prefers-reduced-motion (renders the 16:9 still + autoplay loop fallback).
 */
export function CinematicHero({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    gsap.registerPlugin(ScrollTrigger);

    let trigger: ScrollTrigger | null = null;

    const setup = () => {
      // Kill any previous trigger before rebuilding.
      trigger?.kill();
      trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
        onUpdate: (self) => {
          if (!video.duration || isNaN(video.duration)) return;
          video.currentTime = self.progress * video.duration;
        },
      });
    };

    if (video.readyState >= 1) {
      setup();
    } else {
      video.addEventListener('loadedmetadata', setup, { once: true });
    }

    return () => {
      trigger?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100vh] overflow-hidden bg-[color:var(--assembl-paper)]"
    >
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="metadata"
          poster={heroVessel.wide}
          autoPlay
          loop
          className="absolute inset-0 h-full w-full object-cover motion-reduce:opacity-90"
        >
          <source src={heroVessel.videoLocal} type="video/mp4" />
        </video>
        {/* Sculptural cream wash so type stays readable on cream paper canon */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(250,247,242,0.55) 0%, rgba(250,247,242,0.35) 35%, rgba(250,247,242,0.85) 80%, rgba(250,247,242,1) 100%)',
          }}
        />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[100vh] max-w-6xl flex-col justify-center px-6 py-32 md:px-10">
        {children}
      </div>
    </section>
  );
}
