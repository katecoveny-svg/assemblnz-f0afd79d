import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionReveal } from '@/components/SectionReveal';

export const metadata: Metadata = {
  title: 'Meta data deletion',
  description:
    'How assembl handles Meta Platform data-deletion requests for the optional Meta Business connection.',
};

const LAST_REVIEWED = '17 September 2026';

type PageProps = {
  searchParams?: Promise<{ code?: string }> | { code?: string };
};

export default async function MetaDataDeletionPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const code = typeof params.code === 'string' ? params.code : null;

  return (
    <section className="relative overflow-hidden bg-[color:var(--assembl-paper,#FFFDFB)]">
      <div className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <SectionReveal>
            <p className="font-mono text-[12px] uppercase tracking-[0.32em] text-[color:var(--text-secondary,#654A4E)]">
              Legal · Meta data deletion
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1
              className="mt-6 font-display leading-[0.98] tracking-tight text-[#240B21]"
              style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
            >
              Meta data deletion.
            </h1>
            <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary,#654A4E)]">
              Last reviewed · {LAST_REVIEWED}
            </p>
          </SectionReveal>

          <div className="mt-12 space-y-10 text-base leading-relaxed text-[color:var(--text-body,#240B21)] md:text-[17px]">
            <SectionReveal delay={0.2}>
              <p>
                Meta Business is an optional user-connected integration. assembl does not require
                a Meta login to use the public marketing site, and we do not run Facebook Pixel
                or Meta advertising cookies on assembl.co.nz.
              </p>
              <p className="mt-3">
                When you connect Meta Business inside Assembl, we store non-secret connection
                metadata (selected Business Portfolio, Page, Instagram and Ad Account names/IDs)
                and vault access tokens in a service-role-only credentials table. Tokens are never
                exposed to the browser.
              </p>
            </SectionReveal>

            {code ? (
              <SectionReveal delay={0.22}>
                <div className="rounded-[16px] border border-[rgba(36,11,33,0.10)] bg-[#F5F1F2]/70 p-6 md:p-8">
                  <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#916A70]">
                    Confirmation code
                  </p>
                  <p className="mt-3 font-mono text-[15px] tracking-[0.04em] text-[#240B21]">
                    {code}
                  </p>
                  <p className="mt-3 text-[15px] text-[#654A4E]">
                    Keep this code. It confirms Assembl received a Meta Platform deletion request
                    for the associated Meta user. Completion status is recorded against this code.
                  </p>
                </div>
              </SectionReveal>
            ) : null}

            <SectionReveal delay={0.25}>
              <h2 className="font-display text-2xl font-light md:text-3xl text-[#240B21]">
                What gets deleted
              </h2>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc">Vaulted Meta access tokens for your connection.</li>
                <li className="list-disc">
                  Connection metadata (portfolio / page / Instagram / ad account selection).
                </li>
                <li className="list-disc">
                  OAuth state rows associated with incomplete or completed Meta connect attempts.
                </li>
              </ul>
              <p className="mt-3">
                Account data you created inside Assembl that is not Meta-sourced (Pursuit briefs,
                Studio drafts, billing records) is not deleted by a Meta Platform callback. Use the
                normal Assembl privacy request path for that.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.3}>
              <h2 className="font-display text-2xl font-light md:text-3xl text-[#240B21]">
                How to request deletion
              </h2>
              <ol className="mt-3 space-y-2 pl-5">
                <li className="list-decimal">
                  From Meta / Facebook settings, remove the Assembl app — Meta will call our
                  deletion callback.
                </li>
                <li className="list-decimal">
                  Or disconnect Meta Business from{' '}
                  <Link href="/agency/connections" className="underline-offset-2 hover:underline">
                    /agency/connections
                  </Link>
                  .
                </li>
                <li className="list-decimal">
                  Or email{' '}
                  <a
                    href="mailto:privacy@assembl.co.nz"
                    className="underline-offset-2 hover:underline"
                  >
                    privacy@assembl.co.nz
                  </a>{' '}
                  with subject “Meta data deletion”.
                </li>
              </ol>
            </SectionReveal>

            <SectionReveal delay={0.35}>
              <p className="text-sm text-[color:var(--text-secondary,#654A4E)]">
                See also:{' '}
                <Link href="/legal/privacy" className="underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>
                {' · '}
                <Link href="/legal/terms" className="underline-offset-2 hover:underline">
                  Terms of Use
                </Link>
                {' · '}
                <Link href="/agency/connections" className="underline-offset-2 hover:underline">
                  Agency connections
                </Link>
              </p>
            </SectionReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
