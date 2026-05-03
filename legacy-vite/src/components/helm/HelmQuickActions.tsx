import BrandIcon3D from "@/components/BrandIcon3D";
import { ClipboardList, UtensilsCrossed, Coins, Gift, Shirt, PawPrint, CalendarDays, Home, Car } from "lucide-react";

interface QuickAction {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

const actions: QuickAction[] = [
  { icon: ClipboardList, title: "Parse a notice", subtitle: "Upload a school newsletter or notice" },
  { icon: UtensilsCrossed, title: "Meal plan", subtitle: "Create a weekly meal plan" },
  { icon: Coins, title: "Budget", subtitle: "Set up a household budget" },
  { icon: Gift, title: "Gifts & birthdays", subtitle: "Track birthdays and gift ideas" },
  { icon: Shirt, title: "Laundry schedule", subtitle: "Organise household laundry" },
  { icon: PawPrint, title: "Pet care", subtitle: "Manage pet schedules and vet visits" },
  { icon: CalendarDays, title: "Weekly schedule", subtitle: "Build a family weekly schedule" },
  { icon: Home, title: "Home maintenance", subtitle: "Seasonal home care checklist" },
  { icon: Car, title: "Vehicle admin", subtitle: "WoF, rego, and servicing tracker" },
];

interface Props {
  onSelect: (message: string) => void;
}

const HelmQuickActions = ({ onSelect }: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full max-w-xl mt-4">
    {actions.map((a) => {
      const Icon = a.icon;
      return (
        <button
          key={a.title}
          onClick={() => onSelect(a.title)}
          className="text-left px-3.5 py-3 rounded-xl transition-all duration-200 group flex items-start gap-3"
          style={{
            background: "rgba(58,106,156,0.04)",
            border: "1px solid rgba(58,106,156,0.08)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(58,106,156,0.25)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(58,106,156,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(58,106,156,0.08)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <BrandIcon3D size="sm" variant="floating" color="tangaroa">
            <Icon size={14} color="#4A8AC2" />
          </BrandIcon3D>
          <div>
            <p className="text-[13px] font-semibold text-foreground">{a.title}</p>
            <p className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.3)" }}>{a.subtitle}</p>
          </div>
        </button>
      );
    })}
  </div>
);

export default HelmQuickActions;
