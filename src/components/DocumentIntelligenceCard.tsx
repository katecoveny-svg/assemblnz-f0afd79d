import { FileText, Download, X } from "lucide-react";

interface ExtractedField {
  label: string;
  value: string;
}

interface DocumentIntelligenceCardProps {
  documentType: string;
  fields: ExtractedField[];
  agentColor: string;
  actions?: { label: string; onClick: () => void }[];
  onDismiss?: () => void;
}

const DocumentIntelligenceCard = ({
  documentType,
  fields,
  agentColor,
  actions = [],
  onDismiss,
}: DocumentIntelligenceCardProps) => {
  return (
    <div
      className="rounded-xl overflow-hidden relative"
      style={{
        background: "rgba(14,14,26,0.85)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${agentColor}20`,
      }}
    >
      {/* Scan-line animation */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] animate-scan-line"
        style={{
          background: `linear-gradient(90deg, transparent, ${agentColor}, transparent)`,
          opacity: 0.6,
        }}
      />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: agentColor + "15" }}
            >
              <FileText size={14} style={{ color: agentColor }} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: agentColor }}>
                Document Scanned
              </span>
              <p className="text-[9px] text-muted-foreground">{documentType}</p>
            </div>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="text-muted-foreground/40 hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="space-y-1.5 mb-3">
          {fields.map((field, i) => (
            <div key={i} className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] text-muted-foreground shrink-0">{field.label}:</span>
              <span className="text-[11px] text-foreground font-medium text-right">{field.value}</span>
            </div>
          ))}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="text-[10px] font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{
                  color: agentColor,
                  border: `1px solid ${agentColor}30`,
                  background: `${agentColor}08`,
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentIntelligenceCard;
