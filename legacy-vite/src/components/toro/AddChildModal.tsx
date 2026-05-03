import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  familyId: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const YEAR_LEVELS = Array.from({ length: 13 }, (_, i) => i + 1);
const TRANSPORT = ["car", "bus", "walk", "bike"] as const;

export function AddChildModal({ familyId, open, onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [yearLevel, setYearLevel] = useState<number>(7);
  const [transport, setTransport] = useState<(typeof TRANSPORT)[number]>("car");
  const [busRoute, setBusRoute] = useState("");
  const [startTime, setStartTime] = useState("08:45");
  const [endTime, setEndTime] = useState("15:00");
  const [interests, setInterests] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!open) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Child's name is required");
      return;
    }
    setIsSaving(true);
    const interestsList = interests
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const { error } = await supabase.from("toroa_children").insert({
      family_id: familyId,
      name: name.trim(),
      school: school.trim() || null,
      year_level: yearLevel,
      transport_mode: transport,
      bus_route_id: transport === "bus" ? busRoute.trim() || null : null,
      school_start_time: startTime,
      school_end_time: endTime,
      interests: interestsList.length > 0 ? interestsList : null,
    });
    setIsSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${name} added`);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D4250]/40 backdrop-blur-sm">
      <form
        onSubmit={save}
        className="w-full max-w-lg rounded-3xl bg-white/95 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-[#9D8C7D]">Add Tamariki</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9D8C7D] hover:text-[#6F6158]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Name *">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-[rgba(142,129,119,0.24)] bg-white px-3 py-2 font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
            />
          </Field>
          <Field label="School">
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="e.g. Sacred Heart College"
              className="w-full rounded-xl border border-[rgba(142,129,119,0.24)] bg-white px-3 py-2 font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
            />
          </Field>
          <Field label="Year level">
            <select
              value={yearLevel}
              onChange={(e) => setYearLevel(Number(e.target.value))}
              className="w-full rounded-xl border border-[rgba(142,129,119,0.24)] bg-white px-3 py-2 font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
            >
              {YEAR_LEVELS.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Transport">
            <div className="flex flex-wrap gap-2">
              {TRANSPORT.map((t) => (
                <label
                  key={t}
                  className={`px-3 py-1 rounded-full text-xs font-body cursor-pointer border ${
                    transport === t
                      ? "bg-[#C7D9E8] border-[#C7D9E8] text-[#6F6158]"
                      : "bg-white/60 border-[rgba(142,129,119,0.24)] text-[#9D8C7D]"
                  }`}
                >
                  <input
                    type="radio"
                    name="transport"
                    value={t}
                    checked={transport === t}
                    onChange={() => setTransport(t)}
                    className="sr-only"
                  />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </Field>
          {transport === "bus" && (
            <Field label="Bus route number">
              <input
                type="text"
                value={busRoute}
                onChange={(e) => setBusRoute(e.target.value)}
                placeholder="e.g. 70"
                className="w-full rounded-xl border border-[rgba(142,129,119,0.24)] bg-white px-3 py-2 font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
              />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="School start">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-[rgba(142,129,119,0.24)] bg-white px-3 py-2 font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
              />
            </Field>
            <Field label="School end">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-[rgba(142,129,119,0.24)] bg-white px-3 py-2 font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
              />
            </Field>
          </div>
          <Field label="Interests (comma-separated)">
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="rugby, art, music"
              className="w-full rounded-xl border border-[rgba(142,129,119,0.24)] bg-white px-3 py-2 font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
            />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-body text-sm text-[#9D8C7D] hover:bg-[#EEE7DE]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body text-sm font-medium disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save child"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-body uppercase tracking-wider text-[#9D8C7D] mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
