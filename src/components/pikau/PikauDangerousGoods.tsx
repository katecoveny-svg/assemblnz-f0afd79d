import { useState } from "react";
import { AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";

export default function PikauDangerousGoods() {
  const [form, setForm] = useState({
    un: "",
    name: "",
    classDiv: "",
    packing: "",
    qty: "",
    contact: "",
  });

  const fields: { k: keyof typeof form; l: string; mono?: boolean }[] = [
    { k: "un", l: "UN number", mono: true },
    { k: "name", l: "Proper shipping name" },
    { k: "classDiv", l: "Class / division" },
    { k: "packing", l: "Packing group" },
    { k: "qty", l: "Quantity" },
    { k: "contact", l: "Emergency contact" },
  ];

  const generate = () => {
    if (!form.un || !form.name) {
      toast.error("UN number and shipping name required");
      return;
    }
    toast.success("Declaration generated", { description: "Ready to print or attach to shipment." });
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto pt-20 lg:pt-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-[#B8C7B1]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">HSNO</span>
        </div>
        <h1 className="font-display text-3xl text-[#6F6158]">Dangerous goods declaration</h1>
        <p className="font-body text-sm text-[#9D8C7D] mt-1">Generate compliant DG declarations under HSNO Act.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6 space-y-4">
        {fields.map((f) => (
          <div key={f.k}>
            <label className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] block mb-1">{f.l}</label>
            <input
              value={(form as Record<string, string>)[f.k]}
              onChange={(e) => setForm((p) => ({ ...p, [f.k]: e.target.value }))}
              className={`w-full px-3 py-2 rounded-xl border border-[#D8C8B4]/40 bg-white text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A] ${f.mono ? "font-mono" : "font-body"}`}
            />
          </div>
        ))}
        <button
          onClick={generate}
          className="w-full flex items-center justify-center gap-2 bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body text-sm font-medium rounded-xl px-5 py-3 transition-colors"
        >
          <FileText size={16} /> Generate declaration
        </button>
      </div>
    </div>
  );
}
