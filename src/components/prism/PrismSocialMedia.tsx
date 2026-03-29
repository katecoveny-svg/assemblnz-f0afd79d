import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Instagram, Linkedin, Facebook, Hash, Clock, Sparkles, X, Copy, CheckCircle2 } from "lucide-react";

interface Post {
  id: string;
  platform: string;
  caption: string;
  hashtags: string | null;
  topic: string | null;
  tone: string | null;
  status: string;
  scheduled_at: string | null;
  created_at: string;
}

const ACCENT = "#E040FB";
const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "tiktok", label: "TikTok", icon: Hash },
];

export default function PrismSocialMedia({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showGen, setShowGen] = useState(false);
  const [genForm, setGenForm] = useState({ topic: "", platforms: ["instagram"], tone: "Professional" });
  const [copied, setCopied] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");

  useEffect(() => {
    if (!user) return;
    supabase.from("social_posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setPosts(data as Post[]); });
  }, [user]);

  const generatePost = () => {
    if (!onSendToChat || !genForm.topic.trim()) return;
    const platformNames = genForm.platforms.join(", ");
    onSendToChat(`Generate social media posts for: ${platformNames}. Topic: "${genForm.topic}". Tone: ${genForm.tone}. For each platform, provide a platform-specific caption and relevant hashtags. Make them engaging and NZ-focused.`);
    setShowGen(false);
  };

  const copyCaption = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const togglePlatform = (p: string) => {
    setGenForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) ? prev.platforms.filter(x => x !== p) : [...prev.platforms, p],
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-syne font-bold" style={{ color: "#E4E4EC" }}>Social Media</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {["list", "calendar"].map(v => (
              <button key={v} onClick={() => setView(v as any)} className="px-2.5 py-1 text-[10px] font-medium capitalize"
                style={{ background: view === v ? `${ACCENT}15` : "transparent", color: view === v ? ACCENT : "rgba(255,255,255,0.4)" }}>{v}</button>
            ))}
          </div>
          <button onClick={() => setShowGen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
            style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
            <Sparkles size={12} /> Generate
          </button>
        </div>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-4 gap-2">
        {PLATFORMS.map(p => {
          const count = posts.filter(po => po.platform === p.id).length;
          const Icon = p.icon;
          return (
            <div key={p.id} className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <Icon size={14} className="mx-auto mb-1" style={{ color: "rgba(255,255,255,0.4)" }} />
              <p className="text-xs font-syne font-bold" style={{ color: "#E4E4EC" }}>{count}</p>
              <p className="text-[9px] font-mono-jb" style={{ color: "rgba(255,255,255,0.3)" }}>{p.label}</p>
            </div>
          );
        })}
      </div>

      {/* Posts list */}
      <div className="space-y-2">
        {posts.map(post => {
          const platform = PLATFORMS.find(p => p.id === post.platform);
          const Icon = platform?.icon || Hash;
          return (
            <div key={post.id} className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={12} style={{ color: ACCENT }} />
                  <span className="text-[10px] font-mono-jb capitalize" style={{ color: "rgba(255,255,255,0.5)" }}>{post.platform}</span>
                  <span className="text-[9px] font-mono-jb px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background: post.status === "published" ? "rgba(102,187,106,0.12)" : "rgba(255,255,255,0.05)", color: post.status === "published" ? "rgba(102,187,106,0.9)" : "rgba(255,255,255,0.4)" }}>
                    {post.status}
                  </span>
                </div>
                <button onClick={() => copyCaption(post.id, post.caption)} className="p-1 rounded transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {copied === post.id ? <CheckCircle2 size={12} style={{ color: "rgba(102,187,106,0.9)" }} /> : <Copy size={12} />}
                </button>
              </div>
              <p className="text-[11px] font-jakarta line-clamp-3" style={{ color: "rgba(255,255,255,0.5)" }}>{post.caption}</p>
              {post.hashtags && <p className="text-[10px] font-mono-jb" style={{ color: `${ACCENT}80` }}>{post.hashtags}</p>}
              {post.scheduled_at && <p className="text-[9px] font-mono-jb flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)" }}><Clock size={9} /> {new Date(post.scheduled_at).toLocaleDateString("en-NZ")}</p>}
            </div>
          );
        })}
        {posts.length === 0 && <p className="text-xs font-jakarta text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>No posts yet — generate your first one!</p>}
      </div>

      {showGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "#0D0D14", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-syne font-bold" style={{ color: "#E4E4EC" }}>Generate Social Posts</h3>
              <button onClick={() => setShowGen(false)}><X size={16} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
            </div>
            <div>
              <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>Topic / Prompt *</label>
              <textarea value={genForm.topic} onChange={e => setGenForm(prev => ({ ...prev, topic: e.target.value }))} rows={3}
                className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none resize-none"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} placeholder="What should the posts be about?" />
            </div>
            <div>
              <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-2 block" style={{ color: "rgba(255,255,255,0.4)" }}>Platforms</label>
              <div className="flex gap-2">
                {PLATFORMS.map(p => {
                  const active = genForm.platforms.includes(p.id);
                  const Icon = p.icon;
                  return (
                    <button key={p.id} onClick={() => togglePlatform(p.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                      style={{ background: active ? `${ACCENT}15` : "rgba(255,255,255,0.03)", color: active ? ACCENT : "rgba(255,255,255,0.4)", border: `1px solid ${active ? ACCENT + "30" : "rgba(255,255,255,0.05)"}` }}>
                      <Icon size={10} /> {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>Tone</label>
              <select value={genForm.tone} onChange={e => setGenForm(prev => ({ ...prev, tone: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }}>
                {["Professional", "Friendly", "Bold", "Casual", "Inspirational"].map(t => <option key={t} value={t} style={{ background: "#0D0D14" }}>{t}</option>)}
              </select>
            </div>
            <button onClick={generatePost} disabled={!genForm.topic.trim() || genForm.platforms.length === 0}
              className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2"
              style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
              <Sparkles size={12} /> Generate with AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
