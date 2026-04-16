import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Check, X, CheckCheck, Calendar, ClipboardList } from "lucide-react";

const HELM_COLOR = "#3A6A9C";

interface ParsedItem {
  id: string;
  item_type: string;
  parsed_data: any;
  confidence: number;
  status: string;
  created_at: string;
}

export default function HelmReview() {
  const { user } = useAuth();
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: fm } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single();
      if (fm) {
        setFamilyId(fm.family_id);
        const { data } = await supabase.from("parsed_items").select("*").eq("family_id", fm.family_id).eq("status", "proposed").order("created_at", { ascending: false });
        setItems(data || []);
      }
    })();
  }, [user]);

  const approve = async (item: ParsedItem) => {
    if (!familyId) return;
    
    if (item.item_type === "event" && item.parsed_data) {
      await supabase.from("events").insert({
        family_id: familyId,
        title: item.parsed_data.title || "Untitled Event",
        start_at: item.parsed_data.date || new Date().toISOString(),
        location: item.parsed_data.location,
        description: item.parsed_data.description,
        source: "notice",
        source_message_id: (item as any).message_id,
      });
    } else if (item.item_type === "task" && item.parsed_data) {
      await supabase.from("tasks").insert({
        family_id: familyId,
        title: item.parsed_data.title || "Untitled Task",
        due_at: item.parsed_data.due_date,
        source: "notice",
        source_message_id: (item as any).message_id,
      });
    }
    
    await supabase.from("parsed_items").update({ status: "approved", reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq("id", item.id);
    setItems(items.filter(i => i.id !== item.id));
  };

  const reject = async (id: string) => {
    await supabase.from("parsed_items").update({ status: "rejected", reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq("id", id);
    setItems(items.filter(i => i.id !== id));
  };

  const approveHighConfidence = async () => {
    const highConf = items.filter(i => i.confidence >= 0.7);
    for (const item of highConf) await approve(item);
  };

  const confidenceColor = (c: number) => c >= 0.7 ? "text-[#5AADA0]" : c >= 0.4 ? "text-[#D4A843]" : "text-[#C85A54]";
  const confidenceBg = (c: number) => c >= 0.7 ? "bg-[#5AADA0]/10" : c >= 0.4 ? "bg-amber-500/10" : "bg-[#C85A54]/10";

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "#FAFBFC" }}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/90">Review Queue</h2>
        {items.filter(i => i.confidence >= 0.7).length > 0 && (
          <button onClick={approveHighConfidence} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition hover:bg-white/10"
            style={{ background: "rgba(102,187,106,0.15)", color: "#66BB6A" }}>
            <CheckCheck size={12} />
            Approve All High Confidence
          </button>
        )}
      </div>

      <p className="text-[11px] text-white/40">AI-extracted events and tasks from school notices. Review and approve to add to your family calendar.</p>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <CheckCheck size={32} style={{ color: HELM_COLOR }} className="mx-auto opacity-30 mb-3" />
          <p className="text-sm text-white/40">All caught up!</p>
          <p className="text-xs text-white/25 mt-1">Upload a school notice in the Inbox tab to see items here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {item.item_type === "event" ? <Calendar size={14} style={{ color: HELM_COLOR }} /> : <ClipboardList size={14} style={{ color: HELM_COLOR }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full font-medium" style={{ background: HELM_COLOR + "15", color: HELM_COLOR }}>{item.item_type}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${confidenceBg(item.confidence)} ${confidenceColor(item.confidence)}`}>
                      {Math.round(item.confidence * 100)}% conf
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white/80 mt-1">{item.parsed_data?.title || "Untitled"}</p>
                  {item.parsed_data?.date && <p className="text-[10px] text-gray-400 mt-0.5">{new Date(item.parsed_data.date).toLocaleDateString("en-NZ")}</p>}
                  {item.parsed_data?.location && <p className="text-[10px] text-white/25">{item.parsed_data.location}</p>}
                  {item.parsed_data?.description && <p className="text-[10px] text-white/20 mt-1 line-clamp-2">{item.parsed_data.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => approve(item)} className="p-1.5 rounded-lg hover:bg-[#5AADA0]/20 transition" title="Approve">
                    <Check size={14} className="text-[#5AADA0]" />
                  </button>
                  <button onClick={() => reject(item.id)} className="p-1.5 rounded-lg hover:bg-[#C85A54]/20 transition" title="Reject">
                    <X size={14} className="text-[#C85A54]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
