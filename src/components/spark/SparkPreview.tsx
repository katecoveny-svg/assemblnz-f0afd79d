import { useState, useRef, useCallback } from "react";
import { Copy, Download, Maximize2, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

interface SparkPreviewProps {
  code: string;
  onIterate?: () => void;
  onDeploy?: () => void;
}

const SparkPreview = ({ code, onIterate, onDeploy }: SparkPreviewProps) => {
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spark-app.html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded spark-app.html");
  }, [code]);

  const handleFullScreen = useCallback(() => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(code);
      win.document.close();
    }
  }, [code]);

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,107,0,0.15)" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
        <span className="text-[10px] font-mono-jb" style={{ color: "rgba(255,107,0,0.6)" }}>
          Live Preview
        </span>
        <div className="flex-1" />
        <button onClick={handleCopy} className="p-1.5 rounded hover:bg-white/5 transition-colors" title="Copy Code">
          {copied ? <Check size={13} style={{ color: "#00FF88" }} /> : <Copy size={13} style={{ color: "rgba(255,255,255,0.4)" }} />}
        </button>
        <button onClick={handleDownload} className="p-1.5 rounded hover:bg-white/5 transition-colors" title="Download HTML">
          <Download size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
        </button>
        <button onClick={handleFullScreen} className="p-1.5 rounded hover:bg-white/5 transition-colors" title="Open Full Screen">
          <Maximize2 size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
        </button>
        {onIterate && (
          <button onClick={onIterate} className="p-1.5 rounded hover:bg-white/5 transition-colors" title="Iterate">
            <RefreshCw size={13} style={{ color: "#FF6B00" }} />
          </button>
        )}
      </div>
      {/* iframe */}
      <div className="flex-1 min-h-0">
        <iframe
          ref={iframeRef}
          srcDoc={code}
          sandbox="allow-scripts allow-forms"
          className="w-full h-full bg-white"
          style={{ border: "none", minHeight: 300 }}
          title="SPARK Preview"
        />
      </div>
    </div>
  );
};

export default SparkPreview;
