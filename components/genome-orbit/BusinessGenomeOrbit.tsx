'use client';

import { BRAND, ORBIT_NODES } from '@/lib/copy/homepage';
import { VortexCore } from './VortexCore';
import styles from './genome-orbit.module.css';

/**
 * BusinessGenomeOrbit — the genome as the still centre of the business, with
 * every surface (pricing, customers, knowledge, services, voice, website,
 * crm, marketing, bookings) orbiting it and a particle vortex resolving into
 * the core. SVG ring + connectors, CSS-positioned HTML nodes, a canvas vortex.
 *
 * Copy comes from the manifest (ORBIT_NODES, BRAND.genomeName) — never inline.
 * Motion: 120s ring rotation with counter-rotated upright labels; hovering the
 * stage settles the whole system; reduced-motion holds it still; under 640px
 * it becomes a static 3×3 grid.
 */
export function BusinessGenomeOrbit() {
  const [line1, line2] = BRAND.genomeName.split(' ');

  return (
    <section className={styles.section} id="business-genome" aria-label="Business Genome orbit">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>One centre. Every surface.</p>
        <h2>
          Everything your business does
          <br />
          orbits one source of truth.
        </h2>
      </div>

      <div className={styles.stage}>
        <div className={styles.ring}>
          <svg className={styles.wires} viewBox="-200 -200 400 400" aria-hidden>
            <circle className={styles.orbitPath} cx="0" cy="0" r="150" />
            {ORBIT_NODES.map((label, i) => {
              const a = (i * 40 * Math.PI) / 180 - Math.PI / 2;
              const x = Math.cos(a) * 150;
              const y = Math.sin(a) * 150;
              return (
                <line
                  key={label}
                  className={styles.wire}
                  x1="0"
                  y1="0"
                  x2={x.toFixed(2)}
                  y2={y.toFixed(2)}
                />
              );
            })}
          </svg>

          {ORBIT_NODES.map((label, i) => (
            <div
              key={label}
              className={styles.node}
              style={{ ['--a' as string]: `${i * 40}deg`, ['--i' as string]: i }}
            >
              <span className={styles.nodeInner}>
                <span className={styles.nodeDot} aria-hidden />
                <span className={styles.nodeLabel}>{label}</span>
              </span>
            </div>
          ))}
        </div>

        <div className={styles.core}>
          <VortexCore className={styles.vortex} />
          <div className={styles.coreCard}>
            <span className={styles.coreMark} aria-hidden>
              a
            </span>
            <strong>
              {line1}
              <br />
              {line2}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
