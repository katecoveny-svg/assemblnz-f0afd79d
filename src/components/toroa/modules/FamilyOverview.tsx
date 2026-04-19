import { motion } from "framer-motion";
import { Users, Plus, PawPrint } from "lucide-react";

const KOWHAI = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const BONE = "#F5F0E8";

interface Member {
  name: string;
  role: string;
  avatar?: string;
}

interface Pet {
  name: string;
  species: string;
  breed?: string;
}

interface Props {
  members: Member[];
  pets: Pet[];
  children: { name: string; school?: string; year?: string }[];
}

const glass = (accent = KOWHAI) => ({
  background: "rgba(255,255,255,0.65)",
  border: `1px solid ${accent}15`,
  backdropFilter: "blur(14px)",
  boxShadow: `0 0 24px ${accent}06, 0 4px 24px rgba(0,0,0,0.25)`,
});

export default function FamilyOverview({ members, pets, children }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xs uppercase tracking-[0.2em]" style={{ color: "#6B7280" }}>
        Household
      </h2>

      {/* Adults */}
      <div className="grid grid-cols-2 gap-3">
        {members.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-4 flex items-center gap-3"
            style={glass()}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm"
              style={{ background: `${KOWHAI}18`, color: KOWHAI, fontWeight: 300 }}
            >
              {m.name.charAt(0)}
            </div>
            <div>
              <p className="font-body text-xs" style={{ color: "#1A1D29" }}>{m.name}</p>
              <p className="font-body text-[10px]" style={{ color: "#9CA3AF" }}>{m.role}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Children */}
      {children.length > 0 && (
        <>
          <h3 className="font-display text-[10px] uppercase tracking-[0.15em] mt-2" style={{ color: "#6B7280" }}>
            Tamariki
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {children.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-xl p-4"
                style={glass(POUNAMU)}
              >
                <p className="font-body text-xs" style={{ color: "#1A1D29" }}>{c.name}</p>
                {c.school && <p className="font-body text-[10px]" style={{ color: "#9CA3AF" }}>{c.school}</p>}
                {c.year && <p className="font-mono text-[9px]" style={{ color: `${POUNAMU}AA` }}>Year {c.year}</p>}
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Pets */}
      {pets.length > 0 && (
        <>
          <h3 className="font-display text-[10px] uppercase tracking-[0.15em] mt-2 flex items-center gap-1.5" style={{ color: "#6B7280" }}>
            <PawPrint size={10} /> Pets
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {pets.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="rounded-xl p-4 flex items-center gap-3"
                style={glass(KOWHAI)}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${KOWHAI}18` }}>
                  <PawPrint size={14} style={{ color: KOWHAI }} />
                </div>
                <div>
                  <p className="font-body text-xs" style={{ color: "#1A1D29" }}>{p.name}</p>
                  <p className="font-body text-[10px]" style={{ color: "#9CA3AF" }}>{p.breed || p.species}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
