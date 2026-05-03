import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Car, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface LoanCar {
  id: string;
  make: string;
  model: string;
  rego: string;
  status: string;
  borrower_name: string | null;
  borrower_phone: string | null;
  return_date: string | null;
}

export default function AratakiLoanCars() {
  const { user } = useAuth();
  const [cars, setCars] = useState<LoanCar[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ make: "", model: "", rego: "" });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("loan_cars")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setCars(data as LoanCar[]));
  }, [user]);

  const addCar = async () => {
    if (!user || !form.rego.trim()) return;
    const { data, error } = await supabase
      .from("loan_cars")
      .insert({ ...form, user_id: user.id, status: "available" })
      .select()
      .single();
    if (error) return toast.error("Failed to add");
    setCars((p) => [data as LoanCar, ...p]);
    setShowAdd(false);
    setForm({ make: "", model: "", rego: "" });
    toast.success("Loan car added");
  };

  const toggleAvailability = async (car: LoanCar) => {
    const newStatus = car.status === "available" ? "on_loan" : "available";
    await supabase.from("loan_cars").update({ status: newStatus }).eq("id", car.id);
    setCars((p) => p.map((c) => (c.id === car.id ? { ...c, status: newStatus } : c)));
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-20 lg:pt-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Car size={18} className="text-[#D5C0C8]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">Fleet</span>
          </div>
          <h1 className="font-display text-3xl text-[#6F6158]">Loan cars</h1>
          <p className="font-body text-sm text-[#9D8C7D] mt-1">Manage courtesy vehicles and current borrowers.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body text-sm font-medium rounded-xl px-5 py-2.5 transition-colors"
        >
          <Plus size={16} /> Add loan car
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.length === 0 ? (
          <div className="col-span-full bg-white/80 rounded-3xl p-10 text-center font-body text-sm text-[#9D8C7D] border border-[rgba(142,129,119,0.14)]">
            No loan cars yet.
          </div>
        ) : cars.map((c) => {
          const available = c.status === "available";
          return (
            <div
              key={c.id}
              className={`bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-5 ${
                available ? "border-l-4 border-l-[#C9D8D0]" : "border-l-4 border-l-[#D9BC7A]"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-lg text-[#6F6158]">{c.make} {c.model}</h3>
                  <p className="font-mono text-xs text-[#9D8C7D]">{c.rego}</p>
                </div>
                <span
                  className={`w-2 h-2 rounded-full mt-2 ${available ? "bg-[#7FB089]" : "bg-[#D9BC7A]"}`}
                  title={available ? "Available" : "On loan"}
                />
              </div>
              {!available && c.borrower_name && (
                <div className="text-xs font-body text-[#9D8C7D] mb-3">
                  <div>Borrower: <span className="text-[#6F6158]">{c.borrower_name}</span></div>
                  {c.return_date && <div>Returns: <span className="font-mono">{c.return_date}</span></div>}
                </div>
              )}
              <button
                onClick={() => toggleAvailability(c)}
                className="w-full text-xs font-body text-[#9D8C7D] hover:text-[#6F6158] hover:bg-[#EEE7DE] rounded-xl py-2 transition-colors"
              >
                {available ? "Mark on loan" : "Mark available"}
              </button>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6F6158]/30 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-[#6F6158]">Add loan car</h3>
              <button onClick={() => setShowAdd(false)} className="text-[#9D8C7D]"><X size={18} /></button>
            </div>
            {[{ k: "make", l: "Make" }, { k: "model", l: "Model" }, { k: "rego", l: "Rego *" }].map((f) => (
              <div key={f.k}>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] block mb-1">{f.l}</label>
                <input
                  value={(form as Record<string, string>)[f.k]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.k]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8C8B4]/40 bg-white font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
                />
              </div>
            ))}
            <button onClick={addCar} className="w-full py-2.5 rounded-xl bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body font-medium text-sm transition-colors">
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
