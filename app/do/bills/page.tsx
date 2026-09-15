import type { Metadata } from 'next';
import { BillsDo } from './BillsDo';
export const metadata: Metadata = { title: 'Bills & budget · DO by assembl' };
export default function BillsPage() { return <BillsDo />; }
