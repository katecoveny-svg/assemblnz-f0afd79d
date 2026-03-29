import { lazy, Suspense, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NeonDiamond, NeonRefresh, NeonFilm } from "@/components/NeonIcons";

const ThreeDViewer = lazy(() => import("@/components/ThreeDViewer"));

interface CompletedModelCardProps {
  glbUrl: string;
  modelUrls: { glb?: string; obj?: string; fbx?: string };
  prompt?: string;
  color?: string;
  onRefine?: (refinement: string) => void;
}

const CompletedModelCard = ({
  glbUrl,
  modelUrls,
  prompt,
  color = "#B388FF",
  onRefine,
}: CompletedModelCardProps) => {
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineInput, setRefineInput] = useState("");

  return (
    <div
      className="w-full rounded-xl overflow-hidden space-y-3 p-3"
      style={{ background: "#0F0F1C", border: `1px solid ${color}25` }}
    >
      <Suspense
        fallback={
          <div
            className="w-full h-[300px] md:h-[400px] flex items-center justify-center"
            style={{ background: "#0E0E1A" }}
          >
            <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: `${color} transparent ${color} ${color}` }} />
          </div>
        }
      >
        <ThreeDViewer glbUrl={glbUrl} color={color} modelUrls={modelUrls} />
      </Suspense>

      {prompt && (
        <p className="text-xs text-foreground/60 flex items-center gap-1">
          <NeonDiamond size={12} color={color} /> {prompt}
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setRefineOpen(!refineOpen)}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
          style={{ border: `1px solid ${color}`, color }}
        >
          <NeonRefresh size={14} color={color} /> Refine
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              disabled
              className="px-3 py-1.5 rounded-full text-xs font-medium opacity-40 cursor-not-allowed"
              style={{ border: `1px solid ${color}40`, color: `${color}60` }}
            >
              <NeonFilm size={14} color={`${color}60`} /> Generate Video
            </button>
          </TooltipTrigger>
          <TooltipContent>Coming soon</TooltipContent>
        </Tooltip>
      </div>

      {refineOpen && (
        <div className="flex gap-2">
          <input
            value={refineInput}
            onChange={(e) => setRefineInput(e.target.value)}
            placeholder="Describe changes..."
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && refineInput.trim() && onRefine) {
                onRefine(refineInput.trim());
                setRefineInput("");
                setRefineOpen(false);
              }
            }}
          />
          <button
            onClick={() => {
              if (refineInput.trim() && onRefine) {
                onRefine(refineInput.trim());
                setRefineInput("");
                setRefineOpen(false);
              }
            }}
            className="px-3 py-2 rounded-lg text-xs font-medium"
            style={{ backgroundColor: color, color: "#0A0A14" }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default CompletedModelCard;
