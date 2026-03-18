import { useState } from "react";
import { Copy, Download, AlertTriangle, Check } from "lucide-react";

interface EntryLine {
  line: number;
  description: string;
  hsCode: string;
  origin: string;
  valueNZD: string;
  duty: string;
  gst: string;
  flagged?: boolean;
  flagReason?: string;
}

interface EntryData {
  supplier?: string;
  consignee?: string;
  invoice?: string;
  transport?: string;
  lines: EntryLine[];
  totalValue?: string;
  totalDuty?: string;
  totalGST?: string;
  totalPayable?: string;
  flaggedItems?: string[];
}

interface Props {
  data: EntryData;
  color?: string;
}

const NexusEntryCard = ({ data, color = "#5B8CFF" }: Props) => {
  const [copied, setCopied] = useState(false);

  const toCSV = () => {
    const header = "Line,Description,HS Code,Origin,Value (NZD),Duty,GST,Flagged\n";
    const rows = data.lines
      .map(
        (l) =>
          `${l.line},"${l.description}",${l.hsCode},${l.origin},${l.valueNZD},${l.duty},${l.gst},${l.flagged ? "⚠️ " + (l.flagReason || "Review") : ""}`
      )
      .join("\n");
    const totals = `\nTOTALS,,,,${data.totalValue || ""},${data.totalDuty || ""},${data.totalGST || ""},\nTOTAL PAYABLE:,,,,${data.totalPayable || ""},,`;
    return header + rows + totals;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(toCSV());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([toCSV()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `import-entry-${data.invoice || "data"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#0F0F1C", border: `1px solid ${color}15`, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${color}15` }}>
        <h4 className="text-sm font-bold" style={{ color }}>
          📦 Import Entry Summary
        </h4>
        <div className="flex gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
            style={{ background: color + "15", color, border: `1px solid ${color}25` }}
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
            style={{ background: color + "15", color, border: `1px solid ${color}25` }}
          >
            <Download size={10} />
            CSV
          </button>
        </div>
      </div>

      {/* Meta */}
      {(data.supplier || data.invoice || data.transport) && (
        <div className="px-4 py-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]" style={{ borderBottom: `1px solid ${color}08` }}>
          {data.supplier && (
            <>
              <span className="text-foreground/40">Supplier</span>
              <span className="text-foreground/70">{data.supplier}</span>
            </>
          )}
          {data.consignee && (
            <>
              <span className="text-foreground/40">Consignee</span>
              <span className="text-foreground/70">{data.consignee}</span>
            </>
          )}
          {data.invoice && (
            <>
              <span className="text-foreground/40">Invoice</span>
              <span className="text-foreground/70">{data.invoice}</span>
            </>
          )}
          {data.transport && (
            <>
              <span className="text-foreground/40">Transport</span>
              <span className="text-foreground/70">{data.transport}</span>
            </>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${color}15` }}>
              {["#", "Description", "HS Code", "Origin", "Value (NZD)", "Duty", "GST"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold" style={{ color: color + "90" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.lines.map((l) => (
              <tr key={l.line} style={{ borderBottom: `1px solid ${color}08` }}>
                <td className="px-3 py-1.5 text-foreground/50">{l.line}</td>
                <td className="px-3 py-1.5 text-foreground/80 max-w-[200px]">
                  <div className="flex items-start gap-1">
                    {l.flagged && <AlertTriangle size={12} className="text-yellow-400 shrink-0 mt-0.5" />}
                    <span>{l.description}</span>
                  </div>
                </td>
                <td className="px-3 py-1.5 font-mono text-foreground/70">
                  {l.hsCode}
                  {l.flagged && <span className="text-yellow-400 ml-1">⚠️</span>}
                </td>
                <td className="px-3 py-1.5 text-foreground/60">{l.origin}</td>
                <td className="px-3 py-1.5 font-mono text-foreground/80">{l.valueNZD}</td>
                <td className="px-3 py-1.5 font-mono text-foreground/70">{l.duty}</td>
                <td className="px-3 py-1.5 font-mono text-foreground/70">{l.gst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-4 py-3 space-y-1" style={{ borderTop: `1px solid ${color}15` }}>
        {data.totalValue && (
          <div className="flex justify-between text-xs">
            <span className="text-foreground/50">Customs Value</span>
            <span className="font-mono text-foreground/80">{data.totalValue}</span>
          </div>
        )}
        {data.totalDuty && (
          <div className="flex justify-between text-xs">
            <span className="text-foreground/50">Total Duty</span>
            <span className="font-mono text-foreground/80">{data.totalDuty}</span>
          </div>
        )}
        {data.totalGST && (
          <div className="flex justify-between text-xs">
            <span className="text-foreground/50">Total GST</span>
            <span className="font-mono text-foreground/80">{data.totalGST}</span>
          </div>
        )}
        {data.totalPayable && (
          <div className="flex justify-between text-xs font-semibold pt-1" style={{ borderTop: `1px solid ${color}15` }}>
            <span style={{ color }}>TOTAL PAYABLE</span>
            <span style={{ color }}>{data.totalPayable}</span>
          </div>
        )}
      </div>

      {/* Flagged items */}
      {data.flaggedItems && data.flaggedItems.length > 0 && (
        <div className="px-4 py-3" style={{ borderTop: `1px solid ${color}15`, background: "#FFB80008" }}>
          <p className="text-[11px] font-semibold text-yellow-400 mb-1.5 flex items-center gap-1">
            <AlertTriangle size={12} /> Items Flagged for Broker Review
          </p>
          {data.flaggedItems.map((item, i) => (
            <p key={i} className="text-[11px] text-foreground/60 pl-4">• {item}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default NexusEntryCard;
