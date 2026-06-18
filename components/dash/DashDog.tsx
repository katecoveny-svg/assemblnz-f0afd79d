/**
 * The dash dachshund mark — the geometric dog whose segmented body doubles as
 * a loading bar. Geometry lifted verbatim from the design handoff (viewBox
 * 1040×470) so it stays pixel-faithful to `assets/dash-dog.svg`.
 *
 * `tone` recolours the body for the brand colourways; `segments` renders the
 * forest division lines (the "loading bar" grooves).
 */
type DashDogProps = {
  className?: string;
  /** Body fill — one of the assembl dog colourways. */
  tone?: string;
  title?: string;
};

export function DashDog({ className, tone = '#A6BA9E', title = 'dash dachshund' }: DashDogProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 1040 470"
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="560" cy="432" rx="372" ry="20" fill="#1a2a1c" opacity="0.06" />
      <path d="M206 250 C 158 252 128 228 120 190" stroke={tone} strokeWidth="26" strokeLinecap="round" />
      <rect x="214" y="298" width="48" height="118" rx="22" fill={tone} />
      <rect x="650" y="298" width="48" height="118" rx="22" fill={tone} />
      <rect x="185" y="206" width="548" height="128" rx="22" fill={tone} />
      <g fill="#8DA382">
        <rect x="372" y="206" width="8" height="128" />
        <rect x="452" y="206" width="8" height="128" />
        <rect x="532" y="206" width="8" height="128" />
        <rect x="612" y="206" width="8" height="128" />
      </g>
      <rect x="712" y="156" width="150" height="178" rx="52" fill={tone} />
      <rect x="842" y="214" width="156" height="84" rx="34" fill={tone} />
      <path
        d="M768 166 C 732 168 714 204 718 250 C 720 290 740 320 776 322 C 812 320 822 290 822 248 C 822 202 804 166 768 166 Z"
        fill={tone}
        stroke="#F2EFE6"
        strokeWidth="7"
      />
      <rect x="962" y="222" width="38" height="48" rx="19" fill="#14301A" />
      <circle cx="838" cy="200" r="13" fill="#14301A" />
    </svg>
  );
}
