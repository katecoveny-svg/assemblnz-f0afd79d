import type { Metadata } from 'next';
import { DoFocusWorkspace } from '@/components/do/DoFocusWorkspace';
import '../do.css';
import { DO_TASKS } from '@/apps/do/shared/preparation';
export const metadata: Metadata = {
  title: { absolute: 'DO workspace · assembl' },
  robots: { index: false, follow: false },
};
export default async function DoWidgetPage({ searchParams }: { searchParams: Promise<{ task?: string | string[] }> }) {
  const { task } = await searchParams;
  const initialTask = DO_TASKS.find(option => option.id === task)?.id ?? 'reply';
  return <DoFocusWorkspace initialTask={initialTask} />;
}
