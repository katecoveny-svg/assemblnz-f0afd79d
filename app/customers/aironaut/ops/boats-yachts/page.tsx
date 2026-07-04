import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { CommsDrafts } from '@/components/ops/widgets/CommsDrafts';
import { ConsignmentsTable } from '@/components/ops/aironaut/ConsignmentsTable';
import { AironautDraftOnlyBanner } from '@/components/ops/aironaut/DraftOnlyBanner';
import {
  aironautBoatConsignments,
  aironautComms,
} from '@/lib/customers/aironaut/demo-data';

const serif = "var(--font-display), 'Cormorant Garamond', Georgia, serif";

/**
 * AIRONAUT · Boat & Yacht Transport — marine transport worldwide.
 * Full-bleed brand photograph (the navy superyacht bow with the orange
 * waterline), one line, then the working widgets. Draft-only.
 */
export default function AironautBoatsYachtsPage() {
  const config = getBrandConfig('aironaut');
  if (!config) notFound();
  const line = config.serviceLines?.find((s) => s.id === 'boats-yachts');

  return (
    <div className="flex flex-col">
      {/* Full-bleed hero — bow cuts in from the left, copy stays low-left
          under the scrim; the wall mark rides top-right. */}
      <section className="relative h-[72vh] min-h-[460px] w-full overflow-hidden">
        <Image
          src="/brand/aironaut/hero-yacht-bow-v2.png"
          alt="Navy superyacht bow with orange waterline stripe, AIRONAUT mark on the wall behind"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,31,58,0) 45%, rgba(11,31,58,0.72) 100%)',
          }}
        />
        <div className="absolute bottom-8 left-6 right-6 md:left-10">
          <h1
            className="max-w-2xl text-3xl leading-tight text-white md:text-5xl"
            style={{ fontFamily: serif, fontWeight: 500, textShadow: '0 1px 24px rgba(0,0,0,0.35)' }}
          >
            {line?.label ?? 'Boat & Yacht Transport'}
          </h1>
          <p className="mt-2 text-sm text-white/85">
            Yachts and launches shipped worldwide — cradles, flat racks, deck
            cargo or heavy-lift, with the customs side handled in the same
            call.
          </p>
        </div>
        <Link
          href="/customers/aironaut/ops"
          className="absolute left-6 top-6 rounded-full bg-white/85 px-3 py-1.5 text-[12px] backdrop-blur-sm transition hover:bg-white md:left-10"
        >
          ← dashboard
        </Link>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
        <div className="flex flex-col gap-6">
          <ConsignmentsTable
            title="Marine consignments"
            rows={aironautBoatConsignments}
          />
          <AironautDraftOnlyBanner />
          <CommsDrafts drafts={aironautComms} />
        </div>
      </div>
    </div>
  );
}
