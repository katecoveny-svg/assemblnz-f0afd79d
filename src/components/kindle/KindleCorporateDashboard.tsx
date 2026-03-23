import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Eye, ThumbsUp, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Sparkles, ClipboardCheck, Lightbulb } from "lucide-react";

const KINDLE_COLOR = "#CE93D8";
const GLASS = { background: "rgba(15,15,18,0.8)", border: "1px solid rgba(255,255,255,0.06)" };

const allocations = [
  { cause: "Health charities", pct: 35, amount: "$42,000" },
  { cause: "Youth sport", pct: 22, amount: "$26,400" },
  { cause: "Education programmes", pct: 25, amount: "$30,000" },
  { cause: "Environmental causes", pct: 18, amount: "$21,600" },
];

const roiMetrics = [
  { label: "Cost Per Person Impacted", value: "$5.30", change: "-12%", trend: "down" as const },
  { label: "Brand Impressions", value: "248K", change: "+34%", trend: "up" as const },
  { label: "Media Value Estimate", value: "$62,400", change: "+18%", trend: "up" as const },
  { label: "Community Sentiment", value: "8.7/10", change: "+0.4", trend: "up" as const },
];

const causeMatches = [
  { name: "Starship Foundation", score: 95, reason: "Paediatric health aligned with child health priority", dimensions: [{ l: "Values", s: 98 }, { l: "Geography", s: 92 }, { l: "Impact", s: 94 }] },
  { name: "KidsCan", score: 88, reason: "Nationwide child poverty programme", dimensions: [{ l: "Values", s: 91 }, { l: "Geography", s: 85 }, { l: "Impact", s: 88 }] },
  { name: "Heart Foundation NZ", score: 82, reason: "Health sector alignment with research focus", dimensions: [{ l: "Values", s: 85 }, { l: "Geography", s: 80 }, { l: "Impact", s: 86 }] },
];

type DeliverableStatus = "complete" | "in_progress" | "pending" | "overdue";
const sponsorships = [
  { charity: "Starship Foundation", commitment: 42000, delivered: 28000, deliverables: [
    { name: "Logo on event banner", status: "complete" as DeliverableStatus }, { name: "Social media feature", status: "complete" as DeliverableStatus },
    { name: "Thank-you video", status: "in_progress" as DeliverableStatus }, { name: "Annual gala invitation", status: "pending" as DeliverableStatus },
  ]},
  { charity: "Cancer Society NZ", commitment: 30000, delivered: 22500, deliverables: [
    { name: "Sponsor badge", status: "complete" as DeliverableStatus }, { name: "Impact report Q1", status: "complete" as DeliverableStatus },
    { name: "Newsletter feature", status: "overdue" as DeliverableStatus }, { name: "Event naming rights", status: "pending" as DeliverableStatus },
  ]},
];

const statusIcon: Record<DeliverableStatus, { Icon: typeof CheckCircle2; cls: string }> = {
  complete: { Icon: CheckCircle2, cls: "text-green-400" },
  in_progress: { Icon: Clock, cls: "text-blue-400" },
  pending: { Icon: Clock, cls: "text-muted-foreground" },
  overdue: { Icon: AlertCircle, cls: "text-red-400" },
};

interface Props {
  onSendToChat?: (msg: string) => void;
}

const KindleCorporateDashboard = ({ onSendToChat }: Props) => {
  const [expanded, setExpanded] = useState<string | null>(sponsorships[0].charity);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-foreground">Corporate Impact Platform</h2>
        <p className="text-xs text-muted-foreground">Manage your ESG portfolio, CSR budget, and community impact.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Annual Community Budget", value: "$120,000" },
          { label: "Allocated Funding", value: "$87,000" },
          { label: "Charities Supported", value: "5" },
          { label: "People Impacted", value: "16,400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-xl p-3" style={GLASS}>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold tabular-nums text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Portfolio Allocation */}
      <div className="rounded-xl p-4" style={GLASS}>
        <h3 className="text-xs font-semibold text-foreground mb-3">Impact Portfolio Allocation</h3>
        <div className="space-y-2.5">
          {allocations.map(a => (
            <div key={a.cause}>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-foreground">{a.cause}</span>
                <span className="text-muted-foreground tabular-nums">{a.amount} ({a.pct}%)</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${a.pct}%` }} viewport={{ once: true }}
                  className="h-full rounded-full" style={{ background: KINDLE_COLOR }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Cause Matching */}
      <div className="rounded-xl p-4" style={GLASS}>
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={12} style={{ color: KINDLE_COLOR }} />
          <h3 className="text-xs font-semibold text-foreground">AI Cause Matching</h3>
        </div>
        <div className="space-y-3">
          {causeMatches.map(c => (
            <div key={c.name} className="rounded-lg p-3 bg-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.reason}</p>
                </div>
                <span className="text-xs font-bold tabular-nums" style={{ color: KINDLE_COLOR }}>{c.score}%</span>
              </div>
              <div className="space-y-1">
                {c.dimensions.map(d => (
                  <div key={d.l} className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground w-16">{d.l}</span>
                    <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full" style={{ width: `${d.s}%`, background: KINDLE_COLOR }} />
                    </div>
                    <span className="text-[9px] font-semibold tabular-nums text-foreground w-6 text-right">{d.s}%</span>
                  </div>
                ))}
              </div>
              <button onClick={() => onSendToChat?.(`Generate activation ideas for a partnership with ${c.name}`)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
                style={{ background: `${KINDLE_COLOR}15`, color: KINDLE_COLOR, border: `1px solid ${KINDLE_COLOR}30` }}>
                <Lightbulb size={10} /> Get Activation Ideas
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Metrics */}
      <div className="rounded-xl p-4" style={GLASS}>
        <h3 className="text-xs font-semibold text-foreground mb-3">ROI & Impact Metrics</h3>
        <div className="grid grid-cols-2 gap-2">
          {roiMetrics.map(m => (
            <div key={m.label} className="p-3 rounded-lg bg-white/5">
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="text-sm font-bold tabular-nums text-foreground">{m.value}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {m.trend === "up" ? <TrendingUp size={10} className="text-green-400" /> : <TrendingDown size={10} className="text-green-400" />}
                <span className="text-[10px] font-medium text-green-400">{m.change} YoY</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsorship Tracker */}
      <div className="rounded-xl p-4" style={GLASS}>
        <div className="flex items-center gap-1.5 mb-3">
          <ClipboardCheck size={12} style={{ color: KINDLE_COLOR }} />
          <h3 className="text-xs font-semibold text-foreground">Sponsorship Tracker</h3>
        </div>
        <div className="space-y-2">
          {sponsorships.map(sp => {
            const isOpen = expanded === sp.charity;
            const done = sp.deliverables.filter(d => d.status === "complete").length;
            const pct = Math.round((done / sp.deliverables.length) * 100);
            return (
              <div key={sp.charity} className="rounded-lg bg-white/5 overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : sp.charity)} className="w-full p-3 flex items-center gap-3 text-left">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{sp.charity}</p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">${sp.delivered.toLocaleString()} / ${sp.commitment.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: KINDLE_COLOR }} />
                    </div>
                    <span className="text-[10px] font-semibold tabular-nums text-foreground">{pct}%</span>
                    {isOpen ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 space-y-1.5">
                    {sp.deliverables.map(d => {
                      const { Icon, cls } = statusIcon[d.status];
                      return (
                        <div key={d.name} className="flex items-center gap-2 p-2 rounded-md bg-background/30">
                          <Icon size={12} className={cls} />
                          <span className="text-[10px] text-foreground flex-1">{d.name}</span>
                          <span className={`text-[9px] font-medium ${cls}`}>{d.status.replace("_", " ")}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KindleCorporateDashboard;
