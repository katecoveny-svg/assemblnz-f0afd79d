import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { PersonalOpener } from '@/components/ops/toa/PersonalOpener';
import { ToaWalkthrough } from '@/components/ops/toa/walk/ToaWalkthrough';

/**
 * /customers/toa-architects/ops/walk — the walk-through, given the whole room.
 *
 * Same surface Nick's magic link lands on (nested under the ops layout, so it
 * keeps the OpsShell chrome, the ARC rail and the demo gate), but here the
 * walk-through is the entire page: the 16A model in four construction states,
 * with ARC's insight layer hovering over it. Draft-only, always.
 */
export default function ToaWalkPage() {
  const config = getBrandConfig('toa-architects');
  if (!config) notFound();

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <PersonalOpener />
        <Link
          href="/customers/toa-architects/ops"
          className="shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition hover:bg-black/[0.03]"
          style={{ borderColor: 'rgba(0,0,0,0.15)', color: '#161516' }}
        >
          ← back to the workspace
        </Link>
      </div>

      <ToaWalkthrough fullBleed />

      <footer className="mt-2 flex flex-col gap-2 border-t border-black/10 pt-6 text-[12px] leading-relaxed text-[color:var(--brand-muted)]">
        <p style={{ color: 'var(--brand-ink)' }}>
          <span className="font-semibold" style={{ color: '#8a744f' }}>Mana Receipt.</span>{' '}
          Every ARC draft leaves a plain record — what it did, what it read, what it left for you.
          Draft-mode is enforced: nothing sends, lodges, or files without your yes.
        </p>
        <p>
          the 3D model is the real proposed 16C unit — assembl-built in Blender from the draft RC · zone,
          energy and cladding figures are real and cited · precedents, fees and lead times are demo ·
          Te Aranga audit held for review with mana whenua
        </p>
        <p>
          built by <span style={{ color: '#8a744f' }}>assembl</span> · Kate Hudson ·{' '}
          <a href="mailto:assembl@assembl.co.nz" className="underline decoration-[#bfa37a] underline-offset-2">
            assembl@assembl.co.nz
          </a>
        </p>
      </footer>
    </div>
  );
}
