import RobotIcon from "@/components/RobotIcon";

// Import AI-generated avatars
import auraImg from "@/assets/agents/aura.png";
import apexImg from "@/assets/agents/apex.png";
import prismImg from "@/assets/agents/prism.png";
import helmImg from "@/assets/agents/helm-robot.png";
import marinerImg from "@/assets/agents/mariner.png";
import anchorImg from "@/assets/agents/anchor.png";
import signalImg from "@/assets/agents/signal.png";
import tikaImg from "@/assets/agents/tika.png";
import tourismImg from "@/assets/agents/tourism.png";
import agricultureImg from "@/assets/agents/agriculture.png";
import retailImg from "@/assets/agents/retail.png";
import automotiveImg from "@/assets/agents/automotive.png";
import architectureImg from "@/assets/agents/architecture.png";
import salesImg from "@/assets/agents/sales.png";
import customsImg from "@/assets/agents/nexus-logo.png";
import pmImg from "@/assets/agents/pm.png";
import healthImg from "@/assets/agents/health.png";
import accountingImg from "@/assets/agents/accounting.png";
import educationImg from "@/assets/agents/education.png";
import propertyImg from "@/assets/agents/property.png";
import immigrationImg from "@/assets/agents/immigration.png";
import nonprofitImg from "@/assets/agents/nonprofit.png";
import energyImg from "@/assets/agents/energy.png";
import styleImg from "@/assets/agents/style.png";
import travelImg from "@/assets/agents/travel.png";
import wellbeingImg from "@/assets/agents/wellbeing.png";
import fitnessImg from "@/assets/agents/fitness.png";
import nutritionImg from "@/assets/agents/nutrition.png";
import beautyImg from "@/assets/agents/beauty.png";
import socialImg from "@/assets/agents/social.png";
import govtsectorImg from "@/assets/agents/govtsector.png";
import environmentImg from "@/assets/agents/environment.png";
import welfareImg from "@/assets/agents/welfare.png";
import moeImg from "@/assets/agents/moe.png";
import publichealthImg from "@/assets/agents/publichealth.png";
import housingImg from "@/assets/agents/housing.png";
import emergencyImg from "@/assets/agents/emergency.png";
import hrImg from "@/assets/agents/hr.png";
import vaultImg from "@/assets/agents/vault.png";
import shieldImg from "@/assets/agents/shield.png";
import mintImg from "@/assets/agents/mint.png";
import echoImg from "@/assets/agents/echo.png";
import sparkImg from "@/assets/agents/spark.png";

const AVATAR_MAP: Record<string, string> = {
  hospitality: auraImg,
  construction: apexImg,
  marketing: prismImg,
  operations: helmImg,
  maritime: marinerImg,
  legal: anchorImg,
  it: signalImg,
  tiriti: tikaImg,
  tourism: tourismImg,
  agriculture: agricultureImg,
  retail: retailImg,
  automotive: automotiveImg,
  architecture: architectureImg,
  sales: salesImg,
  customs: customsImg,
  pm: pmImg,
  health: healthImg,
  accounting: accountingImg,
  education: educationImg,
  property: propertyImg,
  immigration: immigrationImg,
  nonprofit: nonprofitImg,
  energy: energyImg,
  style: styleImg,
  travel: travelImg,
  wellbeing: wellbeingImg,
  fitness: fitnessImg,
  nutrition: nutritionImg,
  beauty: beautyImg,
  social: socialImg,
  govtsector: govtsectorImg,
  environment: environmentImg,
  welfare: welfareImg,
  moe: moeImg,
  publichealth: publichealthImg,
  housing: housingImg,
  emergency: emergencyImg,
  hr: hrImg,
  finance: vaultImg,
  insurance: shieldImg,
  banking: mintImg,
  echo: echoImg,
  spark: sparkImg,
};

interface AgentAvatarProps {
  agentId: string;
  color: string;
  size?: number;
  showGlow?: boolean;
  eager?: boolean;
}

const AgentAvatar = ({ agentId, color, size = 40, showGlow = true, eager = false }: AgentAvatarProps) => {
  const avatarSrc = AVATAR_MAP[agentId];

  if (avatarSrc) {
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {showGlow && (
          <div
            className="absolute inset-[-4px] rounded-full blur-lg opacity-50"
            style={{ background: color }}
          />
        )}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            width: size,
            height: size,
            border: `2px solid ${color}50`,
            boxShadow: `0 0 16px ${color}40, 0 0 32px ${color}20`,
            background: 'hsl(var(--card))',
          }}
        >
          <img
            src={avatarSrc}
            alt=""
            className="w-full h-full object-cover"
            style={{
              filter: `drop-shadow(0 0 8px ${color}80) brightness(1.1) contrast(1.05)`,
            }}
            loading={eager ? "eager" : "lazy"}
            {...(eager ? { fetchPriority: "high" as const } : {})}
          />
        </div>
      </div>
    );
  }

  return <RobotIcon color={color} size={size} agentId={agentId} />;
};

export default AgentAvatar;
