import { Card, PageHeading, SectionLabel } from '@/components/bills/kit';
import { UploadDropzone } from '@/components/bills/UploadDropzone';
import { EmailDropzone } from '@/components/bills/EmailDropzone';
import { BillsTable } from '@/components/bills/BillsTable';
import { LiveState } from '@/components/bills/LiveState';
import Link from 'next/link';

export default function BillsPage() {
  return (
    <div>
      <PageHeading title="Bills" lead="Every tracked bill in one running log. Drop a PDF or photo, or forward a bill email and paste it in — both are read live." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <SectionLabel>Add a bill · PDF or photo</SectionLabel>
              <LiveState state="live" note="vision extraction" />
            </div>
            <UploadDropzone />
          </Card>
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <SectionLabel>Email in · forward &amp; paste</SectionLabel>
              <LiveState state="live" note="email extraction" />
            </div>
            <EmailDropzone />
            <p className="mt-3 text-xs" style={{ color: 'var(--b-faint)' }}>
              Full Gmail / Outlook auto-ingestion is next —{' '}
              <Link href="/bills/app/connections" className="font-semibold" style={{ color: 'var(--b-teal-deep)' }}>
                see connections →
              </Link>
            </p>
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
