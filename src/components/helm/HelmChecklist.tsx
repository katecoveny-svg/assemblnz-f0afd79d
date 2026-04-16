import { useState, useCallback } from "react";
import { Check } from "lucide-react";

interface Props {
  content: string;
}

/**
 * Renders markdown content and replaces checklist lines (- [ ] / - [x]) with
 * interactive checkboxes. Non-checklist content is rendered as-is.
 */
const HelmChecklist = ({ content }: Props) => {
  const lines = content.split("\n");
  const [checked, setChecked] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    lines.forEach((line, i) => {
      if (/^[-*]\s*\[x\]/i.test(line.trim())) initial[i] = true;
    });
    return initial;
  });

  const toggle = useCallback((idx: number) => {
    setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const checklistPattern = /^[-*]\s*\[([ xX])\]\s*(.*)/;

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        const match = trimmed.match(checklistPattern);
        if (!match) return null; // non-checklist lines handled by parent markdown

        const label = match[2];
        const isChecked = checked[i] ?? false;

        return (
          <label
            key={i}
            className="flex items-start gap-2.5 cursor-pointer group py-0.5"
            onClick={() => toggle(i)}
          >
            <span
              className="mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
              style={{
                borderColor: isChecked ? "#3A6A9C" : "#ffffff25",
                backgroundColor: isChecked ? "#3A6A9C" : "transparent",
              }}
            >
              {isChecked && <Check size={11} className="text-foreground" strokeWidth={3} />}
            </span>
            <span
              className={`text-sm transition-all duration-200 ${
                isChecked ? "line-through opacity-50" : "text-foreground/90"
              }`}
            >
              {label}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default HelmChecklist;
