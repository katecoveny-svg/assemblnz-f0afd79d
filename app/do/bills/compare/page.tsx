import type { Metadata } from 'next';
import { BillsDo } from '../BillsDo';
export const metadata: Metadata = { title: 'Compare a bill · DO by assembl' };
export default function BillComparisonPage() { return <BillsDo />; }
