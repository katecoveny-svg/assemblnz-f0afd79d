import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SmoothScroll from "@/components/next/SmoothScroll";
import MagneticCursor from "@/components/next/MagneticCursor";

/**
 * Site-wide cinematic shell.
 *
 * Lenis smooth-scroll fights long-content pages and re-anchors users to the top
 * during route transitions. We now ENABLE Lenis only on the marketing index
 * (where it adds polish) and disable it everywhere else by default.
 *
 * Always mounts a ScrollToTop that resets scroll on route change so each page
 * opens at the top instead of inheriting the previous scroll position.
 */
const ENABLED_PREFIXES = ["/next"]; // Lenis only on these — keep marketing-only

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Defer to next frame so the new page has mounted
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }, [pathname]);
  return null;
}

export default function GlobalMotionShell() {
  const { pathname } = useLocation();
  const lenisOn = ENABLED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  return (
    <>
      <ScrollToTop />
      {lenisOn && (
        <>
          <SmoothScroll />
          <MagneticCursor />
        </>
      )}
    </>
  );
}
