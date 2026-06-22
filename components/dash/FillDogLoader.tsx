/**
 * FillDogLoader — the signature "fill-the-dog" loader from the design handoff.
 * The dachshund IS the loader: a faded ghost of the mascot with a colour copy
 * clipped to a bottom-anchored fill that rises with progress, plus a glowing
 * waterline at the fill edge.
 *
 * Pass `progress` (0–100) to drive it from real agent progress; omit it for the
 * looping demo. Honours prefers-reduced-motion (holds a static fill).
 * Ref: HANDOFF.md §5 + "Dash — Birdie Direction" / "Dash — Interactive".
 */
const SRC = '/dash/mascot-dog.png';

export function FillDogLoader({
  progress,
  className,
}: {
  progress?: number;
  className?: string;
}) {
  const driven = typeof progress === 'number';
  const fillStyle = driven
    ? { height: `${Math.max(0, Math.min(100, progress))}%`, animation: 'none' as const }
    : undefined;

  return (
    <div className={`filldog ${className ?? ''}`.trim()}>
      {/* ghost layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="filldog__ghost" src={SRC} alt="" aria-hidden />
      {/* colour fill, clipped bottom→top */}
      <div className="filldog__fill" style={fillStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="filldog__fillimg"
          src={SRC}
          alt="Dash the dachshund, filling up as the wait progresses"
        />
        <span className="filldog__water" aria-hidden />
      </div>
    </div>
  );
}
