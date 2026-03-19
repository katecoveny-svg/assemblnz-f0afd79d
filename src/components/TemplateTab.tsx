import { Clock } from "lucide-react";
import { agentTemplates, type Template } from "@/data/templates";

interface Props {
  agentId: string;
  agentName: string;
  agentColor: string;
  onGenerate: (prompt: string) => void;
}

const TemplateTab = ({ agentId, agentName, agentColor, onGenerate }: Props) => {
  const templates = agentTemplates[agentId] || [];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-sm font-bold text-foreground mb-1">{agentName} Templates</h2>
        <p className="text-[11px] text-muted-foreground mb-5">
          Click "Generate" to start a guided questionnaire — {agentName} will ask questions one at a time, then produce a professional output.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {templates.map((t) => (
            <div
              key={t.title}
              className="group flex flex-col p-4 rounded-[10px] transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "#ffffff06",
                border: `1px solid ${agentColor}1A`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = agentColor + "40";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${agentColor}08`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = agentColor + "1A";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Emoji */}
              <span className="text-xl mb-2">{t.emoji || "📄"}</span>

              {/* Title */}
              <p className="text-[13px] font-bold text-foreground leading-tight mb-1">{t.title}</p>

              {/* Description */}
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-3">{t.description}</p>

              {/* Time saved pill */}
              <div className="flex items-center gap-1 mb-3">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium"
                  style={{ backgroundColor: agentColor + "18", color: agentColor }}
                >
                  <Clock size={8} />
                  Saves {t.timeSaved}
                </span>
              </div>

              {/* Generate button */}
              <button
                onClick={() => onGenerate(t.prompt)}
                className="w-full py-1.5 rounded-lg text-[11px] font-bold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: agentColor,
                  color: "#0A0A14",
                }}
              >
                Generate
              </button>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-muted-foreground text-center mt-6">
          All outputs include copy, PDF, and CSV download options. Generated content should be reviewed by a qualified professional before use.
        </p>
      </div>
    </div>
  );
};

export default TemplateTab;
