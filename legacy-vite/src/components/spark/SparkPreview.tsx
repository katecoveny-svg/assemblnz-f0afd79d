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
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [code]);

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-pounamu-light/15" style={{ background: "rgba(0,0,0,0.3)" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/10" style={{ background: "rgba(0,0,0,0.2)" }}>
        <span className="text-[10px] font-mono text-pounamu-light/60">
          Live Preview
        </span>
        <div className="flex-1" />
        <button onClick={handleCopy} className="p-1.5 rounded hover:bg-white/5 transition-colors" title="Copy Code">
          {copied ? <Check size={13} className="text-pounamu-light" /> : <Copy size={13} className="text-muted-foreground/40" />}
        </button>
        <button onClick={handleDownload} className="p-1.5 rounded hover:bg-white/5 transition-colors" title="Download HTML">
          <Download size={13} className="text-muted-foreground/40" />
        </button>
        <button onClick={handleFullScreen} className="p-1.5 rounded hover:bg-white/5 transition-colors" title="Open Full Screen">
          <Maximize2 size={13} className="text-muted-foreground/40" />
        </button>
        {onIterate && (
          <button onClick={onIterate} className="p-1.5 rounded hover:bg-white/5 transition-colors" title="Iterate">
            <RefreshCw size={13} className="text-pounamu-light" />
          </button>
        )}
        {onDeploy && (
          <button onClick={onDeploy} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all hover:scale-[0.97] bg-pounamu-light text-background" title="Deploy Live">
            Deploy
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
