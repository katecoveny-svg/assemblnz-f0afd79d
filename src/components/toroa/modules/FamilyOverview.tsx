import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Plus, X } from "lucide-react";

const TEAL_ACCENT = "#9D8C7D";
const POUNAMU = "#6F6158";

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

interface Child {
  name: string;
  school?: string;
  year?: string;
}

interface Props {
  members: Member[];
  pets: Pet[];
  children: Child[];
  onAddMember?: (m: Member) => void;
  onRemoveMember?: (index: number) => void;
  onAddChild?: (c: Child) => void;
  onRemoveChild?: (index: number) => void;
  onAddPet?: (p: Pet) => void;
  onRemovePet?: (index: number) => void;
}

const glass = (accent = TEAL_ACCENT) => ({
  background: "rgba(255,255,255,0.65)",
  border: `1px solid ${accent}15`,
  backdropFilter: "blur(14px)",
  boxShadow: `0 0 24px ${accent}06, 0 4px 24px rgba(0,0,0,0.06)`,
});

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  border: `1px solid ${TEAL_ACCENT}25`,
  color: "#3D4250",
};

const sectionHeader: React.CSSProperties = { color: "#7A6E63" };

function AddPill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors hover:-translate-y-px"
      style={{ background: `${TEAL_ACCENT}18`, color: POUNAMU, border: `1px solid ${TEAL_ACCENT}30` }}
    >
      <Plus size={10} /> {label}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Remove"
      className="ml-auto p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
      style={{ color: POUNAMU }}
    >
      <X size={12} />
    </button>
  );
}

export default function FamilyOverview({
  members, pets, children,
  onAddMember, onRemoveMember,
  onAddChild, onRemoveChild,
  onAddPet, onRemovePet,
}: Props) {
  const [openForm, setOpenForm] = useState<null | "member" | "child" | "pet">(null);
  const [memberDraft, setMemberDraft] = useState<Member>({ name: "", role: "Parent" });
  const [childDraft, setChildDraft] = useState<Child>({ name: "", school: "", year: "" });
  const [petDraft, setPetDraft] = useState<Pet>({ name: "", species: "dog", breed: "" });

  const submitMember = () => {
    if (!memberDraft.name.trim()) return;
    onAddMember?.(memberDraft);
    setMemberDraft({ name: "", role: "Parent" });
    setOpenForm(null);
  };
  const submitChild = () => {
    if (!childDraft.name.trim()) return;
    onAddChild?.(childDraft);
    setChildDraft({ name: "", school: "", year: "" });
    setOpenForm(null);
  };
  const submitPet = () => {
    if (!petDraft.name.trim()) return;
    onAddPet?.(petDraft);
    setPetDraft({ name: "", species: "dog", breed: "" });
    setOpenForm(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs uppercase tracking-[0.2em]" style={sectionHeader}>
          Household
        </h2>
        {onAddMember && <AddPill label="Add adult" onClick={() => setOpenForm(openForm === "member" ? null : "member")} />}
      </div>

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
              style={{ background: `${TEAL_ACCENT}18`, color: TEAL_ACCENT, fontWeight: 300 }}
            >
              {m.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-body text-xs truncate" style={{ color: "#3D4250" }}>{m.name}</p>
              <p className="font-body text-[10px]" style={{ color: "#9CA3AF" }}>{m.role}</p>
            </div>
            {onRemoveMember && <RemoveBtn onClick={() => onRemoveMember(i)} />}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {openForm === "member" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-3 space-y-2 overflow-hidden" style={glass()}
          >
            <input
              autoFocus value={memberDraft.name} onChange={(e) => setMemberDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="Name" className="w-full text-xs px-3 py-2 rounded-lg" style={inputStyle}
            />
            <input
              value={memberDraft.role} onChange={(e) => setMemberDraft(d => ({ ...d, role: e.target.value }))}
              placeholder="Role (e.g. Parent, Caregiver)" className="w-full text-xs px-3 py-2 rounded-lg" style={inputStyle}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpenForm(null)} className="text-[10px] px-3 py-1.5 rounded-full" style={{ color: POUNAMU }}>Cancel</button>
              <button onClick={submitMember} className="text-[10px] px-3 py-1.5 rounded-full font-medium" style={{ background: POUNAMU, color: "#F7F3EE" }}>Add adult</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Children */}
      <div className="flex items-center justify-between mt-2">
        <h3 className="font-display text-[10px] uppercase tracking-[0.15em]" style={sectionHeader}>
          Tamariki
        </h3>
        {onAddChild && <AddPill label="Add child" onClick={() => setOpenForm(openForm === "child" ? null : "child")} />}
      </div>

      {children.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {children.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-xl p-4 relative"
              style={glass(POUNAMU)}
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-body text-xs truncate" style={{ color: "#3D4250" }}>{c.name}</p>
                  {c.school && <p className="font-body text-[10px] truncate" style={{ color: "#9CA3AF" }}>{c.school}</p>}
                  {c.year && <p className="font-mono text-[9px]" style={{ color: `${POUNAMU}AA` }}>Year {c.year}</p>}
                </div>
                {onRemoveChild && <RemoveBtn onClick={() => onRemoveChild(i)} />}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {openForm === "child" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-3 space-y-2 overflow-hidden" style={glass(POUNAMU)}
          >
            <input
              autoFocus value={childDraft.name} onChange={(e) => setChildDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="Child's name" className="w-full text-xs px-3 py-2 rounded-lg" style={inputStyle}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={childDraft.school} onChange={(e) => setChildDraft(d => ({ ...d, school: e.target.value }))}
                placeholder="School (optional)" className="text-xs px-3 py-2 rounded-lg" style={inputStyle}
              />
              <input
                value={childDraft.year} onChange={(e) => setChildDraft(d => ({ ...d, year: e.target.value }))}
                placeholder="Year level" className="text-xs px-3 py-2 rounded-lg" style={inputStyle}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpenForm(null)} className="text-[10px] px-3 py-1.5 rounded-full" style={{ color: POUNAMU }}>Cancel</button>
              <button onClick={submitChild} className="text-[10px] px-3 py-1.5 rounded-full font-medium" style={{ background: POUNAMU, color: "#F7F3EE" }}>Add child</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pets */}
      <div className="flex items-center justify-between mt-2">
        <h3 className="font-display text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5" style={sectionHeader}>
          <PawPrint size={10} /> Pets
        </h3>
        {onAddPet && <AddPill label="Add pet" onClick={() => setOpenForm(openForm === "pet" ? null : "pet")} />}
      </div>

      {pets.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {pets.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="rounded-xl p-4 flex items-center gap-3"
              style={glass(TEAL_ACCENT)}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${TEAL_ACCENT}18` }}>
                <PawPrint size={14} style={{ color: TEAL_ACCENT }} />
              </div>
              <div className="min-w-0">
                <p className="font-body text-xs truncate" style={{ color: "#3D4250" }}>{p.name}</p>
                <p className="font-body text-[10px] truncate" style={{ color: "#9CA3AF" }}>{p.breed || p.species}</p>
              </div>
              {onRemovePet && <RemoveBtn onClick={() => onRemovePet(i)} />}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {openForm === "pet" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-3 space-y-2 overflow-hidden" style={glass()}
          >
            <input
              autoFocus value={petDraft.name} onChange={(e) => setPetDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="Pet's name" className="w-full text-xs px-3 py-2 rounded-lg" style={inputStyle}
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={petDraft.species} onChange={(e) => setPetDraft(d => ({ ...d, species: e.target.value }))}
                className="text-xs px-3 py-2 rounded-lg" style={inputStyle}
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
                <option value="fish">Fish</option>
                <option value="other">Other</option>
              </select>
              <input
                value={petDraft.breed} onChange={(e) => setPetDraft(d => ({ ...d, breed: e.target.value }))}
                placeholder="Breed (optional)" className="text-xs px-3 py-2 rounded-lg" style={inputStyle}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpenForm(null)} className="text-[10px] px-3 py-1.5 rounded-full" style={{ color: POUNAMU }}>Cancel</button>
              <button onClick={submitPet} className="text-[10px] px-3 py-1.5 rounded-full font-medium" style={{ background: POUNAMU, color: "#F7F3EE" }}>Add pet</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
