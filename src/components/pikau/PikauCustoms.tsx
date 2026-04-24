import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileCheck } from "lucide-react";

interface Entry {
  id: string;
  entry_number: string;
  importer: string | null;
  hs_code: string | null;
  duty_rate: number | null;
  status: string;
  broker_name: string | null;
  lodged_date: string | null;
}

const STATUS_BG: Record<string, string> = {
  draft: "bg-[#EEE7DE] text-[#9D8C7D]",
  lodged: "bg-[#C7D9E8]/30 text-[#6F6158]",
  assessed: "bg-[#D9BC7A]/20 text-[#6F6158]",
  cleared: "bg-[#C9D8D0]/30 text-[#6F6158]",
};

export default function PikauCustoms() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("customs_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setEntries(data as Entry[]));
  }, [user]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-20 lg:pt-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileCheck size={18} className="text-[#B8C7B1]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">Customs</span>
        </div>
        <h1 className="font-display text-3xl text-[#6F6158]">Customs entry queue</h1>
        <p className="font-body text-sm text-[#9D8C7D] mt-1">Lodge, track and clear NZ Customs entries.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#D8C8B4]/30">
              <tr>
                {["Entry #", "Importer", "HS code", "Duty rate", "Status", "Broker", "Lodged"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left font-mono text-xs uppercase tracking-wider text-[#9D8C7D]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center font-body text-sm text-[#9D8C7D]">No customs entries yet.</td></tr>
              ) : entries.map((e) => (
                <tr key={e.id} className="border-b border-[#EEE7DE] hover:bg-[#F7F3EE]/50">
                  <td className="px-5 py-4 font-mono text-sm text-[#6F6158]">{e.entry_number}</td>
                  <td className="px-5 py-4 font-body text-sm text-[#6F6158]">{e.importer ?? "—"}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#6F6158]">{e.hs_code ?? "—"}</td>
                  <td className="px-5 py-4 font-mono text-sm text-[#6F6158]">{e.duty_rate != null ? `${e.duty_rate}%` : "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BG[e.status] ?? ""}`}>{e.status}</span>
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-[#9D8C7D]">{e.broker_name ?? "—"}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#9D8C7D]">{e.lodged_date ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
