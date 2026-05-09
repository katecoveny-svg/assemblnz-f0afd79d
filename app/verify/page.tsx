import type { Metadata } from 'next';
import { VerifyClient } from './VerifyClient';

export const metadata: Metadata = {
  title: 'Verify a Mana Receipt',
  description:
    'Paste any Mana Receipt issued by Assembl. We check the cryptographic signature against our public key, confirm the hash chain, and show you exactly what was attested.',
};

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[760px]">
        <p className="font-mono text-[11px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> evidence ledger
        </p>
        <h1
          className="mt-3 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
          style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 6vw, 3.6rem)' }}
        >
          verify a Mana Receipt
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[color:var(--text-primary)]">
          Paste any Mana Receipt issued by Assembl. We check the cryptographic
          signature against our public key, confirm the hash chain, and show
          you exactly what was attested — citations, the four pou, the three
          gates, and human-in-the-loop status.
        </p>

        <VerifyClient />

        <footer className="mt-16 border-t border-[color:var(--assembl-cloud)] pt-4 text-center font-mono text-[11px] tracking-[0.04em] text-[color:var(--text-secondary)]">
          public key{' '}
          <a
            href="/.well-known/assembl-agent-keys.json"
            className="text-[color:var(--assembl-gold-thread)] underline"
          >
            assembl.co.nz/.well-known/assembl-agent-keys.json
          </a>
        </footer>
      </div>
    </main>
  );
}
