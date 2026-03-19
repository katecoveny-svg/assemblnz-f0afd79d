import { useState } from "react";
import { Copy, Check, MessageCircle, Zap, Users, BarChart3 } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

const EmbedPage = () => {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="https://assembl.co.nz/widget.js" data-agent="apex" data-color="#FF6B35"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen star-field flex flex-col">
      <BrandNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex-1">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4">
            Add your AI agent to <span className="text-gradient-hero">your website</span>
          </h1>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: '#ffffff38' }}>
            One line of code. Your customers get 24/7 expert answers. You get leads captured automatically.
          </p>
        </div>

        {/* Preview Mockup */}
        <div className="relative max-w-3xl mx-auto mb-16">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/40" />
                <div className="w-3 h-3 rounded-full bg-primary/30" />
                <div className="w-3 h-3 rounded-full bg-primary/20" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs font-mono-jb" style={{ color: '#ffffff38' }}>yourwebsite.co.nz</span>
              </div>
            </div>
            <div className="p-8 sm:p-12 min-h-[300px] relative bg-card">
              <div className="w-3/4 h-6 rounded bg-foreground/5 mb-4" />
              <div className="w-1/2 h-4 rounded bg-foreground/3 mb-3" />
              <div className="w-2/3 h-4 rounded bg-foreground/3 mb-6" />
              <div className="flex gap-3">
                <div className="w-1/3 h-32 rounded-lg bg-foreground/3" />
                <div className="w-1/3 h-32 rounded-lg bg-foreground/3" />
                <div className="w-1/3 h-32 rounded-lg bg-foreground/3" />
              </div>

              <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                <div className="bg-card border border-border rounded-xl p-4 w-64 shadow-2xl opacity-0 animate-fade-up" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full" style={{ background: "#FF6B35" }} />
                    <span className="text-xs font-bold text-foreground">APEX</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-auto" />
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: '#ffffff38' }}>
                    Hi! I'm APEX, your construction specialist. Ask me anything about NZ building codes, safety plans, or consenting.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-7 rounded-lg bg-muted border border-border" />
                    <div className="w-7 h-7 rounded-lg" style={{ background: "#FF6B35" }} />
                  </div>
                </div>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer"
                  style={{ background: "#FF6B35", boxShadow: "0 0 20px #FF6B3530" }}
                >
                  <MessageCircle size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-lg font-bold text-foreground mb-4 text-center">Add with one line of code</h2>
          <div className="relative rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <span className="text-xs font-mono-jb" style={{ color: '#ffffff38' }}>HTML</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium text-primary border border-primary/20 hover:bg-primary/10 transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 text-sm font-mono-jb text-primary overflow-x-auto">
              <code>{snippet}</code>
            </pre>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Zap, title: "24/7 Expert Answers", desc: "Your customers get instant, industry-specific answers powered by AI." },
            { icon: Users, title: "Lead Capture", desc: "Every conversation is a potential lead. Capture contact details automatically." },
            { icon: BarChart3, title: "Analytics & Insights", desc: "See what your customers ask most. Improve your service with real data." },
          ].map((b, i) => (
            <div
              key={b.title}
              className="rounded-xl border border-border bg-card p-6 text-center opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "forwards" }}
            >
              <b.icon size={28} className="mx-auto mb-3 text-primary" />
              <h3 className="text-sm font-bold text-foreground mb-1">{b.title}</h3>
              <p className="text-xs" style={{ color: '#ffffff38' }}>{b.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="mailto:hello@assembl.co.nz?subject=Embed Widget Interest"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Contact us to set up your embed
          </a>
        </div>
      </main>

      <BrandFooter />
    </div>
  );
};

export default EmbedPage;
