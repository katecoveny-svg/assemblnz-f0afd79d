import { Calendar } from "lucide-react";

// Mock WoF/CoF expiry data — wire to real DB later
const VEHICLES = [
  { rego: "AAA001", make: "Toyota Hilux", expires: 5 },
  { rego: "BBB123", make: "Ford Ranger", expires: 12 },
  { rego: "CCC456", make: "Mazda CX-5", expires: 28 },
  { rego: "DDD789", make: "Holden Colorado", expires: 45 },
  { rego: "EEE012", make: "Nissan Navara", expires: 3 },
  { rego: "FFF345", make: "Mitsubishi Triton", expires: 90 },
];

const colourFor = (days: number) => {
  if (days <= 7) return "bg-red-50 text-red-700 border-red-200";
  if (days <= 30) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-green-50 text-green-700 border-green-200";
};

const labelFor = (days: number) => {
  if (days <= 7) return "Critical";
  if (days <= 30) return "Due soon";
  return "On track";
};

export default function AratakiWofCalendar() {
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto pt-20 lg:pt-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={18} className="text-[#D5C0C8]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">Compliance</span>
        </div>
        <h1 className="font-display text-3xl text-[#6F6158]">WoF / CoF calendar</h1>
        <p className="font-body text-sm text-[#9D8C7D] mt-1">Vehicles due for inspection in the next 90 days.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
        <div className="space-y-3">
          {VEHICLES.sort((a, b) => a.expires - b.expires).map((v) => (
            <div key={v.rego} className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F3EE]/60 border border-[#EEE7DE]">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-display text-2xl text-[#6F6158]">{v.expires}</div>
                  <div className="font-mono text-[10px] text-[#9D8C7D] uppercase">days</div>
                </div>
                <div>
                  <div className="font-body font-medium text-[#6F6158]">{v.make}</div>
                  <div className="font-mono text-xs text-[#9D8C7D]">{v.rego}</div>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium border ${colourFor(v.expires)}`}>
                {labelFor(v.expires)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
