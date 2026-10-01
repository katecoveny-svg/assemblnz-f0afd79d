import type { Metadata } from 'next';
import CoordinationReview from './CoordinationReview';
export const metadata: Metadata = { title: 'EA coordination review · DO', robots: { index: false, follow: false } };
export default function Page() { return <CoordinationReview />; }
