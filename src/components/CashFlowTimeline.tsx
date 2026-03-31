import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface CashFlowPeriod {
  label: string;
  inflows: { description: string; amount: number }[];
  outflows: { description: string; amount: number }[];
  projectedBalance: number;
}

interface Props {
  periods: CashFlowPeriod[];
  currentBalance: number;
  agentColor?: string;
}

const formatNZD = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(n);

const CashFlowTimeline = ({ periods, currentBalance, agentColor = "#5AADA0" }: Props) => {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(14,14,26,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-3">
        <DollarSign size={14} style={{ color: agentColor }} />
        <span className="text-xs font-bold text-foreground">Cash Flow Forecast</span>
      </div>

      {/* Current balance */}
      <div className="flex items-center justify-between mb-4 p-2.5 rounded-lg" style={{ background: agentColor + "08", border: `1px solid ${agentColor}20` }}>
        <span className="text-[10px] text-muted-foreground">Current balance</span>
        <span className="text-sm font-bold" style={{ color: agentColor }}>{formatNZD(currentBalance)}</span>
      </div>

      {/* Timeline */}
      <div className="relative pl-4 space-y-4">
        <div className="absolute left-1.5 top-0 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, ${agentColor}40, ${agentColor}10)` }} />

        {periods.map((period, i) => {
          const totalIn = period.inflows.reduce((s, f) => s + f.amount, 0);
          const totalOut = period.outflows.reduce((s, f) => s + f.amount, 0);
          const net = totalIn - totalOut;
          const isPositive = net >= 0;

          return (
            <div key={period.label} className="relative">
              <div className="absolute -left-[10.5px] top-1 w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: agentColor, background: i === 0 ? agentColor : "#0A0A14" }} />
              <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{period.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: isPositive ? "#5AADA0" : "#FF4D6A" }}>
                    {isPositive ? "+" : ""}{formatNZD(net)}
                  </span>
                </div>

                {period.inflows.map((f, j) => (
                  <div key={`in-${j}`} className="flex items-center justify-between py-0.5">
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <TrendingUp size={8} className="text-[#5AADA0]" /> {f.description}
                    </span>
                    <span className="text-[9px] text-[#5AADA0]">+{formatNZD(f.amount)}</span>
                  </div>
                ))}
                {period.outflows.map((f, j) => (
                  <div key={`out-${j}`} className="flex items-center justify-between py-0.5">
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <TrendingDown size={8} className="text-[#FF4D6A]" /> {f.description}
                    </span>
                    <span className="text-[9px] text-[#FF4D6A]">-{formatNZD(f.amount)}</span>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-white/[0.04]">
                  <span className="text-[9px] text-muted-foreground">Projected balance</span>
                  <span className="text-[10px] font-bold text-foreground">{formatNZD(period.projectedBalance)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[8px] text-muted-foreground/50 mt-3 text-center">
        Estimates based on information provided. Consult your accountant for formal advice.
      </p>
    </div>
  );
};

export default CashFlowTimeline;
