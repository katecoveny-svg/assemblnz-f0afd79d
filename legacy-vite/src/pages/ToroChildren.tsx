import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Pencil, Users, GraduationCap, Bus, Car, Bike, Footprints } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TimetableGrid } from "@/components/toro/TimetableGrid";
import { GearListChecklist } from "@/components/toro/GearListChecklist";
import { AddChildModal } from "@/components/toro/AddChildModal";
import { EditChildModal } from "@/components/toro/EditChildModal";
import { ToroTutorChat } from "@/components/toro/ToroTutorChat";
import { toast } from "sonner";

interface Child {
  id: string;
  name: string;
  school: string | null;
  year_level: number | null;
  ncea_level: number | null;
  school_start_time: string | null;
  school_end_time: string | null;
  transport_mode: string | null;
  bus_route_id: string | null;
  interests: string[] | null;
  allergies: string[] | null;
}

const TransportIcon = ({ mode }: { mode: string | null }) => {
  switch (mode) {
    case "bus": return <Bus size={14} className="text-[#9D8C7D]" />;
    case "car": return <Car size={14} className="text-[#9D8C7D]" />;
    case "bike": return <Bike size={14} className="text-[#9D8C7D]" />;
    case "walk": return <Footprints size={14} className="text-[#9D8C7D]" />;
    default: return null;
  }
};

const ToroChildren = () => {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editChildId, setEditChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFamily = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsLoading(false);
      return;
    }
    const { data: membership } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!membership?.family_id) {
      setIsLoading(false);
      return;
    }
    setFamilyId(membership.family_id);
    const { data: kids, error } = await supabase
      .from("toroa_children")
      .select("id, name, school, year_level, ncea_level, school_start_time, school_end_time, transport_mode, bus_route_id, interests, allergies")
      .eq("family_id", membership.family_id)
      .order("year_level", { ascending: false });
    if (error) {
      toast.error(error.message);
    }
    const list = (kids as Child[] | null) ?? [];
    setChildren(list);
    if (list.length > 0 && !activeChildId) setActiveChildId(list[0].id);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadFamily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeChild = children.find((c) => c.id === activeChildId) ?? null;

  return (
    <div className="min-h-screen bg-[#F7F3EE] pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link
            to="/toro/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#9D8C7D] hover:text-[#6F6158] font-body mb-4"
          >
            <ChevronLeft size={14} />
            Back to Tōro
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-5xl text-[#9D8C7D] inline-flex items-center gap-3 border-b-2 border-[#C7D9E8] pb-1">
                <Users size={32} className="text-[#C7D9E8]" />
                Tamariki
              </h1>
              <p className="font-body text-base text-[#9D8C7D]/80 mt-2">
                Profiles, timetables and daily gear lists for each child.
              </p>
            </div>
            {familyId && (
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body text-sm font-medium"
              >
                <Plus size={16} />
                Add tamariki
              </button>
            )}
          </div>
        </header>

        {isLoading ? (
          <p className="font-body text-sm text-[#9D8C7D]">Loading whānau…</p>
        ) : !familyId ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-8 text-center">
            <p className="font-body text-sm text-[#6F6158]">
              No family workspace found. Set one up from the Tōro dashboard first.
            </p>
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-8 text-center">
            <Users size={32} className="mx-auto mb-3 text-[#C7D9E8]" />
            <h3 className="font-display text-2xl text-[#9D8C7D]">No tamariki yet</h3>
            <p className="font-body text-sm text-[#6F6158]/80 mt-2 max-w-md mx-auto">
              Add each child so Tōro can track timetables, gear, and school updates.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body text-sm font-medium"
            >
              <Plus size={16} />
              Add first child
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar — child list */}
            <aside className="lg:col-span-1 space-y-3">
              {children.map((c) => {
                const isActive = c.id === activeChildId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveChildId(c.id)}
                    className={`w-full text-left bg-white/80 backdrop-blur-xl rounded-3xl border shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-5 transition-colors ${
                      isActive
                        ? "border-[#C7D9E8] ring-2 ring-[#C7D9E8]/40"
                        : "border-[rgba(142,129,119,0.14)] hover:border-[#C7D9E8]/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl text-[#6F6158]">{c.name}</h3>
                        {c.school && (
                          <p className="font-body text-xs text-[#9D8C7D] mt-0.5">{c.school}</p>
                        )}
                      </div>
                      <TransportIcon mode={c.transport_mode} />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {c.year_level && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-body bg-[#EEE7DE] text-[#6F6158]">
                          Year {c.year_level}
                        </span>
                      )}
                      {c.ncea_level && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-body bg-[#C7D9E8]/40 text-[#6F6158] inline-flex items-center gap-1">
                          <GraduationCap size={10} />
                          NCEA L{c.ncea_level}
                        </span>
                      )}
                      {c.school_start_time && c.school_end_time && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-body bg-white/70 border border-[rgba(142,129,119,0.14)] text-[#9D8C7D]">
                          {c.school_start_time} – {c.school_end_time}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </aside>

            {/* Workspace */}
            <section className="lg:col-span-2 space-y-6">
              {activeChild && (
                <>
                  {/* Profile header */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-3xl text-[#6F6158]">{activeChild.name}</h2>
                      <button
                        onClick={() => setEditChildId(activeChild.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-body text-[#9D8C7D] hover:text-[#6F6158] hover:bg-[#EEE7DE] border border-[rgba(142,129,119,0.14)]"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 font-body text-sm text-[#6F6158]">
                      {activeChild.school && (
                        <span><span className="text-[#9D8C7D]">School:</span> {activeChild.school}</span>
                      )}
                      {activeChild.transport_mode && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-[#9D8C7D]">Transport:</span>
                          <TransportIcon mode={activeChild.transport_mode} />
                          {activeChild.transport_mode}
                          {activeChild.bus_route_id && ` · Route ${activeChild.bus_route_id}`}
                        </span>
                      )}
                    </div>
                    {activeChild.interests && activeChild.interests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeChild.interests.map((i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-full text-xs font-body bg-[#C9D8D0]/40 text-[#6F6158]"
                          >
                            {i}
                          </span>
                        ))}
                      </div>
                    )}
                    {activeChild.allergies && activeChild.allergies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {activeChild.allergies.map((a) => (
                          <span
                            key={a}
                            className="px-2.5 py-1 rounded-full text-xs font-body bg-[#E4B8C4]/40 text-[#6F6158]"
                          >
                            ⚠ {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timetable */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
                    <h3 className="font-display text-xl text-[#9D8C7D] mb-4">Weekly timetable</h3>
                    <TimetableGrid familyId={familyId!} childName={activeChild.name} />
                  </div>

                  {/* Gear list */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
                    <h3 className="font-display text-xl text-[#9D8C7D] mb-4">Today's gear list</h3>
                    <GearListChecklist familyId={familyId!} childName={activeChild.name} />
                  </div>

                  {/* Tutor chat — day plan & gear */}
                  <ToroTutorChat
                    variant="day"
                    title={`Ask Tōro about ${activeChild.name}`}
                    contextLines={[
                      `Child: ${activeChild.name}${activeChild.year_level ? ` (Year ${activeChild.year_level})` : ""}.`,
                      activeChild.school ? `School: ${activeChild.school}.` : "School not set.",
                      activeChild.school_start_time && activeChild.school_end_time
                        ? `School hours: ${activeChild.school_start_time}–${activeChild.school_end_time}.`
                        : "School hours not set.",
                      activeChild.transport_mode
                        ? `Transport: ${activeChild.transport_mode}${activeChild.bus_route_id ? ` (route ${activeChild.bus_route_id})` : ""}.`
                        : "Transport not set.",
                      activeChild.allergies && activeChild.allergies.length
                        ? `Allergies: ${activeChild.allergies.join(", ")}.`
                        : "No allergies recorded.",
                      activeChild.interests && activeChild.interests.length
                        ? `Interests: ${activeChild.interests.join(", ")}.`
                        : "",
                    ].filter(Boolean)}
                    suggestions={[
                      `What does ${activeChild.name}'s day look like?`,
                      "What gear should we pack tomorrow?",
                      "Any school admin I should chase?",
                    ]}
                  />
                </>
              )}
            </section>
          </div>
        )}
      </div>

      {familyId && (
        <AddChildModal
          familyId={familyId}
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onSaved={() => void loadFamily()}
        />
      )}

      <EditChildModal
        child={children.find((c) => c.id === editChildId) ?? null}
        open={editChildId !== null}
        onClose={() => setEditChildId(null)}
        onSaved={() => void loadFamily()}
      />
    </div>
  );
};

export default ToroChildren;
