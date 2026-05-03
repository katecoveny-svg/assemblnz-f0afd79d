import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface Deal {
  stage: string;
  value_nzd: number;
}

const STAGE_COLOURS: Record<string, string> = {
  discovery: "#C7D9E8",
  proposal: "#C9D8D0",
  negotiation: "#D9BC7A",
  closed_won: "#B8C7B1",
  closed_lost: "#D8C3C2",
};

const STAGE_LABEL: Record<string, string> = {
  discovery: "Discovery",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed won",
  closed_lost: "Closed lost",
};

export default function FluxPipelineChart({ deals }: { deals: Deal[] }) {
  const total = deals.reduce((s, d) => s + Number(d.value_nzd), 0);
  const data = Object.keys(STAGE_COLOURS).map((stage) => ({
    stage: STAGE_LABEL[stage],
    key: stage,
    value: deals.filter((d) => d.stage === stage).reduce((s, d) => s + Number(d.value_nzd), 0),
  }));

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D]">Total pipeline</div>
          <div className="font-display text-4xl text-[#6F6158]">
            ${total.toLocaleString("en-NZ", { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="font-mono text-xs text-[#9D8C7D]">{deals.length} deals</div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="stage" tick={{ fill: "#9D8C7D", fontSize: 11, fontFamily: "Inter" }} />
            <YAxis tick={{ fill: "#9D8C7D", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #D8C8B4", borderRadius: 12, fontFamily: "Inter" }}
              formatter={(v: number) => [`$${v.toLocaleString("en-NZ")}`, "Value"]}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={STAGE_COLOURS[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
