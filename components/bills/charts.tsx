'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BILLS, CATEGORY_COLORS } from '@/app/bills/theme';
import {
  categorySplit,
  spendTrend,
  savings,
  type CategorySlice,
} from '@/lib/bills/data';

const money = (n: number) => `$${n.toLocaleString('en-NZ')}`;

const tooltipStyle = {
  background: 'rgba(17,22,35,0.92)',
  border: `1px solid ${BILLS.tealLine}`,
  borderRadius: 12,
  fontFamily: 'var(--font-bills-body), system-ui, sans-serif',
  fontSize: 12,
  color: BILLS.ink,
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(8px)',
} as const;

/** 7-month total spend, with the power line riding underneath it. */
export function SpendTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={spendTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="billsSpend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BILLS.teal} stopOpacity={0.28} />
            <stop offset="100%" stopColor={BILLS.teal} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="billsPower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BILLS.coral} stopOpacity={0.22} />
            <stop offset="100%" stopColor={BILLS.coral} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: BILLS.faint, fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={54}
          tick={{ fill: BILLS.faint, fontSize: 12 }}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [money(Number(v)), name === 'spend' ? 'Total bills' : 'Electricity']} />
        <Area isAnimationActive={false} type="monotone" dataKey="spend" stroke={BILLS.teal} strokeWidth={2.5} fill="url(#billsSpend)" style={{ filter: 'drop-shadow(0 0 6px rgba(47,107,79,0.5))' }} />
        <Area isAnimationActive={false} type="monotone" dataKey="power" stroke={BILLS.coral} strokeWidth={2} fill="url(#billsPower)" style={{ filter: 'drop-shadow(0 0 6px rgba(142,47,58,0.45))' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Category split donut with a total in the middle. */
export function CategoryDonut({ data = categorySplit }: { data?: CategorySlice[] }) {
  const total = data.reduce((n, d) => n + d.amount, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            isAnimationActive={false}
            data={data}
            dataKey="amount"
            nameKey="category"
            innerRadius={68}
            outerRadius={104}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={d.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [money(Number(v)) + '/mo', n]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[12px] uppercase tracking-wide" style={{ color: BILLS.faint }}>
          per month
        </span>
        <span className="text-2xl font-bold" style={{ color: BILLS.ink, fontFamily: "var(--font-bills-display), system-ui, sans-serif" }}>
          {money(total)}
        </span>
      </div>
    </div>
  );
}

/** Legend for the donut (rendered beside it in the layout). */
export function CategoryLegend({ data = categorySplit }: { data?: CategorySlice[] }) {
  return (
    <ul className="space-y-2">
      {data.map((d, i) => (
        <li key={d.category} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2" style={{ color: BILLS.muted }}>
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
            />
            {d.category}
          </span>
          <span className="font-semibold" style={{ color: BILLS.ink }}>
            {money(d.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Savings by bill — horizontal bars in teal (money staying home). */
export function SavingsBarChart() {
  const data = savings
    .map((s) => ({ name: s.toProvider, category: s.category, value: s.annualSaving }))
    .sort((a, b) => b.value - a.value);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: BILLS.faint, fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
        <YAxis
          type="category"
          dataKey="name"
          width={104}
          tickLine={false}
          axisLine={false}
          tick={{ fill: BILLS.muted, fontSize: 12 }}
        />
        <Tooltip cursor={{ fill: BILLS.tealSoft }} contentStyle={tooltipStyle} formatter={(v) => [money(Number(v)) + '/yr', 'Saving']} />
        <Bar isAnimationActive={false} dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {data.map((d, i) => (
            <Cell key={i} fill={BILLS.teal} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
