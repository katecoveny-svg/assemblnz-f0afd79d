import { Card, PageHeading, SectionLabel } from '@/components/bills/kit';
import { UploadDropzone } from '@/components/bills/UploadDropzone';
import { BillsTable } from '@/components/bills/BillsTable';
import { LiveState } from '@/components/bills/LiveState';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function BillsPage() {
  return (
    <div>
      <PageHeading title="Bills" lead="Every tracked bill in one running log. Add one by dropping a PDF or photo, or connect your email to have them read automatically." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <SectionLabel>Add a bill</SectionLabel>
              <LiveState state="live" note="Claude Vision" />
            </div>
            <UploadDropzone />
          </Card>
          <Card>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}>
                <Mail size={17} />
              </span>
              <div>
                <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-bills-display), 'Cormorant Garamond', Georgia, serif", color: 'var(--b-ink)' }}>
                  Or connect your inbox
                </p>
                <p className="mt-1 text-sm" style={{ color: 'var(--b-muted)' }}>
                  assembl bills reads bill PDFs and email bodies from Gmail or Outlook — no manual entry.
                </p>
                <Link href="/bills/app/connections" className="mt-2 inline-block text-xs font-semibold" style={{ color: 'var(--b-teal-deep)' }}>
                  Set up connections →
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Tracked bills · 8</SectionLabel>
            <LiveState state="sample" note="uploads appear in your log" />
          </div>
          <BillsTable />
        </Card>
      </div>
    </div>
  );
}
