import type { Metadata } from 'next';
import { DoFocusWorkspace } from '@/components/do/DoFocusWorkspace';
import '../do.css';
export const metadata: Metadata = {
  title: { absolute: 'DO workspace · assembl' },
  robots: { index: false, follow: false },
};
export default function DoWidgetPage() { return <DoFocusWorkspace />; }
