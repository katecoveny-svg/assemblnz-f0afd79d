import { AbsoluteFill, useCurrentFrame, interpolate, Sequence } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneDashboard } from "./scenes/SceneDashboard";
import { SceneCompliance } from "./scenes/SceneCompliance";
import { SceneRisk } from "./scenes/SceneRisk";
import { SceneEvidence } from "./scenes/SceneEvidence";
import { SceneCompile } from "./scenes/SceneCompile";
import { SceneOutro } from "./scenes/SceneOutro";

const GOLD = "#D4A853";
const DARK = "#0A0A0F";

export const MainVideo = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: DARK }}>
      {/* Persistent subtle grid */}
      <AbsoluteFill style={{ opacity: 0.03 }}>
        <div style={{
          width: "100%", height: "100%",
          backgroundImage: `linear-gradient(${GOLD} 1px, transparent 1px), linear-gradient(90deg, ${GOLD} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }} />
      </AbsoluteFill>

      {/* Persistent floating accent orb */}
      <div style={{
        position: "absolute",
        width: 600, height: 600,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${GOLD}15 0%, transparent 70%)`,
        left: interpolate(frame, [0, 750], [-200, 400]),
        top: interpolate(frame, [0, 750], [200, -100]),
        filter: "blur(80px)",
      }} />

      <TransitionSeries>
        {/* Scene 1: Title intro */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <SceneIntro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />

        {/* Scene 2: Dashboard overview */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <SceneDashboard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />

        {/* Scene 3: Compliance */}
        <TransitionSeries.Sequence durationInFrames={110}>
          <SceneCompliance />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />

        {/* Scene 4: Risk matrix */}
        <TransitionSeries.Sequence durationInFrames={110}>
          <SceneRisk />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />

        {/* Scene 5: Evidence pack page */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <SceneEvidence />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />

        {/* Scene 6: Compile animation */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <SceneCompile />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />

        {/* Scene 7: Outro */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <SceneOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
