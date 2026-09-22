import type { Metadata } from 'next';
import { FlexExperience } from '@/components/flex/FlexExperience';
export const metadata: Metadata = { title: 'assembl flex · Studio proof', robots: { index: false, follow: false } };
export default function Page() { return <FlexExperience surface="studio" />; }
