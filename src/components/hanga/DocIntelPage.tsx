import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Layers, AlertTriangle, Shield, CheckCircle2, Lightbulb } from "lucide-react";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";

const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`} style={{
    background: "linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))",
    borderColor: "rgba(255,255,255,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
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
        { title: "Recommendations", icon: Lightbulb, color: KOWHAI, items: [
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
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><FileText size={22} style={{ color: KOWHAI }} /> Document Intelligence — Tuhinga</h1>
        <p className="text-xs text-white/40">AI-powered document analysis for construction contracts</p>
      </motion.div>

      <Glass className="p-6 space-y-4">
        <div>
          <label className="text-[11px] text-white/40 mb-1 block">Document Content</label>
          <textarea value={document} onChange={e => setDocument(e.target.value)} rows={8} placeholder="Paste contract, specification, or document content here..."
            className="w-full px-4 py-3 rounded-xl text-sm text-white bg-white/[0.04] border border-white/[0.06] focus:outline-none focus:border-white/20 resize-none" />
        </div>
        <div>
          <label className="text-[11px] text-white/40 mb-1 block">Question (optional)</label>
          <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. What are the key compliance risks?"
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/[0.04] border border-white/[0.06] focus:outline-none" />
        </div>
        <motion.button onClick={analyze} disabled={analyzing || !document} whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
          style={{ background: KOWHAI, color: "#09090F" }}>
          {analyzing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Brain size={16} /></motion.div> : <Search size={16} />}
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
                  <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                </div>
                <ul className="space-y-2">
                  {f.items.map((item, j) => (
                    <li key={j} className="text-xs text-white/50 leading-relaxed flex gap-2">
                      <span className="text-white/20 mt-0.5">•</span>
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
