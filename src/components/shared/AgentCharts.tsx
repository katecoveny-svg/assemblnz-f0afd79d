import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ─── Shared dark-themed tooltip ─── */
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs font-body shadow-xl" style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)" }}>
      {label && <p className="text-muted-foreground mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name}: <span className="font-mono font-semibold">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span></p>
      ))}
    </div>
  );
};

/* ─── AGENT BAR CHART ─── */
export function AgentBarChart({ data, dataKey, nameKey = "name", color, title, prefix = "", height = 200 }: {
  data: any[]; dataKey: string; nameKey?: string; color: string; title?: string; prefix?: string; height?: number;
}) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
      {title && <h4 className="font-display font-bold text-xs text-foreground mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} tickFormatter={v => `${prefix}${v.toLocaleString()}`} />
          <Tooltip content={<DarkTooltip />} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── AGENT LINE CHART ─── */
export function AgentLineChart({ data, lines, nameKey = "name", title, height = 200 }: {
  data: any[]; lines: { key: string; color: string; name?: string }[]; nameKey?: string; title?: string; height?: number;
}) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
      {title && <h4 className="font-display font-bold text-xs text-foreground mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<DarkTooltip />} />
          {lines.map(l => (
            <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} name={l.name || l.key} strokeWidth={2} dot={{ r: 3, fill: l.color }} activeDot={{ r: 5 }} />
          ))}
          {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-body)" }} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── AGENT AREA CHART ─── */
export function AgentAreaChart({ data, areas, nameKey = "name", title, height = 200 }: {
  data: any[]; areas: { key: string; color: string; name?: string }[]; nameKey?: string; title?: string; height?: number;
}) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
      {title && <h4 className="font-display font-bold text-xs text-foreground mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <defs>
            {areas.map(a => (
              <linearGradient key={a.key} id={`grad-${a.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={a.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={a.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<DarkTooltip />} />
          {areas.map(a => (
            <Area key={a.key} type="monotone" dataKey={a.key} stroke={a.color} fill={`url(#grad-${a.key})`} name={a.name || a.key} strokeWidth={2} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── AGENT PIE / DONUT CHART ─── */
export function AgentPieChart({ data, dataKey = "value", nameKey = "name", title, donut = true, height = 200, colors }: {
  data: any[]; dataKey?: string; nameKey?: string; title?: string; donut?: boolean; height?: number; colors?: string[];
}) {
  const COLORS = colors || ["#5AADA0", "#3A6A9C", "#3A6A9C", "#1A3A5C", "#7E57C2", "#3A7D6E", "#00BFA5", "#42A5F5"];
  return (
    <div className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
      {title && <h4 className="font-display font-bold text-xs text-foreground mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={donut ? "55%" : 0} outerRadius="80%" dataKey={dataKey} nameKey={nameKey} strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-body)" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── FUNNEL CHART (visual, not recharts) ─── */
export function AgentFunnelChart({ stages, title, color }: {
  stages: { name: string; value: number; color?: string }[]; title?: string; color: string;
}) {
  const max = Math.max(...stages.map(s => s.value), 1);
  return (
    <div className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
      {title && <h4 className="font-display font-bold text-xs text-foreground mb-3">{title}</h4>}
      <div className="space-y-2">
        {stages.map((s, i) => {
          const pct = (s.value / max) * 100;
          const convRate = i > 0 ? ((s.value / stages[i - 1].value) * 100).toFixed(0) : null;
          return (
            <div key={s.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-body text-muted-foreground">{s.name}</span>
                <div className="flex items-center gap-2">
                  {convRate && <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{convRate}%</span>}
                  <span className="text-xs font-mono font-bold text-foreground">{s.value.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: s.color || color, opacity: 1 - i * 0.15 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── STATUS WORKFLOW ─── */
export function AgentWorkflow({ steps, activeIndex = -1, color, title }: {
  steps: { label: string; count?: number; sub?: string }[]; activeIndex?: number; color: string; title?: string;
}) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
      {title && <h4 className="font-display font-bold text-xs text-foreground mb-3">{title}</h4>}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1 shrink-0">
            <div className="flex flex-col items-center gap-0.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all"
                style={{
                  background: i <= activeIndex ? `${color}25` : "rgba(255,255,255,0.04)",
                  color: i <= activeIndex ? color : "rgba(255,255,255,0.3)",
                  border: `1px solid ${i <= activeIndex ? color + "40" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {s.count ?? i + 1}
              </div>
              <span className="text-[9px] font-body text-center max-w-[60px] leading-tight" style={{ color: i <= activeIndex ? color : "rgba(255,255,255,0.35)" }}>{s.label}</span>
              {s.sub && <span className="text-[8px] text-muted-foreground">{s.sub}</span>}
            </div>
            {i < steps.length - 1 && <div className="w-6 h-px mt-[-12px]" style={{ background: i < activeIndex ? color + "50" : "rgba(255,255,255,0.08)" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── KPI ROW ─── */
export function AgentKPIRow({ kpis }: {
  kpis: { label: string; value: string | number; change?: string; color?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {kpis.map(k => (
        <div key={k.label} className="rounded-xl p-3 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="text-[10px] font-body text-muted-foreground">{k.label}</p>
          <p className="font-display font-bold text-base text-foreground">{k.value}</p>
          {k.change && <p className="text-[10px] font-mono" style={{ color: k.color || "#5AADA0" }}>{k.change}</p>}
        </div>
      ))}
    </div>
  );
}
