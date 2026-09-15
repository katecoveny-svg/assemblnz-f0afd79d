import type { Metadata } from 'next';
import { DoHome } from './DoHome';
import './do.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'DO · your portable agent workforce · assembl' },
  description: 'Give DO a job where you already work. Connect the tools you choose, use the right model for the task, review consequential actions, and keep evidence attached.',
  alternates: { canonical: '/do' },
};

export default function DoPage() { return <DoHome />; }
