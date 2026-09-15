import type { Metadata } from 'next';
import { MitrePursuitHome } from './MitrePursuitHome';
import '../../do.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    absolute: 'DO · Mitre pursuit (private) · PREVIEW',
  },
  description:
    'Private Mitre 10 / SAP pursuit DEMO pack — not on public /do. Fictional fixtures only.',
  robots: { index: false, follow: false },
};

/** Private pack route — not linked from public /do. */
export default function MitrePursuitPage() {
  return <MitrePursuitHome />;
}
