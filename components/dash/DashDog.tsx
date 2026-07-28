/**
 * The assembling mark, wide format.
 *
 * This file used to draw the Birdie dachshund — the geometric dog whose
 * segmented body doubled as a loading bar. The dog is retired: it was the old
 * assembling identity, and it kept surfacing on live pages (the "agent
 * finished" card, the phone mock, the loader demos) long after the rest of the
 * microsite moved to the champagne canon, so a visitor's first sight of the
 * product was still a cartoon.
 *
 * The replacement says the same thing in the current language: parts docking
 * onto a brass rail, left to right, closing into a ring — the way the 3D
 * scenes assemble. It keeps the original 1040×470 viewBox so every existing
 * call site, which sizes this by width and expects a wide short mark, lays out
 * unchanged.
 *
 * The component name and export stay as they are on purpose: renaming across a
 * dozen call sites is a separate job from getting the dog off the site.
 */
type DashDogProps = {
  className?: string;
  /** Part fill — the ink of whatever surface it sits on. */
  tone?: string;
  title?: string;
};

/** where each docking part sits along the rail */
const PARTS = [196, 330, 464, 598, 732];

export function DashDog({ className, tone = '#3a3832', title = 'assembling' }: DashDogProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 1040 470"
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* contact shadow, so the parts sit on something */}
      <ellipse cx="520" cy="418" rx="352" ry="16" fill="#3a3832" opacity="0.08" />

      {/* the rail, and how much of the run has been assembled so far */}
      <rect x="150" y="228" width="700" height="10" rx="5" fill="#BFA37A" opacity="0.32" />
      <rect x="150" y="228" width="330" height="10" rx="5" fill="#BFA37A" />

      {/* the brass ring the run closes into */}
      <circle cx="900" cy="233" r="46" stroke="#BFA37A" strokeWidth="10" fill="none" />
      <circle cx="900" cy="233" r="17" fill="#BFA37A" opacity="0.9" />

      {/* the parts — docked ones solid, still-arriving ones outlined */}
      {PARTS.map((x, i) => {
        const docked = i < 3;
        const y = i % 2 === 0 ? 150 : 266;
        return (
          <g key={x}>
            <line
              x1={x}
              y1={i % 2 === 0 ? 208 : 266}
              x2={x}
              y2={i % 2 === 0 ? 228 : 238}
              stroke={tone}
              strokeWidth="3"
              opacity="0.28"
            />
            <rect
              x={x - 40}
              y={y}
              width="80"
              height="58"
              rx="16"
              fill={docked ? tone : 'none'}
              stroke={docked ? 'none' : tone}
              strokeWidth="7"
              opacity={docked ? 1 : 0.42}
            />
          </g>
        );
      })}
    </svg>
  );
}
