import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

interface Source {
  name: string;
  url?: string;
}

const NZ_LEGISLATION_MAP: Record<string, string> = {
  "health and safety at work act 2015": "https://www.legislation.govt.nz/act/public/2015/0070/latest/whole.html",
  "building act 2004": "https://www.legislation.govt.nz/act/public/2004/0072/latest/whole.html",
  "resource management act": "https://www.legislation.govt.nz/act/public/1991/0069/latest/whole.html",
  "employment relations act 2000": "https://www.legislation.govt.nz/act/public/2000/0024/latest/whole.html",
  "holidays act 2003": "https://www.legislation.govt.nz/act/public/2003/0129/latest/whole.html",
  "consumer guarantees act 1993": "https://www.legislation.govt.nz/act/public/1993/0091/latest/whole.html",
  "fair trading act 1986": "https://www.legislation.govt.nz/act/public/1986/0121/latest/whole.html",
  "privacy act 2020": "https://www.legislation.govt.nz/act/public/2020/0031/latest/whole.html",
  "food act 2014": "https://www.legislation.govt.nz/act/public/2014/0032/latest/whole.html",
  "sale and supply of alcohol act 2012": "https://www.legislation.govt.nz/act/public/2012/0120/latest/whole.html",
  "construction contracts act 2002": "https://www.legislation.govt.nz/act/public/2002/0046/latest/whole.html",
  "motor vehicle sales act 2003": "https://www.legislation.govt.nz/act/public/2003/0012/latest/whole.html",
  "biosecurity act 1993": "https://www.legislation.govt.nz/act/public/1993/0095/latest/whole.html",
  "customs and excise act 2018": "https://www.legislation.govt.nz/act/public/2018/0004/latest/whole.html",
  "immigration act 2009": "https://www.legislation.govt.nz/act/public/2009/0051/latest/whole.html",
  "education and training act 2020": "https://www.legislation.govt.nz/act/public/2020/0038/latest/whole.html",
  "residential tenancies act 1986": "https://www.legislation.govt.nz/act/public/1986/0120/latest/whole.html",
  "property law act 2007": "https://www.legislation.govt.nz/act/public/2007/0091/latest/whole.html",
  "maritime transport act 1994": "https://www.legislation.govt.nz/act/public/1994/0104/latest/whole.html",
  "fisheries act 1996": "https://www.legislation.govt.nz/act/public/1996/0088/latest/whole.html",
  "architects act 2005": "https://www.legislation.govt.nz/act/public/2005/0005/latest/whole.html",
  "unsolicited electronic messages act 2007": "https://www.legislation.govt.nz/act/public/2007/0007/latest/whole.html",
};

const NZ_ORG_MAP: Record<string, string> = {
  "worksafe": "https://www.worksafe.govt.nz",
  "worksafe nz": "https://www.worksafe.govt.nz",
  "mbie": "https://www.mbie.govt.nz",
  "mpi": "https://www.mpi.govt.nz",
  "nzta": "https://www.nzta.govt.nz",
  "waka kotahi": "https://www.nzta.govt.nz",
  "tourism nz": "https://www.tourismnewzealand.com",
  "doc": "https://www.doc.govt.nz",
  "branz": "https://www.branz.co.nz",
  "nzte": "https://www.nzte.govt.nz",
  "ird": "https://www.ird.govt.nz",
  "inland revenue": "https://www.ird.govt.nz",
  "immigration nz": "https://www.immigration.govt.nz",
  "hospitality nz": "https://www.hospitality.org.nz",
  "retail nz": "https://www.retail.kiwi",
  "nzia": "https://www.nzia.co.nz",
  "dairynz": "https://www.dairynz.co.nz",
  "beef+lamb nz": "https://beeflambnz.com",
  "hortnz": "https://www.hortnz.co.nz",
  "fonterra": "https://www.fonterra.com",
  "maritime nz": "https://www.maritimenz.govt.nz",
  "nz customs": "https://www.customs.govt.nz",
};

function extractSources(content: string): Source[] {
  const sources: Source[] = [];
  const seen = new Set<string>();
  const lower = content.toLowerCase();

  // Check legislation
  for (const [key, url] of Object.entries(NZ_LEGISLATION_MAP)) {
    if (lower.includes(key) && !seen.has(key)) {
      seen.add(key);
      const name = key.replace(/\b\w/g, (c) => c.toUpperCase());
      sources.push({ name, url });
    }
  }

  // Check organisations
  for (const [key, url] of Object.entries(NZ_ORG_MAP)) {
    if (lower.includes(key) && !seen.has(key)) {
      seen.add(key);
      const name = key.replace(/\b\w/g, (c) => c.toUpperCase());
      sources.push({ name, url });
    }
  }

  // Check for NZS standards
  const nzsMatches = content.match(/NZS\s*\d{4}/gi);
  if (nzsMatches) {
    for (const match of nzsMatches) {
      const key = match.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        sources.push({ name: match.toUpperCase(), url: "https://www.standards.govt.nz" });
      }
    }
  }

  return sources;
}

interface Props {
  content: string;
}

const ResponseSources = ({ content }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const sources = extractSources(content);

  if (sources.length === 0) return null;

  return (
    <div className="mt-2 pt-1.5" style={{ borderTop: "1px solid hsl(0 0% 100% / 0.04)" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[10px] font-medium transition-colors hover:opacity-80"
        style={{ color: "hsl(0 0% 100% / 0.25)" }}
        aria-expanded={expanded}
        aria-label={`Sources referenced: ${sources.length} found`}
      >
        {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        Sources referenced ({sources.length})
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-1 ml-3">
          {sources.map((source, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] underline flex items-center gap-1 transition-colors hover:opacity-80"
                  style={{ color: "hsl(0 0% 100% / 0.3)" }}
                >
                  {source.name}
                  <ExternalLink size={8} />
                </a>
              ) : (
                <span className="text-[10px]" style={{ color: "hsl(0 0% 100% / 0.25)" }}>
                  {source.name}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponseSources;
