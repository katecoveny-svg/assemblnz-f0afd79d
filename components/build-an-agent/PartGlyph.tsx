import styles from './part-glyph.module.css';

/**
 * A small chrome rendering of one of the six parts, for use in flat UI.
 *
 * Canon: every object means something, and the same object should mean the
 * same thing everywhere. The configure list was a wall of text precisely
 * because it had thrown away the shape language the 3D scene establishes —
 * a reader had no way to connect "Memory" in a form to the stacked cubes
 * floating above it. These glyphs are the same six silhouettes in the same
 * four tints, so the canvas and the form read as one system.
 *
 * Deliberately inline SVG, not WebGL: six more canvases below the fold would
 * cost real frames for what is, at this size, a highlight and a shadow.
 */

export type PartShape = 'knot' | 'cubes' | 'capsule' | 'octahedron' | 'sphere' | 'ring';

interface Props {
  shape: PartShape;
  /** Decorative — the card's heading already names the part. */
  className?: string;
}

/**
 * Tint per shape. These are the scene's chrome tints DEEPENED — a real metal
 * in the 3D scene earns its shape from what it reflects, and flat SVG has no
 * environment to reflect, so the lighter members of the family (abilities in
 * particular) washed out to a pale blob at this size. Same hues, more range.
 */
const TINT: Record<PartShape, string> = {
  knot: '#1A1918', // obsidian: the core is deliberately not in the chrome family
  cubes: '#93A5B1', // CHROME.memory, deepened
  capsule: '#A9B1B7', // CHROME.abilities, deepened
  octahedron: '#B0A794', // CHROME.knowledge, deepened
  sphere: '#7F878D', // CHROME.voice, deepened
  ring: '#A6ABB0', // brushed silver, as the boundaries hoop
};

export function PartGlyph({ shape, className }: Props) {
  const id = `glyph-${shape}`;
  const tint = TINT[shape];
  const dark = shape === 'knot';

  return (
    <svg
      className={`${styles.glyph} ${className ?? ''}`}
      viewBox="0 0 48 48"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* One shared lighting model: key from upper-left, shadow lower-right,
            so every glyph looks lit by the same studio as the 3D scene. */}
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={dark ? 0.55 : 0.95} />
          <stop offset="38%" stopColor={tint} />
          <stop offset="100%" stopColor={dark ? '#000000' : '#4c5257'} />
        </linearGradient>
        <radialGradient id={`${id}-spec`} cx="0.32" cy="0.26" r="0.42">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {shape === 'knot' && (
        <>
          <circle cx="24" cy="24" r="12" fill="none" stroke={`url(#${id}-face)`} strokeWidth="5" />
          <circle cx="24" cy="24" r="12" fill="none" stroke={`url(#${id}-face)`} strokeWidth="5"
            transform="rotate(60 24 24) scale(1 0.55) translate(0 19.6)" />
        </>
      )}

      {shape === 'cubes' && (
        <>
          <rect x="10" y="24" width="19" height="15" rx="2" fill={`url(#${id}-face)`} />
          <rect x="22" y="12" width="14" height="12" rx="2" fill={`url(#${id}-face)`} opacity="0.85" />
        </>
      )}

      {shape === 'capsule' && (
        <rect x="8" y="17" width="32" height="14" rx="7" fill={`url(#${id}-face)`} />
      )}

      {shape === 'octahedron' && (
        <>
          <path d="M24 7 L38 24 L24 41 L10 24 Z" fill={`url(#${id}-face)`} />
          <path d="M24 7 L38 24 L24 24 Z" fill="#FFFFFF" opacity="0.28" />
        </>
      )}

      {shape === 'sphere' && <circle cx="24" cy="24" r="15" fill={`url(#${id}-face)`} />}

      {shape === 'ring' && (
        <ellipse cx="24" cy="24" rx="17" ry="8.5" fill="none"
          stroke={`url(#${id}-face)`} strokeWidth="3.4" />
      )}

      {/* The specular hit that sells it as metal rather than a flat icon. */}
      {shape !== 'ring' && shape !== 'knot' && (
        <circle cx="24" cy="24" r="16" fill={`url(#${id}-spec)`} />
      )}
    </svg>
  );
}
