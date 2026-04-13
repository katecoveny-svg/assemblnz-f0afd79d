import { useState } from "react";
import { FileText, Upload, CheckCircle2, Circle, AlertTriangle, Ship, Package, ExternalLink } from "lucide-react";

export interface JobSheetData {
  consignee?: string;
  supplier?: string;
  vessel?: string;
  billOfLading?: string;
  containerNumbers?: string[];
  goodsDescriptions?: string[];
  weights?: string;
  packages?: string;
  origin?: string;
}

export interface DocumentStatus {
  jobSheet: boolean;
  commercialInvoice: boolean;
  packingList: boolean;
  billOfLading: boolean;
  certificateOfOrigin: boolean;
  phytosanitaryCert: boolean;
  fumigationCert: boolean;
  other: boolean;
}

interface MPIAlert {
  item: string;
  reason: string;
  requirement: string;
}

interface Props {
  color: string;
  onUploadJobSheet: () => void;
  workflowStep: number;
  jobSheetData: JobSheetData | null;
  documentStatus: DocumentStatus;
  mpiAlerts: MPIAlert[];
  containerNumbers: string[];
  isProcessing: boolean;
}

const NEXUS_COLOR = "#1A3A5C";

const STEPS = [
  "Upload Job Sheet",
  "Review Extracted Data",
  "Upload Supporting Documents",
  "Review Entry",
  "Approve for Lodgement",
];

const NexusJobSheet = ({
  color = NEXUS_COLOR,
  onUploadJobSheet,
  workflowStep,
  jobSheetData,
  documentStatus,
  mpiAlerts,
  containerNumbers,
  isProcessing,
}: Props) => {

  const [expandedContainer, setExpandedContainer] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {/* Step Progress */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#0F0F1C", border: `1px solid ${color}15` }}
      >
        <h4 className="text-xs font-bold mb-3" style={{ color }}>
          IMPORT ENTRY WORKFLOW
        </h4>
        <div className="flex items-center gap-1">
          {STEPS.map((step, i) => {
            const active = i === workflowStep;
            const done = i < workflowStep;
            return (
              <div key={step} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                    style={{
                      backgroundColor: done ? color : active ? color + "30" : "transparent",
                      border: `2px solid ${done || active ? color : color + "25"}`,
                      color: done ? "#0A0A14" : active ? color : color + "40",
                    }}
                  >
                    {done ? "" : i + 1}
                  </div>
                  <span
                    className="text-[8px] mt-1 text-center leading-tight"
                    style={{ color: done || active ? color : color + "40" }}
                  >
                    {step}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="h-0.5 flex-1 rounded-full mt-[-12px]"
                    style={{ backgroundColor: done ? color : color + "15" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Checklist Card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#0F0F1C", border: `1px solid ${color}15` }}
      >
        <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${color}10` }}>
          <h4 className="text-xs font-bold flex items-center gap-1.5" style={{ color }}>
            <Package size={12} /> Documents Needed
          </h4>
        </div>
        <div className="px-4 py-3 space-y-2">
          {[
            { key: "jobSheet" as const, label: "Job Sheet / Freight Instructions" },
            { key: "commercialInvoice" as const, label: "Commercial Invoice" },
            { key: "packingList" as const, label: "Packing List" },
            { key: "billOfLading" as const, label: "Bill of Lading / AWB" },
            { key: "certificateOfOrigin" as const, label: "Certificate of Origin" },
            { key: "phytosanitaryCert" as const, label: "Phytosanitary Certificate" },
            { key: "fumigationCert" as const, label: "Fumigation Certificate" },
          ].map((doc) => (
            <div key={doc.key} className="flex items-center gap-2">
              {documentStatus[doc.key] ? (
                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
              ) : (
                <Circle size={14} style={{ color: color + "40" }} className="shrink-0" />
              )}
              <span
                className="text-xs"
                style={{
                  color: documentStatus[doc.key] ? "hsl(var(--foreground))" : `hsl(var(--muted-foreground))`,
                  textDecoration: documentStatus[doc.key] ? "line-through" : "none",
                  opacity: documentStatus[doc.key] ? 0.6 : 1,
                }}
              >
                {doc.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MPI / Biosecurity Alerts */}
      {mpiAlerts.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#2A2000", border: "1px solid #FFB80030" }}
        >
          <div className="px-4 py-2.5 flex items-center gap-1.5" style={{ borderBottom: "1px solid #FFB80015" }}>
            <AlertTriangle size={13} className="text-yellow-400" />
            <h4 className="text-xs font-bold text-yellow-400">
              MPI / Biosecurity Alerts
            </h4>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {mpiAlerts.map((alert, i) => (
              <div key={i} className="text-xs">
                <p className="font-semibold text-yellow-300">{alert.item}</p>
                <p className="text-yellow-200/60 mt-0.5">{alert.reason}</p>
                <p className="text-yellow-200/80 mt-0.5 italic">→ {alert.requirement}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Container Tracking */}
      {containerNumbers.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#0F0F1C", border: `1px solid ${color}15` }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${color}10` }}>
            <h4 className="text-xs font-bold flex items-center gap-1.5" style={{ color }}>
              <Ship size={12} /> Container Tracking
            </h4>
          </div>
          <div className="px-4 py-3 space-y-2">
            {containerNumbers.map((cn) => (
              <div key={cn}>
                <button
                  onClick={() => setExpandedContainer(expandedContainer === cn ? null : cn)}
                  className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg transition-colors"
                  style={{ background: color + "10", border: `1px solid ${color}15` }}
                >
                  <span className="font-mono font-semibold" style={{ color }}>{cn}</span>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: color + "80" }}>
                    <ExternalLink size={10} />
                    {expandedContainer === cn ? "Hide" : "Track"}
                  </span>
                </button>
                {expandedContainer === cn && (
                  <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: color + "20" }}>
                    <iframe
                      src={`https://www.searates.com/container/tracking/?number=${cn}`}
                      className="w-full h-[400px]"
                      title={`Container tracking: ${cn}`}
                      sandbox="allow-scripts allow-same-origin allow-popups"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload prompt when at step 0 or step 2 */}
      {(workflowStep === 0 || workflowStep === 2) && (
        <button
          onClick={onUploadJobSheet}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01] disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${color}15, ${color}08)`,
            border: `1px dashed ${color}40`,
            color,
          }}
        >
          <Upload size={16} />
          {workflowStep === 0 ? "Upload Job Sheet / Freight Instructions" : "Upload Additional Document"}
        </button>
      )}
    </div>
  );
};

export default NexusJobSheet;
