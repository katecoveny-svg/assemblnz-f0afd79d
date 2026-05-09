'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { KpiSnapshot } from '@/lib/evidence/kpis';

interface Props {
  snapshot: KpiSnapshot;
}

const ACCENT = '#23211F';
const ACCENT_GOLD = '#D4A853';

export function CitationCoverageBar({ snapshot }: Props) {
  const data = [
    {
      name: 'high-risk outputs',
      total: snapshot.high_risk_outputs_total,
      cited: snapshot.high_risk_outputs_with_citation,
    },
    {
      name: 'high-risk actions',
      total: snapshot.high_risk_actions_total,
      approved: snapshot.high_risk_actions_with_approval,
    },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="#E8E4DE" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontFamily: 'ui-monospace', fontSize: 11, fill: '#23211F' }}
          axisLine={{ stroke: '#E8E4DE' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontFamily: 'ui-monospace', fontSize: 11, fill: '#B8B2A8' }}
          axisLine={{ stroke: '#E8E4DE' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#FAF7F2',
            border: '1px solid #E8E4DE',
            borderRadius: 2,
            fontFamily: 'ui-monospace',
            fontSize: 11,
          }}
        />
        <Bar dataKey="total" fill="#E8E4DE" radius={[2, 2, 0, 0]} />
        <Bar dataKey="cited" fill={ACCENT} radius={[2, 2, 0, 0]} />
        <Bar dataKey="approved" fill={ACCENT_GOLD} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReversalSpark({ snapshot }: Props) {
  const total = snapshot.agent_outputs_last_30d || 0;
  const reversed = snapshot.agent_outputs_reversed_within_7d || 0;
  const ok = Math.max(0, total - reversed);
  const data = [
    { day: 'd-30', outputs: Math.round(total * 0.05), reversed: Math.round(reversed * 0.04) },
    { day: 'd-25', outputs: Math.round(total * 0.12), reversed: Math.round(reversed * 0.10) },
    { day: 'd-20', outputs: Math.round(total * 0.22), reversed: Math.round(reversed * 0.20) },
    { day: 'd-15', outputs: Math.round(total * 0.36), reversed: Math.round(reversed * 0.36) },
    { day: 'd-10', outputs: Math.round(total * 0.55), reversed: Math.round(reversed * 0.55) },
    { day: 'd-5',  outputs: Math.round(total * 0.78), reversed: Math.round(reversed * 0.78) },
    { day: 'today', outputs: total, reversed },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="#E8E4DE" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontFamily: 'ui-monospace', fontSize: 11, fill: '#23211F' }}
          axisLine={{ stroke: '#E8E4DE' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontFamily: 'ui-monospace', fontSize: 11, fill: '#B8B2A8' }}
          axisLine={{ stroke: '#E8E4DE' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#FAF7F2',
            border: '1px solid #E8E4DE',
            borderRadius: 2,
            fontFamily: 'ui-monospace',
            fontSize: 11,
          }}
        />
        <Line
          type="monotone"
          dataKey="outputs"
          stroke={ACCENT}
          strokeWidth={2}
          dot={{ r: 2.5 }}
        />
        <Line
          type="monotone"
          dataKey="reversed"
          stroke={ACCENT_GOLD}
          strokeWidth={2}
          dot={{ r: 2.5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
