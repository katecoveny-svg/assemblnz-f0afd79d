import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { GlassCard, SectionHead } from '@/components/ops/moana/GlassCard';

/**
 * Knots — the essential boating/fishing knots explained, with simple inline
 * SVG glyphs. Concepts, not liability advice: practise a knot before you trust
 * it, and inspect it under load.
 */

/** A tiny abstract loop/line glyph — indicative, not a step-by-step diagram. */
function KnotGlyph({ variant }: { variant: 'loop' | 'hitch' | 'bend' }) {
  return (
    <svg
      viewBox="0 0 80 60"
      width="80"
      height="60"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      {variant === 'loop' ? (
        <>
          <path d="M10 50 C 30 50, 30 20, 45 20" stroke="#6E93A6" strokeWidth="3" />
          <circle cx="52" cy="24" r="12" stroke="#1E7A8C" strokeWidth="3" />
          <path d="M45 20 C 60 20, 66 34, 58 40" stroke="#1E7A8C" strokeWidth="3" />
        </>
      ) : variant === 'hitch' ? (
        <>
          <rect x="12" y="10" width="8" height="40" rx="4" fill="#0A2A43" stroke="#6E93A6" strokeWidth="2" />
          <path d="M20 22 C 40 18, 40 30, 24 30 C 40 30, 44 42, 24 40" stroke="#1E7A8C" strokeWidth="3" />
          <path d="M40 24 L 70 20" stroke="#6E93A6" strokeWidth="3" />
        </>
      ) : (
        <>
          <path d="M8 28 C 30 24, 40 24, 50 30" stroke="#6E93A6" strokeWidth="3" />
          <path d="M72 32 C 50 36, 40 36, 30 30" stroke="#1E7A8C" strokeWidth="3" />
          <circle cx="40" cy="30" r="7" stroke="#E1622F" strokeWidth="2.5" />
        </>
      )}
    </svg>
  );
}

const KNOTS: Array<{
  name: string;
  glyph: 'loop' | 'hitch' | 'bend';
  when: string;
  how: string;
}> = [
  {
    name: 'Bowline',
    glyph: 'loop',
    when: 'A fixed loop that won’t slip and unties easily even after load — mooring, throwing a line, a loop over a bollard.',
    how: 'Make a small overhand loop; the tail comes up through the loop, around the standing line, and back down through the loop. “Rabbit out of the hole, round the tree, back down the hole.”',
  },
  {
    name: 'Clove hitch',
    glyph: 'hitch',
    when: 'Quick attach to a rail, post or fender. Fast to tie and adjust; back it up as it can work loose under a shifting load.',
    how: 'Two turns around the post with the second crossing over the first, tail tucked under the last turn.',
  },
  {
    name: 'Cleat hitch',
    glyph: 'hitch',
    when: 'The standard way to secure a line to a dock or boat cleat — holds hard, releases clean.',
    how: 'One full turn around the base, then figure-eights over the horns, finishing with a locking hitch. Don’t over-wrap.',
  },
  {
    name: 'Uni (grinner) knot',
    glyph: 'loop',
    when: 'Tie line to a hook, swivel or lure — strong, reliable, and the building block for a line-to-line join.',
    how: 'Thread the eye, form a loop back along the line, wrap the tag through the loop 5–6 times, moisten and snug down.',
  },
  {
    name: 'Blood knot',
    glyph: 'bend',
    when: 'Join two lines of similar diameter — e.g. joining leader to main line. Slim profile runs through the guides.',
    how: 'Overlap the two tags, wrap each around the other 5–6 times, pass both tags back through the middle gap, moisten and pull.',
  },
  {
    name: 'Palomar knot',
    glyph: 'loop',
    when: 'Very strong hook/lure tie, especially with braid — few steps, hard to get wrong.',
    how: 'Double the line, pass the loop through the eye, tie a simple overhand, pass the hook through the loop, moisten and cinch.',
  },
];

export default function MoanaKnots() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <SectionHead
        eyebrow="knots"
        title="The essential knots"
        intro="Six knots cover most of what a recreational boatie and angler needs. The glyphs are indicative only — learn each knot hands-on, practise it until it’s automatic, and inspect it under load. Your safety depends on the knot you actually tied, not the picture."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {KNOTS.map((k) => (
          <GlassCard key={k.name}>
            <div className="flex items-start gap-4">
              <div
                className="rounded-xl p-2"
                style={{ background: 'rgba(30,122,140,0.10)' }}
              >
                <KnotGlyph variant={k.glyph} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">
                  {k.name}
                </h2>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
                  <strong className="text-[color:var(--brand-surface)]">When:</strong> {k.when}
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
                  <strong className="text-[color:var(--brand-surface)]">How:</strong> {k.how}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
