import type { Metadata } from 'next';
import { DoHome } from './DoHome';
import './do.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'DO · your writing and task agents · assembl' },
  description: 'Prepare a brief, compare options and make the next step clearer. DO works with the text you choose, with review and an evidence receipt.',
  alternates: { canonical: '/do' },
};
export default function DoPage() { return <DoHome />; }
