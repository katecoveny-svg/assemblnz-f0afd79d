import type { Metadata } from 'next';
import { TypeSafePilot } from '@/components/do/TypeSafePilot';
export const metadata: Metadata = { title: 'Studio × TypeSafe · pilot preview', robots: { index: false, follow: false } };
export default function Page() { return <TypeSafePilot surface="studio" />; }
