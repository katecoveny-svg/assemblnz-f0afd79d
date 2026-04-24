import { useEffect, useMemo, useState } from "react";
import { Cloud, CloudRain, Plus, Sun, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GearItem {
  item: string;
  reason?: string;
  source?: "timetable" | "weather" | "calendar" | "manual";
  weather?: "rain" | "sun" | "cloud";
}

interface GearListRow {
  id: string;
  family_id: string;
  child_name: string;
  list_date: string;
  day_of_week: number | null;
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
  const [isSaving, setIsSaving] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      const today = todayIso();
      const { data, error } = await supabase
        .from("toroa_gear_lists")
        .select("id, family_id, child_name, list_date, day_of_week, items, extras, checked_off")
        .eq("family_id", familyId)
        .eq("child_name", childName)
        .eq("list_date", today)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        toast.error("Couldn't load gear list");
        setIsLoading(false);
        return;
      }

      if (data) {
        setList({
          ...(data as unknown as GearListRow),
          items: ((data as unknown as GearListRow).items ?? []) as GearItem[],
          extras: ((data as unknown as GearListRow).extras ?? []) as GearItem[],
          checked_off: ((data as unknown as GearListRow).checked_off ?? []) as string[],
        });
      } else {
        setList(null);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [familyId, childName]);

  const allItems = useMemo(() => {
    const base = (list?.items ?? []) as GearItem[];
    const extras = (list?.extras ?? []) as GearItem[];
    return [...base, ...extras];
  }, [list]);

  // Ensure a row exists for today; creates an empty list if missing so users can add extras.
  const ensureRow = async (): Promise<GearListRow | null> => {
    if (list) return list;
    const today = todayIso();
    const dow = new Date().getDay();
    const { data, error } = await supabase
      .from("toroa_gear_lists")
      .insert({
        family_id: familyId,
        child_name: childName,
        list_date: today,
        day_of_week: dow,
        items: [],
        extras: [],
        checked_off: [],
      })
      .select("id, family_id, child_name, list_date, day_of_week, items, extras, checked_off")
      .single();

    if (error || !data) {
      toast.error("Couldn't create today's gear list");
      return null;
    }
    const row: GearListRow = {
      ...(data as unknown as GearListRow),
      items: [],
      extras: [],
      checked_off: [],
    };
    setList(row);
    return row;
  };

  const persist = async (
    rowId: string,
    patch: Partial<Pick<GearListRow, "extras" | "checked_off">>,
  ) => {
    setIsSaving(true);
    const { error } = await supabase
      .from("toroa_gear_lists")
      .update(patch)
      .eq("id", rowId);
    setIsSaving(false);
    if (error) {
      toast.error("Couldn't save changes");
      return false;
    }
    return true;
  };

  const toggle = async (item: string) => {
    const current = list ?? (await ensureRow());
    if (!current) return;
    const wasChecked = current.checked_off.includes(item);
    const next = wasChecked
      ? current.checked_off.filter((x) => x !== item)
      : [...current.checked_off, item];

    // Optimistic update
    setList({ ...current, checked_off: next });
    const ok = await persist(current.id, { checked_off: next });
    if (!ok) {
      // Rollback
      setList({ ...current, checked_off: current.checked_off });
    }
  };

  const addExtra = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    const current = list ?? (await ensureRow());
    if (!current) return;

    if (
      current.items.some((g) => g.item.toLowerCase() === trimmed.toLowerCase()) ||
      current.extras.some((g) => g.item.toLowerCase() === trimmed.toLowerCase())
    ) {
      toast.info("Already on the list");
      return;
    }

    const nextExtras: GearItem[] = [...current.extras, { item: trimmed, source: "manual" }];
    setList({ ...current, extras: nextExtras });
    setNewItem("");
    setShowAdd(false);
    const ok = await persist(current.id, { extras: nextExtras });
    if (ok) toast.success(`Added "${trimmed}"`);
  };

  const removeExtra = async (item: string) => {
    if (!list) return;
    const nextExtras = list.extras.filter((g) => g.item !== item);
    const nextChecked = list.checked_off.filter((x) => x !== item);
    setList({ ...list, extras: nextExtras, checked_off: nextChecked });
    await persist(list.id, { extras: nextExtras, checked_off: nextChecked });
  };

  if (isLoading) {
    return <p className="font-body text-sm text-[#9D8C7D]">Loading gear list…</p>;
  }

  const hasItems = allItems.length > 0;

  return (
    <div className="space-y-3">
      {!hasItems ? (
        <div className="rounded-2xl border border-dashed border-[rgba(142,129,119,0.24)] p-4 text-center">
          <p className="font-body text-sm text-[#6F6158]">
            No gear list yet for today.
          </p>
          <p className="font-body text-xs text-[#9D8C7D] mt-1">
            Toro Family generates lists each morning from the timetable + weather. Add your own items below.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {allItems.map((g, idx) => {
            const isChecked = list?.checked_off.includes(g.item) ?? false;
            const isExtra = g.source === "manual";
            return (
              <li
                key={`${g.item}-${idx}`}
                className="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#EEE7DE]/40 transition-colors"
              >
                <input
                  id={`gear-${childName}-${idx}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => void toggle(g.item)}
                  className="mt-1 h-4 w-4 rounded border-[#9D8C7D]/40 text-[#D9BC7A] focus:ring-[#D9BC7A]"
                />
                <label
                  htmlFor={`gear-${childName}-${idx}`}
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
                {isExtra && (
                  <button
                    type="button"
                    onClick={() => void removeExtra(g.item)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#9D8C7D] hover:text-[#6F6158] mt-1"
                    aria-label={`Remove ${g.item}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showAdd ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void addExtra();
              if (e.key === "Escape") {
                setShowAdd(false);
                setNewItem("");
              }
            }}
            placeholder="Add item (e.g. Mufti $2)"
            autoFocus
            className="flex-1 rounded-xl border border-[rgba(142,129,119,0.24)] bg-white/70 px-3 py-1.5 font-body text-sm text-[#6F6158] placeholder:text-[#9D8C7D] focus:border-[#D9BC7A] focus:outline-none focus:ring-1 focus:ring-[#D9BC7A]"
          />
          <button
            type="button"
            onClick={() => void addExtra()}
            disabled={isSaving || !newItem.trim()}
            className="rounded-xl bg-[#D9BC7A] hover:bg-[#C4A665] disabled:opacity-50 px-3 py-1.5 font-body text-sm text-[#6F6158] transition-colors"
          >
            Add
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs font-body text-[#9D8C7D] hover:text-[#6F6158] transition-colors"
        >
          <Plus size={12} /> Add item
        </button>
      )}
    </div>
  );
}
