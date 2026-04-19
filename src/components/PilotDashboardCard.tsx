import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, Mail, Target, Brain, ChevronRight, Sparkles,
  Clock, CheckCircle2, AlertTriangle, ArrowRight
} from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";

const PILOT_COLOR = "#D4A843";

const glassCard = "rounded-xl relative overflow-hidden";
const glassCardStyle: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const TopGlow = ({ color }: { color: string }) => (
  <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
);

const quickActions = [
  { icon: Calendar, label: "Today's schedule", prompt: "Show me my schedule for today" },
  { icon: Mail, label: "Email summary", prompt: "Summarise my unread emails" },
  { icon: Target, label: "Priority tasks", prompt: "What should I focus on today?" },
  { icon: Brain, label: "Weekly review", prompt: "Give me a weekly progress review" },
];

const todayTasks = [
  { id: "1", text: "Review Q1 revenue forecast", priority: "high", done: false },
  { id: "2", text: "Follow up with enterprise leads", priority: "medium", done: false },
  { id: "3", text: "Prepare LinkedIn content plan", priority: "medium", done: true },
  { id: "4", text: "Check agent deployment status", priority: "low", done: false },
];

const PilotDashboardCard = () => {
  const [hoveredAction, setHoveredAction] = useState<number | null>(null);
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className={glassCard + " p-5"} style={{ ...glassCardStyle, boxShadow: `0 0 30px ${PILOT_COLOR}10` }}>
      <TopGlow color={PILOT_COLOR} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <AgentAvatar agentId="pilot" color={PILOT_COLOR} size={40} showGlow />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-sm text-foreground">PILOT</h2>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: `${PILOT_COLOR}15`, color: PILOT_COLOR }}>ASM-099</span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">Executive Assistant</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{greeting}, Kate. Here's your command view.</p>
        </div>
        <Link to="/chat/pilot" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
          style={{ background: `${PILOT_COLOR}15`, color: PILOT_COLOR, border: `1px solid ${PILOT_COLOR}30` }}>
          Open PILOT <ArrowRight size={10} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <div>
          <p className="text-[10px] text-muted-foreground font-medium mb-2 uppercase tracking-wider">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, i) => (
              <Link key={i} to={`/chat/pilot?prompt=${encodeURIComponent(action.prompt)}`}
                className="flex items-center gap-2 p-2.5 rounded-lg transition-all cursor-pointer group"
                style={{
                  background: hoveredAction === i ? `${PILOT_COLOR}10` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${hoveredAction === i ? PILOT_COLOR + "30" : "rgba(255,255,255,0.04)"}`,
                }}
                onMouseEnter={() => setHoveredAction(i)}
                onMouseLeave={() => setHoveredAction(null)}>
                <action.icon size={13} style={{ color: hoveredAction === i ? PILOT_COLOR : "rgba(255,255,255,0.4)" }} />
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Priority List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Today's Priorities</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${PILOT_COLOR}15`, color: PILOT_COLOR }}>
              {todayTasks.filter(t => !t.done).length} pending
            </span>
          </div>
          <div className="space-y-1.5">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                {task.done ? (
                  <CheckCircle2 size={12} className="text-pounamu-light shrink-0" />
                ) : task.priority === "high" ? (
                  <AlertTriangle size={12} className="text-rust shrink-0" />
                ) : (
                  <Clock size={12} className="text-muted-foreground/40 shrink-0" />
                )}
                <span className={`text-[10px] flex-1 ${task.done ? "line-through text-muted-foreground/40" : "text-foreground/80"}`}>{task.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer insight */}
      <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg" style={{ background: `${PILOT_COLOR}06`, border: `1px solid ${PILOT_COLOR}12` }}>
        <Sparkles size={12} style={{ color: PILOT_COLOR }} />
        <p className="text-[10px] text-muted-foreground">
          <span style={{ color: PILOT_COLOR }} className="font-medium">PILOT insight:</span> You have 3 high-value leads awaiting follow-up. Revenue pipeline is tracking 12% above target this week.
        </p>
        <Link to="/chat/pilot" className="shrink-0">
          <ChevronRight size={12} className="text-muted-foreground/40" />
        </Link>
      </div>
    </div>
  );
};

export default PilotDashboardCard;
