import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, GraduationCap, Trophy, Heart, Wallet, Inbox, Loader2 } from "lucide-react";

type Category = "all" | "school" | "sports" | "health" | "payments";

interface EmailFlag {
  id: string;
  sender: string;
  subject: string;
  category: string;
  action_required: boolean;
  source_link: string | null;
  received_at: string | null;
  created_at: string;
}

const CATEGORY_ICONS: Record<string, typeof Mail> = {
  school: GraduationCap,
  sports: Trophy,
  health: Heart,
  payments: Wallet,
};

const TABS: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "school", label: "Schools" },
  { key: "sports", label: "Sports" },
  { key: "health", label: "Health" },
  { key: "payments", label: "Payments" },
];

const timeAgo = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export const EmailWatchCard = () => {
  const [flags, setFlags] = useState<EmailFlag[]>([]);
  const [filter, setFilter] = useState<Category>("all");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    void loadFlags();
  }, []);

  const loadFlags = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("toroa_email_flags")
      .select("id, sender, subject, category, action_required, source_link, received_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setFlags((data ?? []) as EmailFlag[]);
    setLoading(false);
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      // Placeholder hook for Gmail search_threads — front-end stub for now.
      await new Promise((r) => setTimeout(r, 900));
      await loadFlags();
    } finally {
      setScanning(false);
    }
  };

  const visible = filter === "all" ? flags : flags.filter((f) => f.category === filter);

  return (
    <article className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] overflow-hidden">
      <div className="h-1 bg-[#C7D9E8]" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl text-[#9D8C7D]">School &amp; Family Emails</h2>
            <p className="font-['Inter'] text-sm text-[#9D8C7D]/80">Flagged from your inbox</p>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="bg-[#D9BC7A] hover:bg-[#C4A665] disabled:opacity-60 text-[#6F6158] rounded-xl px-4 py-2 text-sm font-medium font-['Inter'] inline-flex items-center gap-2 transition-colors"
          >
            {scanning ? <Loader2 size={14} className="animate-spin" /> : <Inbox size={14} />}
            {scanning ? "Scanning…" : "Scan Inbox"}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1 rounded-full text-xs font-['Inter'] transition-colors ${
                filter === t.key
                  ? "bg-[#EEE7DE] text-[#6F6158] font-medium"
                  : "text-[#9D8C7D] hover:bg-[#EEE7DE]/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-10 text-sm text-[#9D8C7D] font-['Inter']">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Mail size={28} className="mx-auto mb-3 text-[#9D8C7D]/60" />
            <p className="text-sm text-[#6F6158] font-['Inter']">
              {flags.length === 0
                ? "Connect Gmail to start watching for family emails"
                : "No emails in this category"}
            </p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {visible.map((f) => {
              const Icon = CATEGORY_ICONS[f.category] ?? Mail;
              const when = f.received_at ?? f.created_at;
              return (
                <li
                  key={f.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#EEE7DE]/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#C7D9E8]/40 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-[#6F6158]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-['Inter'] text-sm font-medium text-[#6F6158] truncate">
                        {f.sender}
                      </span>
                      <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#9D8C7D] flex-shrink-0">
                        {timeAgo(when)}
                      </span>
                    </div>
                    <p className="font-['Inter'] text-xs text-[#6F6158]/80 truncate">{f.subject}</p>
                    {f.action_required && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-['Inter'] font-medium bg-[#D9BC7A]/30 text-[#6F6158]">
                        Action needed
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
};
