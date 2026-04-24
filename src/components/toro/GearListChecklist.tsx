import { useEffect, useMemo, useState } from "react";
import { Cloud, CloudRain, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GearItem {
  item: string;
  reason?: string;
  source?: "timetable" | "weather" | "calendar";
  weather?: "rain" | "sun" | "cloud";
}

interface GearListRow {
  id: string;
  items: GearItem[];
  extras: GearItem[];
  checked_off: string[];
}

interface Props {
  familyId: string;
  childName: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function GearListChecklist({ familyId, childName }: Props) {
  const [list, setList] = useState<GearListRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("toroa_gear_lists")
        .select("id, items, extras, checked_off")
        .eq("family_id", familyId)
        .eq("child_name", childName)
        .eq("list_date", todayIso())
        .maybeSingle();
      setList((data as unknown) as GearListRow | null);
      setIsLoading(false);
    })();
  }, [familyId, childName]);

  const allItems = useMemo(() => {
    const base = (list?.items ?? []) as GearItem[];
    const extras = (list?.extras ?? []) as GearItem[];
    return [...base, ...extras];
  }, [list]);

  const toggle = async (item: string) => {
    if (!list) return;
    const checked = list.checked_off.includes(item)
      ? list.checked_off.filter((x) => x !== item)
      : [...list.checked_off, item];
    setList({ ...list, checked_off: checked });
    await supabase
      .from("toroa_gear_lists")
      .update({ checked_off: checked })
      .eq("id", list.id);
  };

  if (isLoading) {
    return <p className="font-body text-sm text-[#9D8C7D]">Loading gear list…</p>;
  }

  if (!list || allItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[rgba(142,129,119,0.24)] p-4 text-center">
        <p className="font-body text-sm text-[#6F6158]">
          No gear list yet for today.
        </p>
        <p className="font-body text-xs text-[#9D8C7D] mt-1">
          Toro Family generates lists each morning from the timetable + weather.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {allItems.map((g, idx) => {
        const isChecked = list.checked_off.includes(g.item);
        return (
          <li
            key={`${g.item}-${idx}`}
            className="flex items-start gap-3 p-2 rounded-xl hover:bg-[#EEE7DE]/40 transition-colors"
          >
            <input
              id={`gear-${idx}`}
              type="checkbox"
              checked={isChecked}
              onChange={() => void toggle(g.item)}
              className="mt-1 h-4 w-4 rounded border-[#9D8C7D]/40 text-[#D9BC7A] focus:ring-[#D9BC7A]"
            />
            <label
              htmlFor={`gear-${idx}`}
              className="flex-1 cursor-pointer font-body text-sm text-[#6F6158]"
            >
              <span className={isChecked ? "line-through text-[#9D8C7D]" : ""}>
                {g.item}
              </span>
              {g.reason && (
                <span className="block text-xs text-[#9D8C7D] mt-0.5">{g.reason}</span>
              )}
            </label>
            {g.weather === "rain" && <CloudRain size={14} className="text-[#7A8FA3] mt-1" />}
            {g.weather === "sun" && <Sun size={14} className="text-[#D9BC7A] mt-1" />}
            {g.weather === "cloud" && <Cloud size={14} className="text-[#9D8C7D] mt-1" />}
          </li>
        );
      })}
    </ul>
  );
}
