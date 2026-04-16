import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Layers, AlertTriangle, Shield, CheckCircle2, Lightbulb } from "lucide-react";

const POUNAMU = "#3A7D6E";

const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`} style={{
    background: "rgba(255,255,255,0.7)",
    borderColor: "rgba(0,0,0,0.06)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
  }}>{children}</div>
);

interface Finding { title: string; items: string[]; icon: React.ElementType; color: string }

export default function DocIntelPage() {
  const [document, setDocument] = useState("");
  const [question, setQuestion] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [findings, setFindings] = useState<Finding[]>([]);

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setFindings([
        { title: "Compliance Issues", icon: Shield, color: "#E44D4D", items: [
          "Section 5.2 references NZS 3604:2011 — superseded by NZS 3604:2023 amendment",
          "Missing Producer Statement (PS1) requirement for proprietary systems",
          "Health & Safety plan does not reference current WorkSafe PCBU guidelines",
        ]},
        { title: "Risk Identification", icon: AlertTriangle, color: "#F97316", items: [
          "Liquidated damages clause ($2,500/day) exceeds industry standard for contract value",
          "No force majeure clause — weather delays not addressed",
          "Retention release timeline (24 months) longer than standard 12-month defects period",
        ]},
        { title: "Key Findings", icon: CheckCircle2, color: POUNAMU, items: [
          "Contract value: $6.3M (excl. GST) — aligns with approved budget",
          "Programme: 18-month construction period with 12-month defects liability",
          "Payment terms: 20 working days per Construction Contracts Act 2002",
        ]},
        { title: "Recommendations", icon: Lightbulb, color: POUNAMU, items: [
          "Request amendment to NZS 3604 references to current version",
          "Negotiate force majeure inclusion for weather events",
          "Review retention terms — propose 12-month maximum",
          "Add dispute resolution clause per CCA 2002 s.25",
        ]},
      ]);
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText size={22} style={{ color: POUNAMU }} /> Document Intelligence — Tuhinga
        </h1>
        <p className="text-xs text-muted-foreground">AI-powered document analysis for construction contracts</p>
      </motion.div>

      <Glass className="p-6 space-y-4">
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block">Document Content</label>
          <textarea value={document} onChange={e => setDocument(e.target.value)} rows={8} placeholder="Paste contract, specification, or document content here..."
            className="w-full px-4 py-3 rounded-xl text-sm text-foreground bg-black/[0.03] border border-black/[0.08] focus:outline-none focus:border-black/20 resize-none placeholder:text-muted-foreground/60" />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block">Question (optional)</label>
          <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. What are the key compliance risks?"
            className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground bg-black/[0.03] border border-black/[0.08] focus:outline-none placeholder:text-muted-foreground/60" />
        </div>
        <motion.button onClick={analyze} disabled={analyzing || !document} whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-foreground disabled:opacity-50"
          style={{ background: POUNAMU }}>
          {analyzing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Layers size={16} /></motion.div> : <Search size={16} />}
          {analyzing ? "Analyzing..." : "Analyze Document"}
        </motion.button>
      </Glass>

      {findings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {findings.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Glass className="p-5 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${f.color}15` }}>
                    <f.icon size={16} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                </div>
                <ul className="space-y-2">
                  {f.items.map((item, j) => (
                    <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-muted-foreground/40 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Glass>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
