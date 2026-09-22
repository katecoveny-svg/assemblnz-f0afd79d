import type { Metadata } from 'next';
import { FlexExperience } from '@/components/flex/FlexExperience';
export const metadata: Metadata = { title: 'assembl flex · your home, in agreement', description: 'Explore a simulated household energy journey with explicit boundaries, approval and proof.', robots: { index: false, follow: false } };
export default function Page() { return <FlexExperience />; }
