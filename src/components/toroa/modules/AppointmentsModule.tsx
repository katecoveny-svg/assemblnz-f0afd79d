import { motion } from "framer-motion";
import { Clock, AlertTriangle, MapPin } from "lucide-react";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";
const BONE = "#F5F0E8";

interface Appointment {
  id: string;
  title: string;
  appointment_at: string;
  location?: string;
  category: string;
  status: string;
  member_name?: string;
  is_overdue?: boolean;
}

interface Props {
  appointments: Appointment[];
}

const categoryColors: Record<string, string> = {
  medical: "#ef4444",
  dental: "#3b82f6",
  vet: KOWHAI,
  school: POUNAMU,
  general: `${BONE}60`,
};

const glass = {
  background: "rgba(15,15,26,0.55)",
  border: `1px solid ${KOWHAI}15`,
  backdropFilter: "blur(14px)",
};

export default function AppointmentsModule({ appointments }: Props) {
  const overdue = appointments.filter(a => a.is_overdue);
  const upcoming = appointments.filter(a => !a.is_overdue);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: `${BONE}90` }}>
          <Clock size={14} style={{ color: KOWHAI }} /> Appointments
        </h2>
        {overdue.length > 0 && (
          <span className="text-[9px] font-body px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}>
            <AlertTriangle size={9} /> {overdue.length} overdue
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-px" style={{ background: `${KOWHAI}20` }} />

        {[...overdue, ...upcoming].map((apt, i) => {
          const accent = categoryColors[apt.category] || KOWHAI;
          const d = new Date(apt.appointment_at);
          return (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative mb-3"
            >
              <div
                className="absolute left-[-18px] top-3 w-3 h-3 rounded-full border-2"
                style={{ borderColor: accent, background: apt.is_overdue ? accent : "transparent" }}
              />
              <div className="rounded-xl p-4" style={{ ...glass, borderColor: apt.is_overdue ? "rgba(239,68,68,0.2)" : `${KOWHAI}15` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-body text-xs" style={{ color: apt.is_overdue ? "#fca5a5" : `${BONE}CC` }}>{apt.title}</p>
                    {apt.member_name && <p className="font-body text-[10px]" style={{ color: `${BONE}50` }}>{apt.member_name}</p>}
                    {apt.location && (
                      <p className="font-body text-[10px] flex items-center gap-1 mt-0.5" style={{ color: `${BONE}40` }}>
                        <MapPin size={8} /> {apt.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px]" style={{ color: `${BONE}60` }}>
                      {d.toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                    </p>
                    <p className="font-mono text-[9px]" style={{ color: `${BONE}35` }}>
                      {d.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[8px] font-body px-1.5 py-0.5 rounded-full uppercase" style={{ background: `${accent}15`, color: accent }}>
                    {apt.category}
                  </span>
                  {apt.is_overdue && (
                    <span className="text-[8px] font-body px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}>
                      Overdue
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
