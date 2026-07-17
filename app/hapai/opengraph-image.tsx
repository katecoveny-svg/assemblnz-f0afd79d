import { ImageResponse } from "next/og";

export const alt = "assembl SPARK — free tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Pearl canon.
const PAPER = "#ffffff";
const INK = "#313c42";
const MUTED = "#68766f";
const TEAL = "#3f7373";
const GOLD = "#b8964f";

async function loadGoogleFont(
  family: string,
  weights: string,
  text: string,
): Promise<ArrayBuffer | null> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weights}&text=${encodeURIComponent(text)}`;
  try {
    const cssRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!cssRes.ok) return null;
    const readCss = cssRes.text?.bind(cssRes);
    if (!readCss) return null;
    const css = await readCss();
    const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype|woff2?)'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * The generic SPARK library card — inherited by any /hapai tool page that
 * doesn't declare its own per-tool card. On the pearl canon; the retired
 * hapai tier-ladder is gone.
 */
export default async function HapaiOpengraphImage() {
  const headlineText = "Tools for the job in front of you.";
  const bodyText = "assembl · SPARK · free tools · Mahi that earns its proof. assembl.co.nz/hapai";

  const [display, body] = await Promise.all([
    loadGoogleFont("Cormorant Garamond", "500", headlineText),
    loadGoogleFont("Lato", "400;700", bodyText),
  ]);

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 500; style: "normal" }[] = [];
  if (display) fonts.push({ name: "Cormorant Garamond", data: display, weight: 400, style: "normal" });
  if (body) {
    fonts.push({ name: "Lato", data: body, weight: 400, style: "normal" });
    fonts.push({ name: "Lato", data: body, weight: 500, style: "normal" });
  }

  const headlineFont = display ? "Cormorant Garamond" : "serif";
  const bodyFont = body ? "Lato" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: PAPER,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          fontFamily: bodyFont,
          color: INK,
        }}
      >
        {/* TOP — wordmark + SPARK */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 26,
            letterSpacing: "0.04em",
            color: MUTED,
            fontWeight: 500,
          }}
        >
          <span style={{ display: "flex", color: INK, fontWeight: 500 }}>assembl</span>
          <span style={{ display: "flex", color: GOLD }}>·</span>
          <span
            style={{
              display: "flex",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontSize: 20,
              color: TEAL,
            }}
          >
            SPARK · free tools
          </span>
        </div>

        {/* CENTRE — the library line */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div
            style={{
              fontFamily: headlineFont,
              fontSize: 96,
              lineHeight: 1.02,
              color: INK,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              display: "flex",
              maxWidth: 980,
            }}
          >
            Tools for the job in front of you.
          </div>

          {/* hairline — teal + gold thread */}
          <div style={{ display: "flex", marginTop: 26, width: 360, height: 3, background: TEAL }} />
          <div
            style={{
              display: "flex",
              width: 120,
              height: 3,
              background: GOLD,
              marginTop: -3,
              marginLeft: 18,
            }}
          />

          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.35,
              color: MUTED,
              marginTop: 28,
              fontWeight: 400,
            }}
          >
            Mahi that earns its proof.
          </div>
        </div>

        {/* BOTTOM — URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            fontSize: 22,
            letterSpacing: "0.12em",
            color: MUTED,
            fontWeight: 500,
          }}
        >
          assembl.co.nz/hapai
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
