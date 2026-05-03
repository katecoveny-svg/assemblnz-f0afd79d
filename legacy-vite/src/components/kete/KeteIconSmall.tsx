import React from "react";
import KeteIcon from "./KeteIcon";

interface KeteIconSmallProps {
  accentColor: string;
  accentLight: string;
  variant: "standard" | "dense" | "organic" | "tricolor" | "warm";
  name: string;
}

const KeteIconSmall: React.FC<KeteIconSmallProps> = (props) => (
  <div className="w-20 h-20 flex items-center justify-center">
    <KeteIcon {...props} size="small" animated={false} />
  </div>
);

export default KeteIconSmall;
