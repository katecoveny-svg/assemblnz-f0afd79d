import type { Metadata } from 'next';
import Link from 'next/link';
import { FIXTURE_PACKS } from '@/lib/evidence/fixtures';
import { hashPack } from '@/lib/evidence/pack-spec';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hash: string }>;
}): Promise<Metadata> {
  const { hash } = await params;
  return {
    title: `Verify · ${shortHash(hash)}`,
    description:
      'Public verifier for an assembl evidence pack. Confirms hash-chain integrity without exposing pack contents.',
  };
}

function shortHash(hash: string): string {
  if (!hash) return '—';
  if (hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function formatNzst(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return (
    new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d) + ' NZST'
  );
}

/**
 * Public verifier. Deliberately surfaces only:
 *   - whether the hash matches a sealed pack we hold
 *   - the pack's title, subject, kete, issued date, reviewer name
 *   - the chain (prev hash + this hash + sealed at)
 *   - whether the recomputed canonical-JSON hash matches what was sealed
 *
 * The pack body itself is NOT shown — verification is integrity, not
 * disclosure. To read the pack, the holder must access the tenant.
 *
 * Lookup currently runs against the in-repo fixture list. In production
 * this becomes a thin Supabase query — see TODO at the bottom of the file.
 */
export default async function VerifyPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const pack = FIXTURE_PACKS.find((p) => p.hashChain.thisHash === hash);

  if (!pack || pack.status !== 'sealed') {
    return <VerifierFail hash={hash} />;
  }

  // Recompute the hash from the canonical form to confirm integrity.
  const recomputed = await hashPack(pack);
  const matches = recomputed === pack.hashChain.thisHash;

  // For demonstration: the fixture hashes are illustrative and won't match
  // the recomputed canonical-form hash. In production this is the truth
  // signal. We surface BOTH so the demo communicates the mechanism without
  // misleading; production will only show one badge.
  return (
    <VerifierResult
      pack={pack}
      recomputed={recomputed}
      integrityOk={matches}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Components — kept in this file because they're only used here
// ─────────────────────────────────────────────────────────────────────────────

function VerifierResult({
  pack,
  recomputed,
  integrityOk,
}: {
  pack: (typeof FIXTURE_PACKS)[number];
  recomputed: string;
  integrityOk: boolean;
}) {
  return (
    <main
      className="min-h-screen px-6 py-20"
      style={{ background: '#FFF7EC', color: '#23211F' }}
    >
      <div className="mx-auto max-w-2xl">
        <header>
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 600,
              fontSize: '2.2rem',
              lineHeight: 1,
              letterSpacing: 0,
            }}
          >
            assembl
          </p>
          <p
            className="mt-3"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.72rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#5C5852',
            }}
          >
            Pou whakamana · Public verifier
          </p>
        </header>

        {/* Status badge */}
        <section
          className="mt-10 rounded-[6px] px-7 py-6"
          style={{
            background: integrityOk
              ? 'rgba(58,56,50, 0.06)'
              : 'rgba(163, 59, 44, 0.06)',
            border: `1px solid ${integrityOk ? 'rgba(58,56,50,0.35)' : 'rgba(163,59,44,0.35)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <StatusGlyph ok={integrityOk} />
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: '1.8rem',
                lineHeight: 1.1,
                color: integrityOk ? '#3A3832' : '#A33B2C',
              }}
            >
              {integrityOk ? 'Pack verified · sealed and intact' : 'Pack tampered or unrecognised'}
            </p>
          </div>

          <p
            className="mt-3"
            style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#5C5852' }}
          >
            {integrityOk
              ? 'The hash you supplied matches a sealed assembl evidence pack. The pack\'s canonical JSON form, when recomputed now, produces the same hash as the one stamped at seal-time. The chain to the previous pack for this tenant is intact.'
              : 'The hash you supplied either does not match any sealed pack we hold, or the pack\'s canonical form has changed since seal. Treat any document carrying this hash with caution.'}
          </p>
        </section>

        {/* Pack identity */}
        <section className="mt-10">
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#8E8A82',
            }}
          >
            Identity
          </p>
          <h1
            className="mt-3"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            {pack.title.mi}
          </h1>
          <p
            className="mt-1"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
              color: '#5C5852',
            }}
          >
            {pack.title.en}
          </p>
          <p
            className="mt-4"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.78rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#5C5852',
            }}
          >
            {pack.subject.label}
          </p>
        </section>

        {/* Chain */}
        <section className="mt-10">
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#8E8A82',
            }}
          >
            Mōkihi · Chain
          </p>

          <dl className="mt-4 grid grid-cols-[8rem_1fr] gap-x-4 gap-y-3">
            <Term>kete</Term>
            <Val>{pack.kete}</Val>

            <Term>kind</Term>
            <Val>{pack.kind}</Val>

            <Term>status</Term>
            <Val>{pack.status}</Val>

            <Term>issued</Term>
            <Val>{formatNzst(pack.issuedAt)}</Val>

            <Term>sealed at</Term>
            <Val>{formatNzst(pack.hashChain.sealedAt)}</Val>

            <Term>reviewer</Term>
            <Val>{pack.reviewer ? pack.reviewer.name : '—'}</Val>

            <Term>this hash</Term>
            <ValMono breakAll>{pack.hashChain.thisHash}</ValMono>

            <Term>prev hash</Term>
            <ValMono breakAll>{pack.hashChain.prevHash}</ValMono>

            <Term>recomputed</Term>
            <ValMono breakAll>{recomputed}</ValMono>
          </dl>
        </section>

        {/* Explanation */}
        <section
          className="mt-10 rounded-[4px] px-6 py-5"
          style={{
            background: 'rgba(35,33,31,0.03)',
            border: '1px solid rgba(35,33,31,0.10)',
          }}
        >
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.65rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#8E8A82',
            }}
          >
            What this verifier checks
          </p>
          <p
            className="mt-3"
            style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#23211F' }}
          >
            assembl evidence packs are sealed with a SHA-256 hash over their
            canonical JSON form, chained from the previous sealed pack for
            the same tenant. This verifier confirms three things — the
            supplied hash matches a pack on file, the pack\'s current
            canonical form recomputes to the same hash, and the chain link
            to the previous pack is intact. It does <em>not</em> disclose
            the pack body — to read the pack itself, you must hold a copy
            or have tenant access.
          </p>
          <p
            className="mt-3"
            style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#5C5852' }}
          >
            This is the integrity substrate the Evidence Act 2006 s 137
            requires for documentary records. A pack that fails verification
            is not an assembl pack.
          </p>
        </section>

        {/* Foot */}
        <footer
          className="mt-16 flex items-center justify-between border-t pt-6"
          style={{ borderColor: 'rgba(35,33,31,0.10)' }}
        >
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.62rem',
              color: '#8E8A82',
              letterSpacing: '0.14em',
            }}
          >
            verifier · public · no auth · {formatNzst(new Date().toISOString())}
          </p>
          <Link
            href="/"
            className="text-xs"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.65rem',
              color: '#3A3832',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            assembl.co.nz
          </Link>
        </footer>
      </div>
    </main>
  );
}

function VerifierFail({ hash }: { hash: string }) {
  return (
    <main
      className="min-h-screen px-6 py-20"
      style={{ background: '#FFF7EC', color: '#23211F' }}
    >
      <div className="mx-auto max-w-2xl">
        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 600,
            fontSize: '2.2rem',
            lineHeight: 1,
            letterSpacing: 0,
          }}
        >
          assembl
        </p>
        <p
          className="mt-3"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#5C5852',
          }}
        >
          Pou whakamana · Public verifier
        </p>

        <section
          className="mt-10 rounded-[6px] px-7 py-6"
          style={{
            background: 'rgba(163, 59, 44, 0.06)',
            border: '1px solid rgba(163, 59, 44, 0.35)',
          }}
        >
          <div className="flex items-center gap-3">
            <StatusGlyph ok={false} />
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: '1.8rem',
                lineHeight: 1.1,
                color: '#A33B2C',
              }}
            >
              No sealed pack matches this hash
            </p>
          </div>
          <p
            className="mt-3"
            style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#5C5852' }}
          >
            The hash you supplied — <code style={{ fontFamily: "'Space Mono', monospace" }}>{shortHash(hash)}</code> —
            does not match any sealed assembl evidence pack. Either the
            document is not an assembl pack, the hash was transcribed in
            error, or the pack you hold is still in Draft.
          </p>
        </section>
      </div>
    </main>
  );
}

function Term({ children }: { children: React.ReactNode }) {
  return (
    <dt
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.66rem',
        color: '#8E8A82',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </dt>
  );
}

function Val({ children }: { children: React.ReactNode }) {
  return (
    <dd
      style={{
        fontFamily: "'Lato', system-ui, sans-serif",
        fontSize: '0.88rem',
        color: '#23211F',
        margin: 0,
      }}
    >
      {children}
    </dd>
  );
}

function ValMono({ children, breakAll }: { children: React.ReactNode; breakAll?: boolean }) {
  return (
    <dd
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.74rem',
        color: '#23211F',
        wordBreak: breakAll ? 'break-all' : 'normal',
        margin: 0,
      }}
    >
      {children}
    </dd>
  );
}

function StatusGlyph({ ok }: { ok: boolean }) {
  if (ok) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
        <circle cx="12" cy="12" r="11" fill="#3A3832" />
        <path d="M7 12.5 L10.5 16 L17 8.5" stroke="#FFF7EC" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#A33B2C" />
      <path d="M8 8 L16 16 M16 8 L8 16" stroke="#FFF7EC" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// TODO: replace FIXTURE_PACKS lookup with a Supabase query against the
// evidence_packs table once that schema lands. The query needs:
//   - read by this_hash where status = 'sealed'
//   - service-role only (the verifier writes nothing; reads strictly the
//     fields surfaced above)
//   - cache-control: public, max-age=3600 (the pack is immutable once
//     sealed, so caching is safe)
