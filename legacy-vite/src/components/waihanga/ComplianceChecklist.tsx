import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, AlertCircle } from "lucide-react";

const STATS = [
  { label: "Building Code Clauses", value: "22 / 26", pct: 85, sub: "verified" },
  { label: "Resource Consent Items", value: "8 / 11", pct: 73, sub: "complete" },
  { label: "District Plan Rules", value: "14 / 15", pct: 93, sub: "compliant" },
];

const CODE_ROWS = [
  ["B1", "Structure", "B1/VM1, NZS 1170, NZS 3101", "verified"],
  ["B2", "Durability", "B2/AS1", "verified"],
  ["C1-C6", "Protection from Fire", "C/AS7 (Risk Group SM/SA/WL)", "review"],
  ["D1", "Access Routes", "D1/AS1, NZS 4121", "verified"],
  ["D2", "Mechanical Installations", "D2/AS1", "verified"],
  ["E1", "Surface Water", "E1/AS1", "verified"],
  ["E2", "External Moisture", "E2/AS1", "review"],
  ["F2", "Hazardous Building Materials", "F2/AS1", "verified"],
  ["G1-G4", "Personal Hygiene", "G1/AS1–G4/AS1", "verified"],
  ["G12", "Water Supplies", "G12/AS1, AS/NZS 3500", "pending"],
  ["H1", "Energy Efficiency", "H1/AS1", "pending"],
];

const RC_ITEMS = [
  ["AEE", "complete"], ["Urban Design Assessment", "complete"], ["Transport Impact Assessment", "complete"],
  ["Shading/Daylight Analysis", "complete"], ["Acoustic Assessment", "progress"], ["Stormwater Management Plan", "complete"],
  ["Contaminated Land Assessment NES", "complete"], ["Cultural Impact Assessment", "progress"], ["Infrastructure Capacity Assessment", "pending"],
];

const DP_RULES = [
  ["Height in Relation to Boundary H12.6.2", "compliant"],
  ["Maximum Building Height 25m", "infringes", "27.2m"],
  ["Minimum Setback", "compliant"], ["Maximum Building Coverage", "compliant"],
  ["Outlook Space", "compliant"], ["Car Parking", "compliant"],
  ["Landscaping & Screening", "compliant"], ["Wind Effects H12.6.12", "compliant"],
];

function StatusBadge({ status }: { status: string }) {
  const cls = status === "verified" || status === "complete" || status === "compliant"
    ? "bg-primary/10 text-primary"
    : status === "review" || status === "progress" || status === "infringes"
    ? "bg-[hsl(30,80%,55%)]/10 text-[hsl(30,80%,55%)]"
    : "bg-[#1A3A5C]/10 text-blue-400";
  const label = status === "verified" ? "Verified" : status === "complete" ? "Complete" : status === "compliant" ? "Compliant" : status === "review" ? "In Review" : status === "progress" ? "In Progress" : status === "infringes" ? "Infringes" : "Pending";
  return <span className={`text-[10px] px-2 py-0.5 rounded ${cls}`}>{label}</span>;
}

export default function ComplianceChecklist() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
              <p className="text-xs text-primary">{s.pct}% {s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-3"><CardTitle className="text-base font-medium">NZ Building Code Compliance</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left p-3">Clause</th><th className="text-left p-3">Description</th><th className="text-left p-3 hidden sm:table-cell">Acceptable Solution</th><th className="text-left p-3">Status</th>
              </tr></thead>
              <tbody>
                {CODE_ROWS.map(([clause, desc, sol, status]) => (
                  <tr key={clause} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs text-primary">{clause}</td>
                    <td className="p-3 text-foreground">{desc}</td>
                    <td className="p-3 text-muted-foreground text-xs hidden sm:table-cell">{sol}</td>
                    <td className="p-3"><StatusBadge status={status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Resource Consent Requirements</CardTitle>
            <p className="text-xs text-muted-foreground">Auckland Unitary Plan — Restricted Discretionary</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {RC_ITEMS.map(([name, status]) => (
                <li key={name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {status === "complete" ? <Check size={14} className="text-primary" /> : status === "progress" ? <Clock size={14} className="text-[hsl(42,78%,60%)]" /> : <AlertCircle size={14} className="text-blue-400" />}
                    <span className="text-foreground">{name}</span>
                  </div>
                  <StatusBadge status={status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">District Plan Rules</CardTitle>
            <p className="text-xs text-muted-foreground">Business Mixed Use Zone</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {DP_RULES.map(([name, status, extra]) => (
                <li key={name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{name}</span>
                  <div className="flex items-center gap-2">
                    {extra && <span className="text-[10px] text-[hsl(30,80%,55%)]">{extra}</span>}
                    <StatusBadge status={status} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
