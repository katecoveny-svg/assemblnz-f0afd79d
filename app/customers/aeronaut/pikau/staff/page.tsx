import type { Metadata } from 'next';
import { listShifts, listStaff } from '@/lib/customs/store';
import { formatMoney } from '@/lib/customs/format';
import { Card, PageHeader, Pill, SectionTitle } from '@/components/customs/ui';
import type { StaffRole } from '@/lib/customs/types';

export const metadata: Metadata = { title: 'Staff & roster' };

const ROLE_LABEL: Record<StaffRole, string> = {
  senior_broker: 'Senior broker',
  broker: 'Broker',
  entry_clerk: 'Entry clerk',
  admin: 'Admin',
  driver: 'Driver',
};

export default async function StaffPage() {
  const staff = await listStaff();
  const shifts = await listShifts();
  const staffById = new Map(staff.map((s) => [s.id, s]));

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Staff, roster & pay"
        lead="The team, their licences and CPD, this week's shifts and timesheets, and the wage rates that feed payroll. Xero Payroll sync is a connected integration (hooks below)."
      />

      <SectionTitle right={<Pill tone="navy">Xero Payroll — connect to sync</Pill>}>Team</SectionTitle>
      <div className="overflow-hidden air-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[color:var(--air-line)] bg-[color:var(--air-mist)] text-left text-[0.75rem] uppercase tracking-[0.1em] text-[color:var(--air-slate)]">
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="hidden px-4 py-2.5 sm:table-cell">Licence</th>
              <th className="px-4 py-2.5">Rate</th>
              <th className="px-4 py-2.5">CPD</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => {
              const cpdOk = s.cpdHoursRequired === 0 || s.cpdHoursYtd >= s.cpdHoursRequired;
              return (
                <tr key={s.id} className="border-b border-[color:var(--air-line-soft)] last:border-0">
                  <td className="px-4 py-2.5 font-medium text-[color:var(--air-ink)]">{s.name}</td>
                  <td className="px-4 py-2.5">{ROLE_LABEL[s.role]}</td>
                  <td className="hidden px-4 py-2.5 font-mono text-xs sm:table-cell">{s.brokerLicence ?? '—'}</td>
                  <td className="px-4 py-2.5">{formatMoney(s.wageRateNzd)}/hr</td>
                  <td className="px-4 py-2.5">
                    {s.cpdHoursRequired === 0 ? (
                      <span className="text-xs text-[color:var(--air-slate)]">n/a</span>
                    ) : (
                      <Pill tone={cpdOk ? 'ok' : 'warn'}>{s.cpdHoursYtd}/{s.cpdHoursRequired} hrs</Pill>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <SectionTitle>Roster & timesheets</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {shifts.map((sh) => {
            const s = staffById.get(sh.staffId);
            return (
              <Card key={sh.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[color:var(--air-ink)]">{s?.name}</p>
                  <p className="text-xs text-[color:var(--air-slate)]">{sh.dateIso} · {sh.startHhmm}–{sh.endHhmm}</p>
                </div>
                {sh.workedHours != null ? (
                  <Pill tone="ok">{sh.workedHours} hrs logged</Pill>
                ) : (
                  <Pill tone="navy">rostered</Pill>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <Card mist className="mt-6">
        <p className="text-xs text-[color:var(--air-slate)]">
          <strong className="text-[color:var(--air-navy)]">Xero Payroll integration.</strong> The workspace maps each staff member and their logged hours to Xero Payroll pay items via the existing Xero connector (OAuth + <code className="font-mono">payroll.xro/2.0</code>). In the pilot this is a stub — no wages are filed. Connect Aironaut&apos;s Xero org to go live.
        </p>
      </Card>
    </div>
  );
}
