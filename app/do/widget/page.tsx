import type { Metadata } from 'next';
import { DoWorkspace } from '../DoWorkspace';
import '../do.css';
export const metadata: Metadata = { title: 'DO widget · assembl', robots: { index: false, follow: false } };
export default function DoWidgetPage() { return <div className="do-widget-page"><DoWorkspace embedded /></div>; }
