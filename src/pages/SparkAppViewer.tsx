import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function SparkAppViewer() {
  const { appName } = useParams();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [showBranding, setShowBranding] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [wrongPassword, setWrongPassword] = useState(false);

  useEffect(() => {
    if (!appName) return;
    supabase.from("spark_apps" as any).select("*").eq("name", appName).eq("status", "live").limit(1)
      .then(({ data }) => {
        const apps = data as any[];
        if (!apps || apps.length === 0) {
          setNotFound(true);
          return;
        }
        const app = apps[0];
        if (app.password_hash) {
          setPasswordRequired(true);
          setStoredPassword(app.password_hash);
          setShowBranding(app.show_branding);
        } else {
          setHtmlContent(app.html_content);
          setShowBranding(app.show_branding);
        }
        // Increment view count (fire and forget)
        supabase.from("spark_apps" as any).update({ view_count: (app.view_count || 0) + 1 } as any).eq("id", app.id).then(() => {});
      });
  }, [appName]);

  const checkPassword = () => {
    if (passwordInput === storedPassword) {
      setPasswordRequired(false);
      // Re-fetch to get content
      supabase.from("spark_apps" as any).select("html_content").eq("name", appName!).limit(1)
        .then(({ data }) => {
          const apps = data as any[];
          if (apps?.[0]) setHtmlContent(apps[0].html_content);
        });
    } else {
      setWrongPassword(true);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "transparent" }}>
        <div className="text-center space-y-2">
          <p className="text-lg font-display font-bold" style={{ color: "#E4E4EC" }}>App not found</p>
          <p className="text-xs" style={{ color: "#6B7280" }}>This app may have been removed or paused.</p>
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "transparent" }}>
        <div className="w-full max-w-xs space-y-4 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}>
          <h2 className="text-sm font-display font-bold text-center" style={{ color: "#E4E4EC" }}>This app is password protected</h2>
          <input type="password" value={passwordInput} onChange={e => { setPasswordInput(e.target.value); setWrongPassword(false); }}
            placeholder="Enter password..."
            className="w-full px-3 py-2.5 rounded-lg text-xs font-body bg-transparent border outline-none"
            style={{ borderColor: wrongPassword ? "#C85A54" : "rgba(255,255,255,0.06)", color: "#E4E4EC" }}
            onKeyDown={e => e.key === "Enter" && checkPassword()} />
          {wrongPassword && <p className="text-[10px] text-red-400">Incorrect password</p>}
          <button onClick={checkPassword} className="w-full py-2.5 rounded-lg text-xs font-semibold"
            style={{ background: "#5AADA020", color: "#5AADA0", border: "1px solid #5AADA030" }}>
            Enter
          </button>
        </div>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "transparent" }}>
        <p className="text-xs" style={{ color: "#9CA3AF" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: "transparent" }}>
      <iframe
        srcDoc={htmlContent}
        className="w-full h-screen border-0"
        sandbox="allow-scripts allow-same-origin"
        title={appName}
      />
      {showBranding && (
        <a href="/chat/spark" target="_blank" rel="noopener noreferrer"
          className="fixed bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium backdrop-blur-sm z-50"
          style={{ background: "rgba(90,173,160,0.15)", color: "#5AADA0", border: "1px solid rgba(90,173,160,0.25)" }}>
           Built with SPARK by Assembl
        </a>
      )}
    </div>
  );
}
