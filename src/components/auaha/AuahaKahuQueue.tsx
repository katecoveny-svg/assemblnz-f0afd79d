import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface QueueItem {
  id: string;
  title: string;
  content_type: string;
  author: string | null;
  submitted_at: string;
  status: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
}

const TYPES = ["all", "social", "blog", "email", "ad"] as const;
type Filter = (typeof TYPES)[number];

const STATUS_BG: Record<string, string> = {
  draft: "bg-[#EEE7DE] text-[#9D8C7D]",
  queued: "bg-[#C7D9E8]/30 text-[#6F6158]",
  approved: "bg-[#C9D8D0]/30 text-[#6F6158]",
  rejected: "bg-red-50 text-red-700",
  published: "bg-[#D9BC7A]/20 text-[#6F6158]",
};

const TYPE_BG: Record<string, string> = {
  social: "bg-[#C8DDD8]/30 text-[#6F6158]",
  blog: "bg-[#C9D8D0]/30 text-[#6F6158]",
  email: "bg-[#D9BC7A]/20 text-[#6F6158]",
  ad: "bg-[#C7D9E8]/30 text-[#6F6158]",
};

export default function AuahaKahuQueue() {
  const { user } = useAuth();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("content_queue")
      .select("*")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .then(({ data }) => data && setItems(data as QueueItem[]));
  }, [user]);

  const filtered = filter === "all" ? items : items.filter((i) => i.content_type === filter);

  const approve = async (id: string) => {
    await supabase
      .from("content_queue")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    setItems((p) => p.map((i) => (i.id === id ? { ...i, status: "approved" } : i)));
    toast.success("Approved");
  };

  const reject = async (id: string) => {
    await supabase
      .from("content_queue")
      .update({ status: "rejected", rejection_reason: rejectReason, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    setItems((p) => p.map((i) => (i.id === id ? { ...i, status: "rejected", rejection_reason: rejectReason } : i)));
    setRejectingId(null);
    setRejectReason("");
    toast.success("Rejected with note");
  };

  const today = new Date().toDateString();
  const stats = {
    queued: items.filter((i) => i.status === "queued").length,
    approvedToday: items.filter((i) => i.status === "approved" && i.reviewed_at && new Date(i.reviewed_at).toDateString() === today).length,
    rejectedToday: items.filter((i) => i.status === "rejected" && i.reviewed_at && new Date(i.reviewed_at).toDateString() === today).length,
    avgReview: "12m",
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={18} className="text-[#D9BC7A]" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">Compliance</span>
      </div>
      <h1 className="font-display text-3xl text-[#9D8C7D]">Kahu compliance queue</h1>
      <p className="font-body text-sm text-[#9D8C7D]/60 mt-1 mb-8">Content awaiting compliance review before publish.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total queued", value: stats.queued },
          { label: "Approved today", value: stats.approvedToday },
          { label: "Rejected today", value: stats.rejectedToday },
          { label: "Avg review time", value: stats.avgReview },
        ].map((s) => (
          <div key={s.label} className="bg-white/80 rounded-3xl shadow-sm p-5 border border-[rgba(142,129,119,0.14)]">
            <div className="font-display text-2xl text-[#6F6158]">{s.value}</div>
            <div className="font-body text-xs text-[#9D8C7D] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-body transition-all ${
              filter === t
                ? "bg-[#D9BC7A]/15 text-[#6F6158] border border-[#D9BC7A]/30"
                : "bg-white/60 text-[#9D8C7D] border border-[#D8C8B4]/30 hover:bg-[#EEE7DE]"
            }`}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#D8C8B4]/30">
              <tr>
                {["Title", "Type", "Author", "Submitted", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left font-mono text-xs uppercase tracking-wider text-[#9D8C7D]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center font-body text-sm text-[#9D8C7D]">
                  <Clock size={24} className="mx-auto mb-2 opacity-40" />
                  Nothing in the queue.
                </td></tr>
              ) : filtered.map((i) => (
                <tr key={i.id} className="border-b border-[#EEE7DE] hover:bg-[#F7F3EE]/50">
                  <td className="px-5 py-4 font-body text-sm text-[#6F6158]">{i.title}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${TYPE_BG[i.content_type] ?? ""}`}>{i.content_type}</span>
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-[#9D8C7D]">{i.author ?? "—"}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#9D8C7D]">{new Date(i.submitted_at).toLocaleDateString("en-NZ")}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BG[i.status] ?? ""}`}>{i.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    {i.status === "queued" && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => approve(i.id)} className="text-[#9D8C7D] hover:text-green-600 transition-colors" aria-label="Approve">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => setRejectingId(i.id)} className="text-[#9D8C7D] hover:text-red-600 transition-colors" aria-label="Reject">
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                    {rejectingId === i.id && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason"
                          className="flex-1 px-2 py-1 rounded-lg border border-[#D8C8B4]/40 text-xs"
                        />
                        <button onClick={() => reject(i.id)} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-lg">Send</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
