import { Progress } from "@/components/ui/progress";
import { NeonDiamond, NeonTimer } from "@/components/NeonIcons";

interface ModelGenerationCardProps {
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  progress: number;
  prompt?: string;
  color?: string;
}

const ModelGenerationCard = ({ status, progress, prompt, color = "#3A6A9C" }: ModelGenerationCardProps) => {
  const statusText =
    status === "PENDING"
      ? "Queuing your model..."
      : status === "IN_PROGRESS"
      ? "ARC is building your model..."
      : status === "FAILED"
      ? "Generation failed"
      : "Complete!";

  const estimatedSeconds = Math.max(0, Math.round(((100 - progress) / 100) * 60));

  return (
    <div
      className="w-full rounded-xl p-4 space-y-3"
      style={{
        background: "#0F0F1C",
        border: `1px solid ${color}25`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color }}>
          <NeonDiamond size={14} color={color} />
        </span>
        <span className="text-sm font-medium text-foreground">{statusText}</span>
      </div>

      {status !== "FAILED" && (
        <div className="space-y-1">
          <Progress
            value={progress}
            className="h-2 bg-muted"
            style={
              {
                "--progress-color": `linear-gradient(90deg, ${color}, #FF8C42)`,
              } as React.CSSProperties
            }
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{progress}%</span>
            {status !== "SUCCEEDED" && <span className="flex items-center gap-1"><NeonTimer size={10} color="hsl(var(--muted-foreground))" /> ~{estimatedSeconds}s remaining</span>}
          </div>
        </div>
      )}

      {prompt && (
        <p
          className="text-xs font-mono leading-relaxed"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Prompt: "{prompt}"
        </p>
      )}

      {status === "FAILED" && (
        <p className="text-xs text-destructive">
          Model generation failed. Try simplifying your description or trying again.
        </p>
      )}
    </div>
  );
};

export default ModelGenerationCard;
