import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";

export default function PikauLandedCost() {
  const [fob, setFob] = useState("10000");
  const [freight, setFreight] = useState("1500");
  const [insurance, setInsurance] = useState("150");
  const [dutyRate, setDutyRate] = useState("5");
  const [processingFee, setProcessingFee] = useState("60");
  const [bioLevy, setBioLevy] = useState("33");
  const [otherFees, setOtherFees] = useState("0");

  const calc = useMemo(() => {
    const f = parseFloat(fob) || 0;
    const fr = parseFloat(freight) || 0;
    const ins = parseFloat(insurance) || 0;
    const dr = parseFloat(dutyRate) || 0;
    const pf = parseFloat(processingFee) || 0;
    const bl = parseFloat(bioLevy) || 0;
    const other = parseFloat(otherFees) || 0;

    const cif = f + fr + ins;
    const duty = cif * (dr / 100);
    const gst = (cif + duty) * 0.15;
    const total = cif + duty + gst + pf + bl + other;
    return { cif, duty, gst, total };
  }, [fob, freight, insurance, dutyRate, processingFee, bioLevy, otherFees]);

  const fmt = (n: number) => `$${n.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fields = [
    { label: "FOB value", v: fob, set: setFob },
    { label: "Freight", v: freight, set: setFreight },
    { label: "Insurance", v: insurance, set: setInsurance },
    { label: "Duty rate (%)", v: dutyRate, set: setDutyRate },
    { label: "Processing fee", v: processingFee, set: setProcessingFee },
    { label: "Biosecurity levy", v: bioLevy, set: setBioLevy },
    { label: "Other fees", v: otherFees, set: setOtherFees },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto pt-20 lg:pt-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Calculator size={18} className="text-[#B8C7B1]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">Calculator</span>
        </div>
        <h1 className="font-display text-3xl text-[#6F6158]">Landed cost calculator</h1>
        <p className="font-body text-sm text-[#9D8C7D] mt-1">Estimate total NZ landed cost including duty, GST and fees.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6 space-y-3">
          {fields.map((f) => (
            <div key={f.label}>
              <label className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] block mb-1">{f.label}</label>
              <input
                type="number"
                value={f.v}
                onChange={(e) => f.set(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D8C8B4]/40 bg-white font-mono text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
              />
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6 space-y-4">
          <div className="space-y-3 font-mono text-sm">
            {[
              { label: "CIF value", v: calc.cif },
              { label: "Duty", v: calc.duty },
              { label: "GST 15%", v: calc.gst },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-[#9D8C7D]">
                <span>{r.label}</span><span>{fmt(r.v)}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#D9BC7A]/20 rounded-2xl p-5 mt-6">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] mb-1">Total landed cost</div>
            <div className="font-display text-3xl text-[#6F6158]">{fmt(calc.total)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
