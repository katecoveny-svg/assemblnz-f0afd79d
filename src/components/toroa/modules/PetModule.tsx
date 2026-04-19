import { useState } from "react";
import { motion } from "framer-motion";
import { PawPrint, Syringe, Pill, Calendar, Plus, ChevronDown, ChevronUp } from "lucide-react";

const KOWHAI = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const BONE = "#F5F0E8";

interface Vaccination { name: string; date: string; next_due: string; }
interface Medication { name: string; dosage: string; frequency: string; until?: string; }
interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  date_of_birth?: string;
  weight_kg?: number;
  vet_clinic?: string;
  vet_phone?: string;
  microchip_number?: string;
  vaccinations: Vaccination[];
  medications: Medication[];
}

interface Props { pets: Pet[]; }

const glass = (accent = KOWHAI) => ({
  background: "rgba(255,255,255,0.65)",
  border: `1px solid ${accent}15`,
  backdropFilter: "blur(14px)",
});

export default function PetModule({ pets }: Props) {
  const [expanded, setExpanded] = useState<string | null>(pets[0]?.id || null);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: "#6B7280" }}>
        <PawPrint size={14} style={{ color: KOWHAI }} /> Pet Health
      </h2>

      {pets.map((pet) => {
        const open = expanded === pet.id;
        const overdueVax = pet.vaccinations.filter(v => new Date(v.next_due) < new Date());
        return (
          <motion.div key={pet.id} className="rounded-xl overflow-hidden" style={glass()} layout>
            <button
              onClick={() => setExpanded(open ? null : pet.id)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${KOWHAI}18` }}>
                  <PawPrint size={16} style={{ color: KOWHAI }} />
                </div>
                <div>
                  <p className="font-body text-sm" style={{ color: "#1A1D29" }}>{pet.name}</p>
                  <p className="font-body text-[10px]" style={{ color: "#9CA3AF" }}>
                    {pet.breed || pet.species}{pet.weight_kg ? ` · ${pet.weight_kg}kg` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {overdueVax.length > 0 && (
                  <span className="text-[9px] font-body px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5" }}>
                    {overdueVax.length} overdue
                  </span>
                )}
                {open ? <ChevronUp size={14} style={{ color: "#9CA3AF" }} /> : <ChevronDown size={14} style={{ color: "#9CA3AF" }} />}
              </div>
            </button>

            {open && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-4 pb-4 space-y-3">
                {/* Vaccinations */}
                <div>
                  <h4 className="font-display text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: `${POUNAMU}CC` }}>
                    <Syringe size={10} /> Vaccinations
                  </h4>
                  <div className="space-y-1.5">
                    {pet.vaccinations.map((v, i) => {
                      const overdue = new Date(v.next_due) < new Date();
                      return (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: overdue ? "rgba(239,68,68,0.06)" : `${POUNAMU}06` }}>
                          <div>
                            <p className="font-body text-xs" style={{ color: "#3D4250" }}>{v.name}</p>
                            <p className="font-mono text-[9px]" style={{ color: "#9CA3AF" }}>Given: {v.date}</p>
                          </div>
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded" style={{ 
                            background: overdue ? "rgba(239,68,68,0.15)" : `${POUNAMU}15`,
                            color: overdue ? "#fca5a5" : POUNAMU
                          }}>
                            {overdue ? "Overdue" : `Due: ${v.next_due}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Medications */}
                {pet.medications.length > 0 && (
                  <div>
                    <h4 className="font-display text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: `${KOWHAI}CC` }}>
                      <Pill size={10} /> Medications
                    </h4>
                    <div className="space-y-1.5">
                      {pet.medications.map((m, i) => (
                        <div key={i} className="p-2 rounded-lg" style={{ background: `${KOWHAI}06` }}>
                          <p className="font-body text-xs" style={{ color: "#3D4250" }}>{m.name} — {m.dosage}</p>
                          <p className="font-mono text-[9px]" style={{ color: "#9CA3AF" }}>{m.frequency}{m.until ? ` until ${m.until}` : ""}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vet info */}
                {pet.vet_clinic && (
                  <div className="p-2 rounded-lg" style={{ background: "#9CA3AF" }}>
                    <p className="font-body text-[10px]" style={{ color: "#9CA3AF" }}>Vet: {pet.vet_clinic}</p>
                    {pet.vet_phone && <p className="font-mono text-[10px]" style={{ color: "#9CA3AF" }}>{pet.vet_phone}</p>}
                    {pet.microchip_number && <p className="font-mono text-[9px] mt-1" style={{ color: "#9CA3AF" }}>Microchip: {pet.microchip_number}</p>}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
