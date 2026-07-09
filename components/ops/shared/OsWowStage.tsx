'use client';

import type { ReactNode } from 'react';
import type { BrandConfig } from '@/lib/brand/brand-config';
import { Brand3DHero } from '@/components/ops/Brand3DHero';
import { OsEditorialHero } from '@/components/ops/shared/OsEditorialHero';
import {
  OsMotionField,
  OsParallaxPattern,
  OsReveal,
  OsScrollReveal,
} from '@/components/ops/shared/OsMotion';

/**
 * Full-bleed wow stage for any OS: brand pattern wallpaper + ambient field +
 * hero band. Prefers editorial photography (and future SAM 3D exports) over
 * cartoon R3F silhouettes when `photography.anchor` is set.
 */
export function OsWowStage({
  config,
  children,
  showHero3D = true,
  heroHeightClass = 'h-56 md:h-72',
  patternOpacity = 0.11,
  heroEyebrow,
  heroTitle,
  heroBlurb,
}: {
  config: BrandConfig;
  children: ReactNode;
  showHero3D?: boolean;
  heroHeightClass?: string;
  patternOpacity?: number;
  heroEyebrow?: string;
  heroTitle?: string;
  heroBlurb?: string;
}) {
  const pattern = config.patterns?.primary;
  const useEditorial = Boolean(config.photography?.anchor);

  return (
    <div className="relative flex flex-col gap-5">
      {pattern ? <OsParallaxPattern src={pattern} opacity={patternOpacity} /> : null}
      <OsMotionField
        accent={config.colours.canary}
        secondary={config.colours.accent}
        intensity="medium"
      />

      {showHero3D ? (
        useEditorial ? (
          <OsEditorialHero
            config={config}
            heightClass={heroHeightClass}
            eyebrow={heroEyebrow}
            title={heroTitle}
            blurb={heroBlurb}
          />
        ) : (
          <OsReveal>
            <div
              className={`relative overflow-hidden rounded-3xl border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)] ${heroHeightClass}`}
              style={{
                background: `linear-gradient(135deg, ${config.colours.ink} 0%, ${config.colours.bg} 100%)`,
              }}
            >
              {pattern ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url(${pattern})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '280px auto',
                  }}
                />
              ) : null}
              <div className="absolute inset-0">
                <Brand3DHero config={config} />
              </div>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                style={{
                  background: `linear-gradient(to top, ${config.colours.bg}cc, transparent)`,
                }}
              />
            </div>
          </OsReveal>
        )
      ) : null}

      <OsScrollReveal>
        <div className="relative z-[1]">{children}</div>
      </OsScrollReveal>
    </div>
  );
}
