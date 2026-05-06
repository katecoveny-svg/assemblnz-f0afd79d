import type { Metadata } from 'next';
import { EvidenceVessel } from '@/components/EvidenceVessel';

export const metadata: Metadata = {
  title: 'Evidence Vessel — preview',
  description: 'Component preview',
  robots: { index: false, follow: false },
};

export default function EvidenceVesselPreview() {
  return <EvidenceVessel />;
}
