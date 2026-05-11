/**
 * EvidencePackRender — full pack renderer.
 * Composes Cover → Sections → Citations → Closing into one A4-proportioned
 * stack. Each "page" is its own panel with the canonical 210×297 ratio so
 * the in-product preview reads as a stack of pages and the print
 * stylesheet can split on .pack-page boundaries.
 */

import type { EvidencePack } from '@/lib/evidence/pack-spec';
import { EvidencePackCover } from './EvidencePackCover';
import { EvidencePackSection } from './EvidencePackSection';
import { EvidencePackCitations } from './EvidencePackCitations';
import { EvidencePackClosing } from './EvidencePackClosing';

interface RenderProps {
  pack: EvidencePack;
  /** 'screen' for in-product preview; 'print' for the @media print path. */
  mode?: 'screen' | 'print';
}

export function EvidencePackRender({ pack, mode = 'screen' }: RenderProps) {
  // Drop the canonical Pou taunaki section out of the section list —
  // the dedicated Citations component renders it. The validatePack
  // helper guarantees it exists for posture/workflow packs.
  const bodySections = pack.sections.filter((s) => s.id !== 'pou-taunaki');

  return (
    <div
      data-pack-id={pack.id}
      data-pack-status={pack.status}
      className="space-y-8"
    >
      <PackPage mode={mode}>
        <EvidencePackCover pack={pack} mode={mode} />
      </PackPage>

      {bodySections.map((section, i) => (
        <PackPage key={section.id} mode={mode}>
          <RelativePage status={pack.status}>
            <EvidencePackSection section={section} index={i} />
            <PageFoot pack={pack} pageNum={i + 2} pageTotal={bodySections.length + 3} />
          </RelativePage>
        </PackPage>
      ))}

      {pack.citations.length > 0 && (
        <PackPage mode={mode}>
          <RelativePage status={pack.status}>
            <EvidencePackCitations citations={pack.citations} />
            <PageFoot
              pack={pack}
              pageNum={bodySections.length + 2}
              pageTotal={bodySections.length + 3}
            />
          </RelativePage>
        </PackPage>
      )}

      <PackPage mode={mode}>
        <RelativePage status={pack.status}>
          <EvidencePackClosing pack={pack} />
          <PageFoot
            pack={pack}
            pageNum={bodySections.length + 3}
            pageTotal={bodySections.length + 3}
          />
        </RelativePage>
      </PackPage>
    </div>
  );
}

function PackPage({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: 'screen' | 'print';
}) {
  return (
    <article
      className="pack-page mx-auto w-full max-w-[640px] overflow-hidden"
      style={{
        aspectRatio: '210 / 297',
        background: '#FAF7F2',
        boxShadow:
          mode === 'print'
            ? 'none'
            : '0 28px 80px rgba(35,33,31,0.10), 0 2px 12px rgba(35,33,31,0.06)',
        pageBreakAfter: 'always',
      }}
    >
      {children}
    </article>
  );
}

function RelativePage({
  children,
  status,
}: {
  children: React.ReactNode;
  status: 'draft' | 'sealed';
}) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Draft watermark — also present on interior pages while draft */}
      {status === 'draft' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ opacity: 0.10 }}
        >
          <span
            className="select-none"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: '14rem',
              color: '#A33B2C',
              transform: 'rotate(-22deg)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            DRAFT
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

function PageFoot({
  pack,
  pageNum,
  pageTotal,
}: {
  pack: EvidencePack;
  pageNum: number;
  pageTotal: number;
}) {
  const sealedAt = pack.hashChain.sealedAt
    ? new Date(pack.hashChain.sealedAt).toLocaleString('en-NZ', {
        timeZone: 'Pacific/Auckland',
        hour12: false,
      })
    : '—';

  const short = (h: string) =>
    h && h.length > 12 ? `${h.slice(0, 6)}…${h.slice(-4)}` : h || '—';

  return (
    <footer
      className="absolute inset-x-0 bottom-0 flex items-center justify-between px-12 pb-5"
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.58rem',
        color: '#8E8A82',
        letterSpacing: '0.12em',
      }}
    >
      <span>assembl</span>
      <span style={{ wordBreak: 'break-all' }}>
        {pack.status === 'sealed'
          ? `hash · ${short(pack.hashChain.thisHash)} · sealed ${sealedAt} NZST`
          : 'draft · unsealed'}
      </span>
      <span>
        {String(pageNum).padStart(2, '0')} / {String(pageTotal).padStart(2, '0')}
      </span>
    </footer>
  );
}
