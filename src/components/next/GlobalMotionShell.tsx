import { useLocation } from "react-router-dom";
import SmoothScroll from "@/components/next/SmoothScroll";
import MagneticCursor from "@/components/next/MagneticCursor";

/**
 * Site-wide cinematic shell — Lenis smooth scroll + magnetic cursor.
 * Disabled on routes that own their scroll container (chat, embed, admin, dashboard, command).
 */
const DISABLED_PREFIXES = [
  "/chat",
  "/embed",
  "/admin",
  "/dashboard",
  "/command",
  "/voyage/command",
  "/workspace",
];

export default function GlobalMotionShell() {
  const { pathname } = useLocation();
  const disabled = DISABLED_PREFIXES.some((p) => pathname.startsWith(p));
  if (disabled) return null;
  return (
    <>
      <SmoothScroll />
      <MagneticCursor />
    </>
  );
}
