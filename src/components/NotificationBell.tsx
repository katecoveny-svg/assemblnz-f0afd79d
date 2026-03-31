import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const AGENT_COLORS: Record<string, string> = {
  AROHA: "#ec4899", LEDGER: "#22c55e", FLUX: "#3b82f6", ANCHOR: "#a855f7",
  ECHO: "#06b6d4", PRISM: "#f59e0b", HAVEN: "#14b8a6", TURF: "#84cc16",
  APEX: "#ef4444", FORGE: "#f97316", AURA: "#8b5cf6", HELM: "#06b6d4",
  MANAAKI: "#ec4899", KINDLE: "#f43f5e", NEXUS: "#1A3A5C",
};

interface NotifItem {
  id: string;
  agent_name: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifications((data as NotifItem[]) || []);
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    await supabase.from("user_notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("user_notifications").update({ read: true }).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const priorityDot = (p: string) => {
    if (p === "urgent") return "bg-red-500";
    if (p === "high") return "bg-orange-500";
    return "bg-emerald-500";
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted/20 transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground min-w-[18px] px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-card border-border/40 backdrop-blur-xl" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">No notifications yet</p>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-3 hover:bg-muted/10 cursor-pointer transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                onClick={() => markRead(n.id)}
              >
                <div className="flex-shrink-0 mt-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: AGENT_COLORS[n.agent_name.toUpperCase()] || "#64748b" }}
                  >
                    {n.agent_name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${priorityDot(n.priority)}`} />
                    <span className="text-xs font-semibold truncate">{n.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-muted-foreground/60 mt-1 block">{timeAgo(n.created_at)}</span>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
