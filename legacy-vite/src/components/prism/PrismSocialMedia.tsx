import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Instagram, Linkedin, Facebook, Hash, Clock, Sparkles, X, Copy, CheckCircle2, Save, BookmarkCheck, Wand2 } from "lucide-react";

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

const TONES = ["Professional", "Friendly", "Bold", "Casual", "Inspirational", "Witty", "Educational"];

export default function PrismSocialMedia({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showGen, setShowGen] = useState(false);
  const [genForm, setGenForm] = useState({ topic: "", platforms: ["instagram"], tone: "Professional" });
  const [copied, setCopied] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");

  useEffect(() => {
    if (!user) return;
    supabase.from("social_posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setPosts(data as Post[]); });
  }, [user]);

  const generatePost = () => {
    if (!onSendToChat || !genForm.topic.trim()) return;
    const platformNames = genForm.platforms.join(", ");
    onSendToChat(`Generate social media posts for: ${platformNames}. Topic: "${genForm.topic}". Tone: ${genForm.tone}. 

For EACH platform, provide:
1. **Scroll-stopping hook** (first line that grabs attention)
2. **Full caption** (platform-optimised length, engaging, NZ-focused)
3. 📣 **Call to Action** (specific and compelling)
4. # **Hashtags** (8-12 relevant, mix of broad + niche NZ-specific)
5. **Best posting time** for NZ audience
6. **Engagement tip** for this platform

Make them punchy, on-brand, and ready to copy-paste.`);
    setShowGen(false);
  };

  const copyCaption = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const savePost = async (post: Post) => {
    if (!user) return;
    await supabase.from("saved_items").insert({
      user_id: user.id,
      agent_id: "marketing",
      agent_name: "PRISM Social",
      content: `${post.caption}\n\n${post.hashtags || ""}`,
      preview: `${post.platform} post: ${post.topic || post.caption.substring(0, 50)}`,
    });
    await supabase.from("exported_outputs").insert({
      user_id: user.id,
      agent_id: "marketing",
      agent_name: "PRISM",
      title: `${post.platform} — ${post.topic || "Social Post"}`,
      output_type: "social_post",
      format: "text",
      content_preview: post.caption.substring(0, 300),
    });
    setSaved(post.id);
    setTimeout(() => setSaved(null), 3000);
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
        <div>
          <h2 className="text-sm font-display font-bold flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
            <Sparkles size={15} style={{ color: ACCENT }} /> Social Media
          </h2>
          <p className="text-[10px] font-body" style={{ color: "hsl(var(--muted-foreground))" }}>
            Create & manage platform-optimised social content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "hsl(var(--border))" }}>
            {["list", "calendar"].map(v => (
              <button key={v} onClick={() => setView(v as any)} className="px-2.5 py-1 text-[10px] font-medium capitalize"
                style={{ background: view === v ? `${ACCENT}15` : "transparent", color: view === v ? ACCENT : "hsl(var(--muted-foreground))" }}>{v}</button>
            ))}
          </div>
          <button onClick={() => setShowGen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-display font-bold"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}CC)`, color: "#0A0A14" }}>
            <Wand2 size={12} /> Generate
          </button>
        </div>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-4 gap-2">
        {PLATFORMS.map(p => {
          const count = posts.filter(po => po.platform === p.id).length;
          const Icon = p.icon;
          return (
            <div key={p.id} className="rounded-xl p-2.5 text-center" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <Icon size={14} className="mx-auto mb-1" style={{ color: ACCENT }} />
              <p className="text-xs font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>{count}</p>
              <p className="text-[9px] font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>{p.label}</p>
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
            <div key={post.id} className="rounded-xl p-3 space-y-2" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={12} style={{ color: ACCENT }} />
                  <span className="text-[10px] font-mono capitalize" style={{ color: "hsl(var(--muted-foreground))" }}>{post.platform}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background: post.status === "published" ? "rgba(102,187,106,0.12)" : "hsl(var(--muted))", color: post.status === "published" ? "rgba(102,187,106,0.9)" : "hsl(var(--muted-foreground))" }}>
                    {post.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => savePost(post)} className="p-1 rounded" style={{ color: saved === post.id ? "rgba(102,187,106,0.9)" : "hsl(var(--muted-foreground))" }}>
                    {saved === post.id ? <BookmarkCheck size={12} /> : <Save size={12} />}
                  </button>
                  <button onClick={() => copyCaption(post.id, post.caption)} className="p-1 rounded" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {copied === post.id ? <CheckCircle2 size={12} style={{ color: "rgba(102,187,106,0.9)" }} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] font-body line-clamp-3" style={{ color: "hsl(var(--foreground) / 0.7)" }}>{post.caption}</p>
              {post.hashtags && <p className="text-[10px] font-mono" style={{ color: `${ACCENT}80` }}>{post.hashtags}</p>}
              {post.scheduled_at && <p className="text-[9px] font-mono flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}><Clock size={9} /> {new Date(post.scheduled_at).toLocaleDateString("en-NZ")}</p>}
            </div>
          );
        })}
        {posts.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center" style={{ background: `${ACCENT}10` }}>
              <Instagram size={20} style={{ color: ACCENT }} />
            </div>
            <p className="text-xs font-body" style={{ color: "hsl(var(--muted-foreground))" }}>No posts yet — generate your first one!</p>
          </div>
        )}
      </div>

      {showGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>Generate Social Posts</h3>
              <button onClick={() => setShowGen(false)}><X size={16} style={{ color: "hsl(var(--muted-foreground))" }} /></button>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "hsl(var(--muted-foreground))" }}>Topic / Prompt *</label>
              <textarea value={genForm.topic} onChange={e => setGenForm(prev => ({ ...prev, topic: e.target.value }))} rows={3}
                className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
                style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }} placeholder="What should the posts be about?" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-2 block" style={{ color: "hsl(var(--muted-foreground))" }}>Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => {
                  const active = genForm.platforms.includes(p.id);
                  const Icon = p.icon;
                  return (
                    <button key={p.id} onClick={() => togglePlatform(p.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                      style={{ background: active ? `${ACCENT}15` : "hsl(var(--muted))", color: active ? ACCENT : "hsl(var(--muted-foreground))", border: `1px solid ${active ? ACCENT + "30" : "hsl(var(--border))"}` }}>
                      <Icon size={10} /> {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Tone</label>
              <div className="flex flex-wrap gap-1.5">
                {TONES.map(t => (
                  <button key={t} onClick={() => setGenForm(prev => ({ ...prev, tone: t }))}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                    style={{
                      background: genForm.tone === t ? `${ACCENT}15` : "hsl(var(--muted))",
                      color: genForm.tone === t ? ACCENT : "hsl(var(--muted-foreground))",
                      border: `1px solid ${genForm.tone === t ? ACCENT + "30" : "hsl(var(--border))"}`,
                    }}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={generatePost} disabled={!genForm.topic.trim() || genForm.platforms.length === 0}
              className="w-full py-2.5 rounded-xl text-xs font-display font-bold transition-all hover:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}CC)`, color: "#0A0A14", boxShadow: `0 0 20px ${ACCENT}30` }}>
              <Sparkles size={12} /> Generate with PRISM AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
