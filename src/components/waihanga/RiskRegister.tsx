import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RISKS = [
  { id: "R1", title: "Geotechnical Uncertainty", score: 15, level: "Critical", color: "hsl(0 60% 55%)", desc: "Clay lens identified at BH-04, may require piled foundations adding $800K–$1.2M.", mitigation: "Additional boreholes ordered, results due 20 Apr.", row: 4, col: 2 },
  { id: "R2", title: "Consent Timeline Overrun", score: 16, level: "Critical", color: "hsl(0 60% 55%)", desc: "Height infringement (27.2m vs 25m limit) triggers restricted discretionary activity.", mitigation: "Pre-application meeting completed; urban design report supports height.", row: 3, col: 3 },
  { id: "R3", title: "Construction Material Supply", score: 12, level: "High", color: "hsl(30 80% 55%)", desc: "Steel lead time 16 weeks, facade system 20 weeks from order.", mitigation: "Early procurement initiated; Pacific Steel alternatives assessed.", row: 3, col: 2 },
  { id: "R4", title: "Mana Whenua Engagement Delay", score: 9, level: "Medium", color: "hsl(42 78% 60%)", desc: "Cultural Impact Assessment requires Ngāti Whātua Ōrākei engagement — limited Q2 availability.", mitigation: "Initial kōrero scheduled 22 Apr.", row: 2, col: 2 },
];

const SEV = ["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"];
const LIK = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];

function cellColor(s: number, l: number): string {
  const score = (s + 1) * (l + 1);
  if (score >= 15) return "hsl(0 60% 25%)";
  if (score >= 10) return "hsl(30 80% 25%)";
  if (score >= 5) return "hsl(42 78% 25%)";
  return "hsl(142 50% 20%)";
}

export default function RiskRegister() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card border-l-4" style={{ borderLeftColor: "hsl(0 60% 55%)" }}>
          <CardContent className="p-5"><p className="text-xs text-muted-foreground">Critical Risks</p><p className="text-3xl font-semibold text-destructive">2</p></CardContent>
        </Card>
        <Card className="bg-card border-l-4" style={{ borderLeftColor: "hsl(30 80% 55%)" }}>
          <CardContent className="p-5"><p className="text-xs text-muted-foreground">High Risks</p><p className="text-3xl font-semibold text-[hsl(30,80%,55%)]">2</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Matrix */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Risk Matrix</CardTitle>
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary">ARAI Safety Agent</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead><tr><th></th>{LIK.map(l => <th key={l} className="p-1 text-muted-foreground text-center">{l}</th>)}</tr></thead>
                <tbody>
                  {[...SEV].reverse().map((s, si) => {
                    const sevIdx = 4 - si;
                    return (
                      <tr key={s}>
                        <td className="p-1 text-muted-foreground text-right pr-2 whitespace-nowrap">{s}</td>
                        {LIK.map((_, li) => {
                          const risk = RISKS.find(r => r.row === sevIdx && r.col === li);
                          return (
                            <td key={li} className="p-1">
                              <div className="w-full aspect-square rounded flex items-center justify-center text-[9px] font-bold" style={{ background: cellColor(sevIdx, li), minWidth: 28 }}>
                                {risk && <span className="w-5 h-5 rounded-full flex items-center justify-center text-foreground" style={{ background: risk.color }}>{risk.id.slice(1)}</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Risk cards */}
        <div className="space-y-3">
          {RISKS.map(r => (
            <Card key={r.id} className="bg-card border-l-4" style={{ borderLeftColor: r.color }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{r.id} — {r.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: `${r.color}20`, color: r.color }}>{r.level} ({r.score})</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{r.desc}</p>
                <p className="text-xs"><span className="text-muted-foreground">Mitigation:</span> <span className="text-foreground">{r.mitigation}</span></p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
