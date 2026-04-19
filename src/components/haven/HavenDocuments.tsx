import { FileText, Download } from "lucide-react";

const HAVEN_PINK = "#4AA5A8";

const NZ_TEMPLATES = [
  { title: "Residential Tenancy Agreement", act: "Residential Tenancies Act 1986", desc: "Standard NZ tenancy agreement compliant with current legislation." },
  { title: "Property Inspection Report", act: "Residential Tenancies Act 1986, s48", desc: "Comprehensive property condition report for routine inspections." },
  { title: "Section 51 Notice to Tenant", act: "Residential Tenancies Act 1986, s51", desc: "Formal notice to tenant — e.g. end of periodic tenancy (90 days)." },
  { title: "Rent Increase Notice", act: "Residential Tenancies Act 1986, s24", desc: "90-day notice required for any rent increase." },
  { title: "Bond Lodgement Form", act: "Residential Tenancies Act 1986, s19", desc: "Bond lodgement with Tenancy Services within 23 working days." },
  { title: "Healthy Homes Compliance Statement", act: "Healthy Homes Guarantee Act 2017", desc: "Statement of compliance covering heating, insulation, ventilation, moisture, and draught stopping." },
];

const HavenDocuments = ({ onSendToChat }: { onSendToChat: (msg: string) => void }) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      <div>
        <h2 className="font-display font-bold text-base text-foreground">Documents</h2>
        <p className="text-[11px] font-body text-muted-foreground">NZ-compliant templates & AI document parser</p>
      </div>

      {/* AI Parser */}
      <div className="rounded-xl p-3 border space-y-2" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: HAVEN_PINK + "20" }}>
        <h3 className="font-display font-bold text-xs" style={{ color: HAVEN_PINK }}> AI Document Parser</h3>
        <p className="text-[10px] text-muted-foreground font-body">Upload a tenancy agreement or inspection report and HAVEN will extract key details.</p>
        <button onClick={() => onSendToChat("Parse my uploaded document and extract the key details")}
          className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: HAVEN_PINK + "20", color: HAVEN_PINK }}>
          Upload & Parse via Chat
        </button>
      </div>

      {/* Templates */}
      <div>
        <h3 className="font-display font-bold text-sm text-foreground mb-2">NZ Document Templates</h3>
        <div className="space-y-2">
          {NZ_TEMPLATES.map(t => (
            <div key={t.title} className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <FileText size={14} className="mt-0.5" style={{ color: HAVEN_PINK }} />
                  <div>
                    <p className="text-xs font-display font-bold text-foreground">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground font-body mt-0.5">{t.desc}</p>
                    <p className="text-[9px] font-mono-jb mt-1" style={{ color: HAVEN_PINK + "80" }}>{t.act}</p>
                  </div>
                </div>
                <button onClick={() => onSendToChat(`Generate a ${t.title} template for me`)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0" title="Generate via chat">
                  <Download size={12} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HavenDocuments;
