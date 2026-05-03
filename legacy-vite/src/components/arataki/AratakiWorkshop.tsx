import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Wrench, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  job_id: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  rego: string | null;
  customer_name: string | null;
  status: string | null;
  technician: string | null;
  due_date: string | null;
  notes: string | null;
}

const STATUSES = ["Booked", "In progress", "Waiting parts", "Complete"] as const;
const STATUS_BG: Record<string, string> = {
  Booked: "bg-[#C7D9E8]/30 text-[#6F6158]",
  "In progress": "bg-[#C9D8D0]/30 text-[#6F6158]",
  "Waiting parts": "bg-[#D9BC7A]/20 text-[#6F6158]",
  Complete: "bg-[#C9D8D0]/50 text-[#6F6158]",
};

export default function AratakiWorkshop() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    vehicle_make: "",
    vehicle_model: "",
    rego: "",
    customer_name: "",
    technician: "",
    due_date: "",
    status: "Booked",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("workshop_jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setJobs(data as Job[]));
  }, [user]);

  const addJob = async () => {
    if (!user || !form.rego.trim()) {
      toast.error("Rego is required");
      return;
    }
    const { data, error } = await (supabase as any)
      .from("workshop_jobs")
      .insert({ ...form, user_id: user.id, due_date: form.due_date || null })
      .select()
      .single();
    if (error) return toast.error("Failed to add job");
    setJobs((p) => [data as Job, ...p]);
    setShowAdd(false);
    setForm({ vehicle_make: "", vehicle_model: "", rego: "", customer_name: "", technician: "", due_date: "", status: "Booked" });
    toast.success("Job added");
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("workshop_jobs").update({ status }).eq("id", id);
    setJobs((p) => p.map((j) => (j.id === id ? { ...j, status } : j)));
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-20 lg:pt-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={18} className="text-[#D5C0C8]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">Workshop</span>
          </div>
          <h1 className="font-display text-3xl text-[#6F6158]">Workshop jobs</h1>
          <p className="font-body text-sm text-[#9D8C7D] mt-1">Track active service jobs and technician assignments.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body text-sm font-medium rounded-xl px-5 py-2.5 transition-colors"
        >
          <Plus size={16} /> Add job
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#D8C8B4]/30">
              <tr>
                {["Job #", "Vehicle", "Customer", "Status", "Technician", "Due"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left font-mono text-xs uppercase tracking-wider text-[#9D8C7D]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center font-body text-sm text-[#9D8C7D]">No jobs yet. Add your first one.</td></tr>
              ) : jobs.map((j) => (
                <tr key={j.id} className="border-b border-[#EEE7DE] hover:bg-[#F7F3EE]/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-sm text-[#6F6158]">{j.job_id ?? j.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 font-body text-sm text-[#6F6158]">
                    <div>{j.vehicle_make} {j.vehicle_model}</div>
                    <div className="font-mono text-xs text-[#9D8C7D]">{j.rego}</div>
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-[#6F6158]">{j.customer_name ?? "—"}</td>
                  <td className="px-5 py-4">
                    <select
                      value={j.status ?? "Booked"}
                      onChange={(e) => updateStatus(j.id, e.target.value)}
                      className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer ${STATUS_BG[j.status ?? "Booked"] ?? STATUS_BG.Booked}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-[#9D8C7D]">{j.technician ?? "—"}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#9D8C7D]">{j.due_date ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6F6158]/30 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-[#6F6158]">Add job</h3>
              <button onClick={() => setShowAdd(false)} className="text-[#9D8C7D]"><X size={18} /></button>
            </div>
            {[
              { k: "vehicle_make", l: "Make" },
              { k: "vehicle_model", l: "Model" },
              { k: "rego", l: "Rego *" },
              { k: "customer_name", l: "Customer" },
              { k: "technician", l: "Technician" },
              { k: "due_date", l: "Due date", type: "date" },
            ].map((f) => (
              <div key={f.k}>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] block mb-1">{f.l}</label>
                <input
                  type={f.type ?? "text"}
                  value={(form as Record<string, string>)[f.k]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.k]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8C8B4]/40 bg-white font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
                />
              </div>
            ))}
            <button onClick={addJob} className="w-full py-2.5 rounded-xl bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body font-medium text-sm transition-colors">
              Add job
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
