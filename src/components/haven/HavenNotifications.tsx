import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, BellOff, Check, Wrench, Home, Shield, User } from "lucide-react";

const HAVEN_PINK = "#D4A843";
const TYPE_ICONS: Record<string, typeof Bell> = { job: Wrench, property: Home, compliance: Shield, tradie: User };

const HavenNotifications = () => {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from("haven_notifications").select("*").order("created_at", { ascending: false }).limit(50);
      setNotifs(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from("haven_notifications").update({ is_read: true }).eq("id", id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("haven_notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-base text-foreground">Notifications</h2>
          <p className="text-[11px] font-body text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[10px] font-body" style={{ color: HAVEN_PINK }}>Mark all read</button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />)}</div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-12">
          <Bell size={32} className="mx-auto text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground mt-2">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notifs.map(n => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            return (
              <div key={n.id} className="flex items-start gap-2 px-3 py-2 rounded-lg border transition-all"
                style={{ backgroundColor: n.is_read ? "rgba(255,255,255,0.01)" : HAVEN_PINK + "05", borderColor: n.is_read ? "rgba(255,255,255,0.04)" : HAVEN_PINK + "15" }}>
                <Icon size={12} className="mt-0.5" style={{ color: n.is_read ? "rgba(255,255,255,0.3)" : HAVEN_PINK }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-body text-foreground">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground">{n.message}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(n.created_at).toLocaleString("en-NZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} className="p-1 rounded hover:bg-muted shrink-0"><Check size={10} style={{ color: HAVEN_PINK }} /></button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HavenNotifications;
