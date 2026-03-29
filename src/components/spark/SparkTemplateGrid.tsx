import { Clock, Wrench, Calculator, Home, Car, CreditCard, CalendarDays, Users, BarChart3, UtensilsCrossed, Trophy, Target } from "lucide-react";

interface SparkTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  icon: React.ElementType;
}

const SPARK_TEMPLATES: SparkTemplate[] = [
  { id: "quote_calculator", name: "Quote Calculator", industry: "trades", description: "Customer-facing price estimator", icon: Calculator },
  { id: "gst_calculator", name: "GST Calculator", industry: "all", description: "Add or remove GST from any amount", icon: CreditCard },
  { id: "employment_cost", name: "Employment Cost Calculator", industry: "all", description: "True cost of hiring including KiwiSaver, ACC, leave", icon: Users },
  { id: "healthy_homes_checklist", name: "Healthy Homes Checklist", industry: "property", description: "Interactive checklist for all 6 standards", icon: Home },
  { id: "fi_calculator", name: "F&I Calculator", industry: "automotive", description: "Vehicle finance comparison with CCCFA disclosure", icon: Car },
  { id: "booking_page", name: "Appointment Booking", industry: "all", description: "Simple booking form with calendar", icon: CalendarDays },
  { id: "client_intake", name: "Client Intake Form", industry: "professional_services", description: "Collect client info professionally", icon: Users },
  { id: "project_timeline", name: "Project Timeline", industry: "construction", description: "Visual Gantt-style project tracker", icon: BarChart3 },
  { id: "menu_display", name: "Digital Menu", industry: "hospitality", description: "Restaurant menu with allergen info", icon: UtensilsCrossed },
  { id: "mortgage_comparison", name: "Mortgage Comparison", industry: "finance", description: "Compare rates across NZ banks", icon: CreditCard },
  { id: "sports_registration", name: "Sports Registration", industry: "sports", description: "Club membership and player registration form", icon: Trophy },
  { id: "sponsorship_calculator", name: "Sponsorship Calculator", industry: "sports", description: "ROI calculator for potential sponsors", icon: Target },
];

interface Props {
  onSelectTemplate: (prompt: string) => void;
  agentColor: string;
}

const SparkTemplateGrid = ({ onSelectTemplate, agentColor }: Props) => {
  const handleSelect = (template: SparkTemplate) => {
    const prompt = `Build me a ${template.name.toLowerCase()} app. It should be a ${template.description.toLowerCase()}. Make it look professional with a dark theme, clean layout, and mobile-friendly. Include input fields, calculations, and a polished results display.`;
    onSelectTemplate(prompt);
  };

  return (
    <div className="mb-6">
      <p className="text-[11px] text-muted-foreground mb-3">Start from a template or describe what you need below.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SPARK_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t)}
            className="text-left p-3 rounded-xl transition-all duration-200 group hover:scale-[1.02]"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.06)` }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = agentColor + "40";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${agentColor}08`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <t.icon size={18} style={{ color: agentColor }} className="mb-1.5" />
            <p className="text-[11px] font-bold text-foreground leading-tight">{t.name}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{t.description}</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-medium" style={{ backgroundColor: agentColor + "15", color: agentColor }}>
                {t.industry}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SparkTemplateGrid;
