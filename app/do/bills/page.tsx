import type { Metadata } from 'next';
import { BillsWorkspace } from './BillsWorkspace';
export const metadata: Metadata = { title: 'Watch my bills · DO by assembl', description: 'Check recurring payments and invoice dates, then prepare and review the next step. Try a fictional example or open your own NZD CSV locally.' };
export default function BillsPage() { return <BillsWorkspace />; }
