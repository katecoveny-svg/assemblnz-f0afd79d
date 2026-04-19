import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Calculator, Globe, Pencil } from "lucide-react";

const KOWHAI = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const BONE = "#F5F0E8";
const TANGAROA = "#1A3A5C";

interface Subject {
  name: string;
  icon: string;
  nzcLevel: string;
}

interface Child {
  name: string;
  year_level: string;
  subjects: Subject[];
}

interface Props {
  children: Child[];
}

const subjectIcons: Record<string, React.ReactNode> = {
  maths: <Calculator size={14} />,
  english: <Pencil size={14} />,
  science: <Globe size={14} />,
  te_reo: <GraduationCap size={14} />,
};

const glass = {
  background: "rgba(255,255,255,0.65)",
  border: `1px solid ${TANGAROA}25`,
  backdropFilter: "blur(14px)",
};

export default function HomeworkHelp({ children }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: "#6B7280" }}>
        <BookOpen size={14} style={{ color: POUNAMU }} /> Homework Help
      </h2>

      <div className="rounded-xl p-4" style={{ ...glass, borderColor: `${POUNAMU}15` }}>
        <p className="font-body text-xs" style={{ color: "#6B7280" }}>
          NZC-aligned, age-appropriate help. Ask Tōro about any subject and it will tailor explanations to your child's year level.
        </p>
      </div>

      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl p-5 space-y-3"
          style={glass}
        >
          <div className="flex items-center justify-between">
            <p className="font-body text-sm" style={{ color: "#1A1D29" }}>{child.name}</p>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded" style={{ background: `${POUNAMU}15`, color: POUNAMU }}>
              Year {child.year_level} · NZC
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {child.subjects.map((s, j) => (
              <button
                key={j}
                className="rounded-lg p-3 flex items-center gap-2 text-left transition-all hover:scale-[1.02]"
                style={{ background: `${TANGAROA}20`, border: `1px solid ${TANGAROA}30` }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${POUNAMU}15`, color: POUNAMU }}>
                  {subjectIcons[s.icon] || <BookOpen size={14} />}
                </div>
                <div>
                  <p className="font-body text-xs" style={{ color: "#3D4250" }}>{s.name}</p>
                  <p className="font-mono text-[8px]" style={{ color: "#9CA3AF" }}>Level {s.nzcLevel}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
