import { NeonClipboard, NeonFork, NeonCoin, NeonGift, NeonShirt, NeonPaw, NeonCalendar, NeonHome, NeonCar } from "@/components/NeonIcons";

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const HELM = "#B388FF";

const actions: QuickAction[] = [
  { icon: <NeonClipboard size={22} color={HELM} />, title: "Parse a notice", subtitle: "Upload a school newsletter or notice" },
  { icon: <NeonFork size={22} />, title: "Meal plan", subtitle: "Create a weekly meal plan" },
  { icon: <NeonCoin size={22} color={HELM} />, title: "Budget", subtitle: "Set up a household budget" },
  { icon: <NeonGift size={22} />, title: "Gifts & birthdays", subtitle: "Track birthdays and gift ideas" },
  { icon: <NeonShirt size={22} />, title: "Laundry schedule", subtitle: "Organise household laundry" },
  { icon: <NeonPaw size={22} />, title: "Pet care", subtitle: "Manage pet schedules and vet visits" },
  { icon: <NeonCalendar size={22} />, title: "Weekly schedule", subtitle: "Build a family weekly schedule" },
  { icon: <NeonHome size={22} />, title: "Home maintenance", subtitle: "Seasonal home care checklist" },
  { icon: <NeonCar size={22} />, title: "Vehicle admin", subtitle: "WoF, rego, and servicing tracker" },
];

interface Props {
  onSelect: (message: string) => void;
}

const HelmQuickActions = ({ onSelect }: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full max-w-xl mt-4">
    {actions.map((a) => (
      <button
        key={a.title}
        onClick={() => onSelect(a.title)}
        className="text-left px-3.5 py-3 rounded-xl transition-all duration-200 group"
        style={{
          background: "#B388FF08",
          border: "1px solid #B388FF12",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#B388FF30";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#B388FF12";
        }}
      >
        <span className="leading-none">{a.icon}</span>
        <p className="text-[13px] font-semibold text-foreground mt-1.5">{a.title}</p>
        <p className="text-[10.5px]" style={{ color: "#ffffff30" }}>{a.subtitle}</p>
      </button>
    ))}
  </div>
);

export default HelmQuickActions;