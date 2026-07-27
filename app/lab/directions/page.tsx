import type { Metadata } from 'next';
import { DirectionsLab } from './DirectionsLab';

export const metadata: Metadata = {
  title: 'directions lab · assembl',
  description: 'Four whole design directions for the homepage. Internal.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DirectionsLab />;
}
