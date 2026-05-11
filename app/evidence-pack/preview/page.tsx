import type { Metadata } from 'next';
import Link from 'next/link';
import { EvidencePackRender } from '@/components/evidence/EvidencePackRender';
import {
  FIXTURE_PACKS,
  waihangaPack,
  coParentingPack,
  pikauDraftPack,
} from '@/lib/evidence/fixtures';

export const metadata: Metadata = {
  title: 'Evidence pack preview',
  description:
    'Three canonical evidence packs rendered to the voyage-evidence-craft.md spec. Internal preview.',
};

const PACK_BLURBS: Record<string, { lede: string; note: string }> = {
  pack_wai_2026_05_11_27_king: {
    lede: 'Waihanga · Construction · s14B precheck · sealed',
    note:
      'A workflow pack that has been accepted by Auckland Council BCA. The cover seal is soft gold; the hash chain is live; the watermark is absent because the pack is sealed.',
  },
  pack_toro_2026_04_coparent: {
    lede: 'Tōro · Co-parenting · April posture · sealed',
    note:
      'The Family Court-ready posture pack. Hash-chained communication log, IRD-reconciled expense ledger, named navigator sign-off. The Evidence Act 2006 s 137 citation is doing real work here.',
  },
  pack_pikau_2026_05_11_maw: {
    lede: 'Pīkau · Freight & Customs · entry MAW1234567 · DRAFT',
    note:
      'A workflow pack still in Draft. The DRAFT watermark sits across every page; the hash-chain block reads "draft · not sealed · verifier inactive". Awaiting reviewer.',
  },
};

export default function EvidencePackPreviewPage() {
  return (
    <div className="bg-[color:var(--assembl-paper)] py-12">
      <header className="container py-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
          Internal · voyage-evidence-craft.md
        </p>
        <h1
          className="mt-4 font-display leading-[0.95] tracking-tight"
          style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}
        >
          Evidence pack preview
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)]">
          Three canonical packs, rendered to the spec. One sealed Waihanga
          consent precheck. One sealed Tōro co-parenting posture pack. One
          Pīkau Customs entry still in Draft. Use the table-of-contents
          links to jump between them.
        </p>

        <nav className="mt-8 flex flex-wrap gap-3">
          {FIXTURE_PACKS.map((p) => (
            <Link
              key={p.id}
              href={`#${p.id}`}
              className="btn-ghost inline-flex items-center px-4 py-2 text-xs"
            >
              {PACK_BLURBS[p.id]?.lede ?? p.title.en}
            </Link>
          ))}
        </nav>
      </header>

      <main className="space-y-24 py-12">
        <PackPreview pack={waihangaPack} />
        <PackPreview pack={coParentingPack} />
        <PackPreview pack={pikauDraftPack} />
      </main>
    </div>
  );
}

function PackPreview({ pack }: { pack: typeof waihangaPack }) {
  const blurb = PACK_BLURBS[pack.id];
  return (
    <section id={pack.id} className="container scroll-mt-24">
      <header className="mx-auto mb-10 max-w-[640px]">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color: '#2B6B57' }}
        >
          {blurb?.lede}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
          {blurb?.note}
        </p>
      </header>
      <EvidencePackRender pack={pack} />
    </section>
  );
}
