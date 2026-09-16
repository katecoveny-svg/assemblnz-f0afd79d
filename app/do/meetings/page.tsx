import type { Metadata } from 'next';
import { MeetingDo } from './MeetingDo';

export const metadata: Metadata = {
  title: { absolute: 'Meeting DO · record, review and prepare · assembl' },
  description: 'Record, review and prepare meeting notes with visible drafts and receipts. Demo sample notes use fictional names.',
  alternates: { canonical: '/do/meetings' },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MeetingDo />;
}
