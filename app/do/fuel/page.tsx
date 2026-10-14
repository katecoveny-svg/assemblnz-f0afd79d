import type { Metadata } from 'next';
import { FuelWatch } from './FuelWatch';
export const metadata: Metadata = {
  title: 'Fuel watch · DO by assembl',
  description: 'The weekly national fuel price with its date, your own tank, and whether to fill up today. No purchase, no location tracking.',
  robots: { index: false, follow: false },
};
export default function FuelPage() { return <FuelWatch />; }
