import { useState } from "react";
import { NeonCalendar, NeonFork, NeonBell } from "@/components/NeonIcons";

interface DashboardItem {
  type: "event" | "meal" | "reminder";
  text: string;
  date?: string;
}

interface Props {
  items: DashboardItem[];
  onAddReminder: (text: string) => void;
}

const TŌROA = "#3A6A9C";

const HelmDashboard = ({ items, onAddReminder }: Props) => {
  const [quickAdd, setQuickAdd] = useState("");

  const events = items.filter((i) => i.type === "event");
  const meals = items.filter((i) => i.type === "meal");
  const reminders = items.filter((i) => i.type === "reminder");

  const Section = ({
    title,
    icon,
    children,
    empty,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    empty: string;
  }) => (
    <div
      className="rounded-xl p-4"
      style={{ background: "#0F0F1C", border: "1px solid #3A6A9C15" }}
    >
      <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: TŌROA }}>
        {icon} {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-[11px] text-foreground/30 italic">{empty}</p>
      ) : (
        children
      )}
    </div>
  );

  return (
    <div className="space-y-3 p-4 max-w-2xl mx-auto">
      <Section title="Upcoming (7 days)" icon={<NeonCalendar size={14} color={TŌROA} />} empty="No upcoming events yet. Chat with TŌROA to extract dates from documents.">
        {events.map((e, i) => (
          <div key={i} className="flex justify-between text-xs py-1 border-b border-[#3A6A9C08] last:border-0">
            <span className="text-foreground/70">{e.text}</span>
            {e.date && <span className="text-foreground/40 text-[10px]">{e.date}</span>}
          </div>
        ))}
      </Section>

      <Section title="This Week's Meals" icon={<NeonFork size={14} />} empty="No meal plan yet. Ask TŌROA to create one.">
        {meals.map((m, i) => (
          <p key={i} className="text-xs text-foreground/70 py-0.5">{m.text}</p>
        ))}
      </Section>

      <Section title="Reminders" icon={<NeonBell size={14} color={TŌROA} />} empty="No reminders yet. TŌROA will track birthdays, vet visits, WoF dates, and more.">
        {reminders.map((r, i) => (
          <p key={i} className="text-xs text-foreground/70 py-0.5">{r.text}</p>
        ))}
      </Section>

      <div className="flex gap-2">
        <input
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          placeholder="Quick add a reminder..."
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#3A6A9C30]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && quickAdd.trim()) {
              onAddReminder(quickAdd.trim());
              setQuickAdd("");
            }
          }}
        />
        <button
          onClick={() => {
            if (quickAdd.trim()) {
              onAddReminder(quickAdd.trim());
              setQuickAdd("");
            }
          }}
          className="px-3 py-2 rounded-lg text-xs font-medium"
          style={{ background: "#3A6A9C20", color: "#3A6A9C", border: "1px solid #3A6A9C30" }}
        >
          + Add
        </button>
      </div>
    </div>
  );
};

export default HelmDashboard;