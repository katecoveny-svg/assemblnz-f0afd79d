import type { Metadata } from 'next';
import { KaiakoChat } from '@/components/alphassembl/KaiakoChat';

export const metadata: Metadata = {
  title: 'Kaiako — your Alphassembl trainer',
  description: 'A force-free dog-training chat for New Zealand owners, grounded in NZ advice with a Trust score on every reply.',
  robots: { index: false, follow: false },
};

export default function KaiakoChatPage() {
  return <KaiakoChat />;
}
