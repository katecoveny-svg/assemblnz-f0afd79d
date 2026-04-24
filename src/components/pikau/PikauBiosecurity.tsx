import { useState } from "react";
import { Bug } from "lucide-react";

const ITEMS = [
  { id: "timber", label: "Timber / wood packaging", desc: "ISPM-15 stamp present, no bark or pests" },
  { id: "food", label: "Food products", desc: "Declared, MPI IHS compliant" },
  { id: "plant", label: "Plant material", desc: "Phytosanitary certificate from origin NPPO" },
  { id: "animal", label: "Animal products", desc: "MPI veterinary certification" },
  { id: "equipment", label: "Used equipment", desc: "Cleaned of soil/organic matter" },
  { id: "soil", label: "Soil / organic matter", desc: "EPA-approved or removed" },
];

type Status = "pass" | "fail" | "na";

export default function PikauBiosecurity() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  const setStatus = (id: string, s: Status) => setStatuses((p) => ({ ...p, [id]: s }));
  const completed = ITEMS.filter((i) => statuses[i.id]).length;
  const pct = (completed / ITEMS.length) * 100;

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto pt-20 lg:pt-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Bug size={18} className="text-[#B8C7B1]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">MPI</span>
        </div>
        <h1 className="font-display text-3xl text-[#6F6158]">Biosecurity checklist</h1>
        <p className="font-body text-sm text-[#9D8C7D] mt-1">Confirm every risk-good category for MPI clearance.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-xs text-[#9D8C7D]">Progress</span>
            <span className="font-mono text-xs text-[#6F6158]">{completed} / {ITEMS.length}</span>
          </div>
          <div className="h-2 bg-[#EEE7DE] rounded-full overflow-hidden">
            <div className="h-full bg-[#C9D8D0] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F3EE]/60 border border-[#EEE7DE]">
              <div>
                <div className="font-body font-medium text-sm text-[#6F6158]">{item.label}</div>
                <div className="font-body text-xs text-[#9D8C7D] mt-0.5">{item.desc}</div>
              </div>
              <div className="flex gap-1">
                {(["pass", "fail", "na"] as Status[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(item.id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-body uppercase tracking-wider transition-all ${
                      statuses[item.id] === s
                        ? s === "pass"
                          ? "bg-[#C9D8D0] text-[#6F6158]"
                          : s === "fail"
                            ? "bg-red-100 text-red-700"
                            : "bg-[#EEE7DE] text-[#6F6158]"
                        : "text-[#9D8C7D] hover:bg-[#EEE7DE]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
