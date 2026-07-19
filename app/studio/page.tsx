import type { Metadata } from 'next';
import { StudioClient } from './StudioClient';

export const metadata: Metadata = {
  title: 'assembl studio · koro',
  description:
    'Assemble a working AI agent from typed, labelled components. First prototype — koro, a communications and customer response agent.',
};

export default function StudioPage() {
  return <StudioClient />;
}
