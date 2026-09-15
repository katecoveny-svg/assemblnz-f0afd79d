import type { Metadata } from 'next';
import { FamilyDo } from './FamilyDo';
export const metadata: Metadata = { title: 'School admin, organised · DO by assembl', robots: { index: false, follow: false } };
export default function FamilyPage() { return <FamilyDo />; }
