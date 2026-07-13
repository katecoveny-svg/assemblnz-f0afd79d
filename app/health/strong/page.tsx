import type { Metadata } from 'next';
import { StrongDashboard } from '@/components/health/StrongDashboard';

export const metadata: Metadata = {
  title: 'Strong — movement, food and recovery · assembl health',
  description: 'A fictional sample of the Strong 12-week health operating system by assembl.',
  robots: { index: false, follow: false },
};

export default function StrongPage() {
  return <StrongDashboard />;
}
