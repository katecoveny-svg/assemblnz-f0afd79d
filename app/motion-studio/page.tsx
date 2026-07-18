import type { Metadata } from 'next';
import { MotionStudio } from '@/components/motion-studio/MotionStudio';
import './motion-studio.css';

export const metadata: Metadata = {
  title: 'motion studio · assembl',
  description: 'A free generative 3D particle and pattern maker. Sculpt, move, export and share a living visual study.',
  alternates: { canonical: '/motion-studio' },
};

export default function MotionStudioPage() {
  return <MotionStudio />;
}
