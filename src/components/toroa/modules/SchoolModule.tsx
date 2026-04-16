import { motion } from "framer-motion";
import { GraduationCap, FileText, Calendar, Bell } from "lucide-react";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";
const BONE = "#F5F0E8";
const TANGAROA = "#1A3A5C";

interface SchoolChild {
  name: string;
  school: string;
  year_level: string;
  teacher?: string;
  upcoming: string[];
  newsletters: { title: string; date: string }[];
}

interface TermDates {
  term: string;
  start: string;
  end: string;
  current?: boolean;
}

interface Props {
  children: SchoolChild[];
  termDates: TermDates[];
}

const glass = (accent = POUNAMU) => ({
  background: "rgba(255,255,255,0.65)",
  border: `1px solid ${accent}15`,
  backdropFilter: "blur(14px)",
});

export default function SchoolModule({ children, termDates }: Props) {
  const currentTerm = termDates.find(t => t.current);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: "#6B7280" }}>
        <GraduationCap size={14} style={{ color: POUNAMU }} /> School
      </h2>

      {/* Term dates bar */}
      {currentTerm && (
        <div className="rounded-xl p-3 flex items-center justify-between" style={glass(TANGAROA)}>
          <div className="flex items-center gap-2">
            <Calendar size={12} style={{ color: POUNAMU }} />
            <span className="font-body text-xs" style={{ color: "#6B7280" }}>{currentTerm.term}</span>
          </div>
          <span className="font-mono text-[10px]" style={{ color: "#9CA3AF" }}>
            {currentTerm.start} — {currentTerm.end}
          </span>
        </div>
      )}

      {/* Per-child cards */}
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl p-5 space-y-3"
          style={glass()}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm" style={{ color: "#1A1D29" }}>{child.name}</p>
              <p className="font-body text-[10px]" style={{ color: "#9CA3AF" }}>
                {child.school} · Year {child.year_level}
                {child.teacher ? ` · ${child.teacher}` : ""}
              </p>
            </div>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded" style={{ background: `${POUNAMU}15`, color: POUNAMU }}>
              Y{child.year_level}
            </span>
          </div>

          {/* Upcoming */}
          {child.upcoming.length > 0 && (
            <div>
              <h4 className="font-display text-[9px] uppercase tracking-wider mb-1.5 flex items-center gap-1" style={{ color: `${KOWHAI}AA` }}>
                <Bell size={9} /> Upcoming
              </h4>
              <div className="space-y-1">
                {child.upcoming.map((u, j) => (
                  <div key={j} className="flex items-center gap-2 py-1">
                    <span className="w-1 h-1 rounded-full" style={{ background: KOWHAI }} />
                    <span className="font-body text-xs" style={{ color: "#6B7280" }}>{u}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newsletters */}
          {child.newsletters.length > 0 && (
            <div>
              <h4 className="font-display text-[9px] uppercase tracking-wider mb-1.5 flex items-center gap-1" style={{ color: `${POUNAMU}AA` }}>
                <FileText size={9} /> Recent Newsletters
              </h4>
              <div className="space-y-1">
                {child.newsletters.map((n, j) => (
                  <div key={j} className="flex items-center justify-between py-1">
                    <span className="font-body text-xs" style={{ color: "#6B7280" }}>{n.title}</span>
                    <span className="font-mono text-[9px]" style={{ color: "#9CA3AF" }}>{n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
