import type { Metadata } from 'next';
import { MessageWorkspace } from './MessageWorkspace';
export const metadata: Metadata = { title: { absolute: 'Messages · DO by assembl' }, description: 'Keep conversations, next steps and reviewed replies together.', robots: { index: false, follow: false } };
export default function Page() { return <MessageWorkspace />; }
