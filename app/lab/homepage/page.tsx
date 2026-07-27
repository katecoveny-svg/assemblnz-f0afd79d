import type { Metadata } from 'next';
import { HomepageLab } from './HomepageLab';

export const metadata: Metadata = {
  title: 'homepage lab · assembl',
  description: 'Palette and 3D-object variations for the homepage. Internal.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HomepageLab />;
}
