'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SCENES = [1, 2, 3, 4];

export function BrandFilmShowcase() {
  const [active, setActive] = useState(1);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Scene tabs */}
      <div
        role="tablist"
        aria-label="Brand film scenes"
        className="mb-10 flex flex-wrap items-center justify-center gap-3"
      >
        {SCENES.map((n) => {
          const isActive = active === n;
          return (
            <button
              key={n}
              role="tab"
              aria-selected={isActive}
              aria-controls={`scene-panel-${n}`}
              id={`scene-tab-${n}`}
              onClick={() => setActive(n)}
              className={`group relative inline-flex items-center gap-3 rounded-full border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] transition-all duration-300 ${
                isActive
                  ? 'border-[color:var(--assembl-soft-gold)] bg-[rgba(212,168,83,0.18)] text-[color:var(--assembl-paper)]'
                  : 'border-[rgba(250,247,242,0.18)] text-[rgba(250,247,242,0.55)] hover:border-[rgba(250,247,242,0.45)] hover:text-[rgba(250,247,242,0.85)]'
              }`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                  isActive ? 'bg-[color:var(--assembl-soft-gold)]' : 'bg-current opacity-50'
                }`}
              />
              Scene {String(n).padStart(2, '0')}
            </button>
          );
        })}
      </div>

      {/* Active scene player */}
      <div
        id={`scene-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`scene-tab-${active}`}
        className="relative"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <video
              key={active}
              controls
              playsInline
              preload="metadata"
              autoPlay
              className="aspect-video w-full rounded-2xl bg-black shadow-[0_24px_64px_rgba(0,0,0,0.4)]"
            >
              <source src={`/video/brand-film-scene-${active}-narrated.mp4`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </motion.div>
        </AnimatePresence>

        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-[rgba(250,247,242,0.5)]">
          {active} / {SCENES.length} &nbsp;·&nbsp; Sound on
        </p>
      </div>
    </div>
  );
}
