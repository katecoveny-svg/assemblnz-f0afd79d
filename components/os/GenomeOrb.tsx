import styles from './genome-orb.module.css';

/**
 * The Business Genome orb — the pearl direction's centrepiece.
 * A glass sphere holding the business, with every surface orbiting it:
 * lines grow in, nodes drift, nothing pops. Pure SVG + CSS.
 */
export function GenomeOrb({
  initial,
  surfaces,
  size = 340,
}: {
  /** The letterform inside the orb — 'a' for assembl, the business initial otherwise. */
  initial: string;
  /** Orbiting surface labels (6–10 read best). */
  surfaces: string[];
  size?: number;
}) {
  const c = 200; // viewBox centre
  const orbitR = 150;
  const nodes = surfaces.slice(0, 10).map((label, i) => {
    const angle = (i / Math.min(surfaces.length, 10)) * Math.PI * 2 - Math.PI / 2;
    return {
      label,
      x: c + orbitR * Math.cos(angle),
      y: c + orbitR * Math.sin(angle),
      delay: 0.15 + i * 0.12,
    };
  });

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      role="img"
      aria-label={`Business Genome — one source of truth read by ${surfaces.join(', ')}`}
      className={styles.orb}
    >
      <defs>
        <radialGradient id="orb-pearl" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f4f2ee" />
          <stop offset="88%" stopColor="#e9e4d9" />
          <stop offset="100%" stopColor="#ddd3bd" />
        </radialGradient>
        <radialGradient id="orb-node" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#f1eee7" />
          <stop offset="100%" stopColor="#e2dac6" />
        </radialGradient>
      </defs>

      {/* orbit ring */}
      <circle cx={c} cy={c} r={orbitR} className={styles.orbitRing} />

      {/* connecting lines — they grow in */}
      {nodes.map((n) => (
        <line
          key={`l-${n.label}`}
          x1={c}
          y1={c}
          x2={n.x}
          y2={n.y}
          className={styles.thread}
          style={{ animationDelay: `${n.delay}s` }}
        />
      ))}

      {/* the pearl */}
      <circle cx={c} cy={c} r={74} fill="url(#orb-pearl)" className={styles.pearl} />
      <circle cx={c} cy={c} r={74} className={styles.pearlRim} />
      <ellipse cx={c - 22} cy={c - 30} rx={26} ry={16} className={styles.pearlGlint} />
      <text x={c} y={c + 21} textAnchor="middle" className={styles.initial}>
        {initial}
      </text>

      {/* orbiting surfaces — nodes drift */}
      {nodes.map((n, i) => (
        <g
          key={n.label}
          className={styles.node}
          style={{ animationDelay: `${(i % 5) * 0.9}s` }}
        >
          <circle cx={n.x} cy={n.y} r={13} fill="url(#orb-node)" className={styles.nodeBall} />
          <circle cx={n.x} cy={n.y} r={13} className={styles.nodeRim} />
          <text
            x={n.x}
            y={n.y < c ? n.y - 22 : n.y + 32}
            textAnchor="middle"
            className={styles.nodeLabel}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
