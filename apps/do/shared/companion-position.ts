/** Only the companion's position is stored; never page or task contents. */
export const COMPANION_POSITION_KEY = "assembl:do:companion-position:v1";
export type CompanionPosition = { left: number; top: number };

export function readCompanionPosition(
  raw: string | null,
): CompanionPosition | null {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return null;
    const { left, top } = value as Record<string, unknown>;
    return typeof left === "number" &&
      Number.isFinite(left) &&
      typeof top === "number" &&
      Number.isFinite(top)
      ? { left, top }
      : null;
  } catch {
    return null;
  }
}

export function clampCompanionPosition(
  position: CompanionPosition,
  viewport: { width: number; height: number },
  size: { width: number; height: number },
): CompanionPosition {
  return {
    left: Math.max(8, Math.min(viewport.width - size.width - 8, position.left)),
    top: Math.max(8, Math.min(viewport.height - size.height - 8, position.top)),
  };
}
