import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Circle, ExternalLink, Inbox } from "lucide-react";

interface ActionItem {
  id: string;
  sender: string;
  subject: string;
  action_description: string | null;
  due_date: string | null;
  status: string;
  source_link: string | null;
}

const formatDue = (iso: string | null): string => {
  if (!iso) return "No due date";
  const d = new Date(iso);
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });
};

const urgencyRank = (iso: string | null): number => {
  if (!iso) return Number.POSITIVE_INFINITY;
  return new Date(iso).getTime();
};

export const ActionItemsCard = () => {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("toroa_email_flags")
      .select("id, sender, subject, action_description, due_date, status, source_link")
      .eq("action_required", true)
      .order("due_date", { ascending: true, nullsFirst: false });
    setItems((data ?? []) as ActionItem[]);
    setLoading(false);
  };

  const sorted = useMemo(
    () => [...items].sort((a, b) => urgencyRank(a.due_date) - urgencyRank(b.due_date)),
    [items]
  );

  const toggle = async (id: string, status: string) => {
    const next = status === "done" ? "new" : "done";
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: next } : i)));
    await supabase.from("toroa_email_flags").update({ status: next }).eq("id", id);
  };

  return (
    <article className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] overflow-hidden">
      <div className="h-1 bg-[#C7D9E8]" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl text-[#9D8C7D]">Needs Attention</h2>
            <p className="font-['Inter'] text-sm text-[#9D8C7D]/80">Sorted by urgency</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-sm text-[#9D8C7D] font-['Inter']">Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Inbox size={28} className="mx-auto mb-3 text-[#9D8C7D]/60" />
            <p className="text-sm text-[#6F6158] font-['Inter']">All caught up — nothing waiting on you.</p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {sorted.map((it) => {
              const done = it.status === "done";
              return (
                <li
                  key={it.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#EEE7DE]/40 transition-colors"
                >
                  <button
                    onClick={() => toggle(it.id, it.status)}
                    className="flex-shrink-0 mt-0.5"
                    aria-label={done ? "Mark incomplete" : "Mark complete"}
                  >
                    {done ? (
                      <CheckCircle2 size={18} className="text-[#9DB89D]" />
                    ) : (
                      <Circle size={18} className="text-[#9D8C7D]" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-['Inter'] text-sm ${
                        done ? "line-through text-[#9D8C7D]" : "text-[#6F6158]"
                      }`}
                    >
                      {it.action_description || it.subject}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#9D8C7D]">
                        {formatDue(it.due_date)}
                      </span>
                      <span className="text-[10px] text-[#9D8C7D]/60">·</span>
                      <span className="font-['Inter'] text-[10px] text-[#9D8C7D] truncate">
                        {it.sender}
                      </span>
                      {it.source_link && (
                        <a
                          href={it.source_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#9D8C7D] hover:text-[#6F6158]"
                          aria-label="Open source email"
                        >
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
};
