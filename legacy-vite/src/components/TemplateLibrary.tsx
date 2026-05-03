import { X, Clock, LayoutGrid } from "lucide-react";
import { agentTemplates, Template } from "@/data/templates";
import { ICON_MAP } from "@/components/NeonIcons";

interface Props {
  agentId: string;
  agentName: string;
  agentColor: string;
  open: boolean;
  onClose: () => void;
  onSelect: (prompt: string) => void;
}

const TemplateLibrary = ({ agentId, agentName, agentColor, open, onClose, onSelect }: Props) => {
  if (!open) return null;

  const templates = agentTemplates[agentId] || [];

  if (templates.length === 0) return null;

  const renderIcon = (iconKey: string) => {
    const IconComp = ICON_MAP[iconKey];
    if (IconComp) return <IconComp size={20} color={agentColor} />;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ background: "transparent", border: `1px solid ${agentColor}20` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${agentColor}15` }}>
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} style={{ color: agentColor }} />
            <h3 className="text-sm font-bold text-foreground">{agentName} Templates</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors text-foreground/50 hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {templates.map((t) => (
              <button
                key={t.title}
                onClick={() => { onSelect(t.prompt); onClose(); }}
                className="text-left p-3.5 rounded-xl transition-all duration-200 group hover:scale-[1.02]"
                style={{
                  background: `${agentColor}06`,
                  border: `1px solid ${agentColor}12`,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = agentColor + "35"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = agentColor + "12"; }}
              >
                {renderIcon(t.icon)}
                <p className="text-xs font-semibold text-foreground mt-2 leading-tight">{t.title}</p>
                <p className="text-[10px] text-foreground/40 mt-1 leading-snug line-clamp-2">{t.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock size={9} className="text-foreground/30" />
                  <span className="text-[9px] font-medium" style={{ color: agentColor + "80" }}>
                    Saves {t.timeSaved}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;