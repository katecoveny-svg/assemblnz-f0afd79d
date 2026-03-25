import { ExternalLink, Scale } from "lucide-react";

interface LegislationRef {
  actName: string;
  section?: string;
  sectionText?: string;
  year: string;
  actNumber: string;
  url: string;
}

const NZ_ACT_MAP: Record<string, { year: string; number: string }> = {
  "health and safety at work act 2015": { year: "2015", number: "0070" },
  "building act 2004": { year: "2004", number: "0072" },
  "resource management act 1991": { year: "1991", number: "0069" },
  "resource management act": { year: "1991", number: "0069" },
  "employment relations act 2000": { year: "2000", number: "0024" },
  "holidays act 2003": { year: "2003", number: "0129" },
  "consumer guarantees act 1993": { year: "1993", number: "0091" },
  "fair trading act 1986": { year: "1986", number: "0121" },
  "privacy act 2020": { year: "2020", number: "0031" },
  "food act 2014": { year: "2014", number: "0032" },
  "sale and supply of alcohol act 2012": { year: "2012", number: "0120" },
  "construction contracts act 2002": { year: "2002", number: "0046" },
  "motor vehicle sales act 2003": { year: "2003", number: "0012" },
  "biosecurity act 1993": { year: "1993", number: "0095" },
  "customs and excise act 2018": { year: "2018", number: "0004" },
  "immigration act 2009": { year: "2009", number: "0051" },
  "education and training act 2020": { year: "2020", number: "0038" },
  "residential tenancies act 1986": { year: "1986", number: "0120" },
  "property law act 2007": { year: "2007", number: "0091" },
  "maritime transport act 1994": { year: "1994", number: "0104" },
  "fisheries act 1996": { year: "1996", number: "0088" },
  "architects act 2005": { year: "2005", number: "0005" },
  "unsolicited electronic messages act 2007": { year: "2007", number: "0007" },
  "health practitioners competence assurance act 2003": { year: "2003", number: "0048" },
  "climate change response act 2002": { year: "2002", number: "0040" },
  "companies act 1993": { year: "1993", number: "0105" },
  "income tax act 2007": { year: "2007", number: "0097" },
  "goods and services tax act 1985": { year: "1985", number: "0141" },
  "mental health act 1992": { year: "1992", number: "0046" },
};

function extractLegislationRefs(content: string): LegislationRef[] {
  const refs: LegislationRef[] = [];
  const seen = new Set<string>();
  const lower = content.toLowerCase();

  for (const [key, { year, number }] of Object.entries(NZ_ACT_MAP)) {
    if (!lower.includes(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);

    const actName = key.replace(/\b\w/g, (c) => c.toUpperCase());
    const url = `https://www.legislation.govt.nz/act/public/${year}/${number}/latest/whole.html`;

    // Try to find a section reference near this act mention
    const actPattern = new RegExp(
      `section\\s+(\\d+[A-Za-z]?)(?:\\s*(?:of|,)\\s*(?:the\\s*)?${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const sectionMatch = actPattern.exec(content);

    refs.push({
      actName,
      section: sectionMatch ? `Section ${sectionMatch[1]}` : undefined,
      year,
      actNumber: number,
      url: sectionMatch
        ? `https://www.legislation.govt.nz/act/public/${year}/${number}/latest/whole.html#DLM${sectionMatch[1]}`
        : url,
    });
  }

  return refs;
}

interface Props {
  content: string;
  agentColor: string;
}

const LegislationCard = ({ content, agentColor }: Props) => {
  const refs = extractLegislationRefs(content);
  if (refs.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {refs.map((ref, i) => (
        <a
          key={i}
          href={ref.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2.5 px-3 py-2 rounded-lg border transition-all hover:scale-[1.01] group"
          style={{
            borderColor: agentColor + "20",
            background: `linear-gradient(135deg, ${agentColor}08, transparent)`,
          }}
        >
          <Scale
            size={14}
            className="mt-0.5 shrink-0 transition-colors"
            style={{ color: agentColor + "80" }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-foreground/90 truncate">
                 {ref.actName}
                {ref.section && (
                  <span style={{ color: agentColor }} className="ml-1 font-bold">
                    {ref.section}
                  </span>
                )}
              </span>
            </div>
          </div>
          <ExternalLink
            size={10}
            className="shrink-0 mt-1 opacity-30 group-hover:opacity-70 transition-opacity"
            style={{ color: agentColor }}
          />
        </a>
      ))}
    </div>
  );
};

export default LegislationCard;
