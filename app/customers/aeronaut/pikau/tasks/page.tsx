import Link from 'next/link';
import type { Metadata } from 'next';
import { listStaff, listTasks } from '@/lib/customs/store';
import { formatNzDate } from '@/lib/customs/format';
import { PageHeader, Pill } from '@/components/customs/ui';
import type { TaskLane } from '@/lib/customs/types';

export const metadata: Metadata = { title: 'Workboard' };

const LANES: { id: TaskLane; label: string }[] = [
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'done', label: 'Done' },
];

export default async function TasksPage() {
  const [tasks, staff] = await Promise.all([listTasks(), listStaff()]);
  const staffById = new Map(staff.map((s) => [s.id, s]));

  return (
    <div>
      <PageHeader eyebrow="Operations" title="Team workboard" lead="Who's doing what across every open entry and obligation — the week at a glance." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {LANES.map((lane) => {
          const laneTasks = tasks.filter((t) => t.lane === lane.id);
          return (
            <div key={lane.id} className="air-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="air-display text-base">{lane.label}</h2>
                <Pill tone="navy">{laneTasks.length}</Pill>
              </div>
              <div className="space-y-2">
                {laneTasks.map((t) => (
                  <div key={t.id} className="rounded-lg border border-[color:var(--air-line-soft)] bg-[color:var(--air-card)] p-3">
                    {t.entryId ? (
                      <Link href={`/customers/aeronaut/pikau/entries/${t.entryId}`} className="text-sm text-[color:var(--air-ink)] hover:underline">{t.title}</Link>
                    ) : (
                      <p className="text-sm text-[color:var(--air-ink)]">{t.title}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {t.priority === 'high' ? <Pill tone="hold">high</Pill> : null}
                      {t.assigneeId ? <Pill tone="navy">{staffById.get(t.assigneeId)?.name.split(' ')[0]}</Pill> : null}
                      {t.dueIso ? <span className="text-[0.75rem] text-[color:var(--air-slate)]">{formatNzDate(t.dueIso)}</span> : null}
                    </div>
                  </div>
                ))}
                {laneTasks.length === 0 ? <p className="text-xs text-[color:var(--air-slate)]">Nothing here.</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
