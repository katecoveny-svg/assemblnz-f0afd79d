import { useState, useMemo } from "react";
import { Globe } from "lucide-react";

const FTA_DATA: Record<string, { name: string; ftaRate: number; rules: string }> = {
  AU: { name: "AANZFTA", ftaRate: 0, rules: "Wholly obtained or substantial transformation (CTH)." },
  CN: { name: "NZ-China FTA", ftaRate: 0, rules: "Regional value content ≥ 40% or change in tariff classification." },
  JP: { name: "CPTPP", ftaRate: 0, rules: "PSR per CPTPP Annex 3-D, declaration of origin." },
  UK: { name: "NZ-UK FTA", ftaRate: 0, rules: "Originating goods per UK FTA Article 3.2; phased to 0% by 2038." },
  KR: { name: "NZ-Korea FTA", ftaRate: 0, rules: "PSR per NZ-Korea Annex 3-A." },
};

export default function PikauFtaChecker() {
  const [hs, setHs] = useState("");
  const [origin, setOrigin] = useState("AU");
  const [normalRate] = useState(5);

  const result = useMemo(() => {
    const fta = FTA_DATA[origin];
    const savings = ((normalRate - fta.ftaRate) / 100) * 10000;
    return { ...fta, normalRate, savings };
  }, [origin, normalRate]);

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto pt-20 lg:pt-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Globe size={18} className="text-[#B8C7B1]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">Trade</span>
        </div>
        <h1 className="font-display text-3xl text-[#6F6158]">FTA tariff checker</h1>
        <p className="font-body text-sm text-[#9D8C7D] mt-1">Find preferential rates by HS code and origin country.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6 space-y-4 mb-6">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] block mb-1">HS code</label>
          <input
            value={hs}
            onChange={(e) => setHs(e.target.value)}
            placeholder="e.g. 0402.10.10"
            className="w-full px-3 py-2 rounded-xl border border-[#D8C8B4]/40 bg-white font-mono text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] block mb-1">Origin country</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#D8C8B4]/40 bg-white font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
          >
            <option value="AU">Australia</option>
            <option value="CN">China</option>
            <option value="JP">Japan</option>
            <option value="UK">United Kingdom</option>
            <option value="KR">Korea</option>
          </select>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] mb-2">Applicable agreement</div>
        <div className="font-display text-2xl text-[#6F6158] mb-4">{result.name}</div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-[#F7F3EE]/60 border border-[#EEE7DE]">
            <div className="font-mono text-[10px] uppercase text-[#9D8C7D]">Normal duty</div>
            <div className="font-mono text-lg text-[#6F6158]">{result.normalRate}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F7F3EE]/60 border border-[#EEE7DE]">
            <div className="font-mono text-[10px] uppercase text-[#9D8C7D]">FTA duty</div>
            <div className="font-mono text-lg text-[#6F6158]">{result.ftaRate}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#C9D8D0]/30 border border-[#C9D8D0]/40">
            <div className="font-mono text-[10px] uppercase text-[#6F6158]">Savings (per $10k)</div>
            <div className="font-mono text-lg text-[#6F6158]">${result.savings.toFixed(0)}</div>
          </div>
        </div>

        <div className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] mb-1">Rules of origin</div>
        <p className="font-body text-sm text-[#6F6158]">{result.rules}</p>
      </div>
    </div>
  );
}
