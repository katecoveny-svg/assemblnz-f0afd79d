import { ImageResponse } from "next/og";

export const alt = "hapai — practical internal tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand-locked hex values.
const MIST = "#F7F3EE";
const POUNAMU_900 = "#0E5546";
const POUNAMU_700 = "#313c42";
const TAUPE_900 = "#313c42";
const TAUPE_700 = "#5C544B";
const TAUPE_600 = "#7C7268";
const TAUPE_500 = "#9A8F84";
const TAUPE_200 = "#D9D2C8";
const KETE_GOLD = "#b8964f";

const TIERS = ["akoranga", "kaimahi", "tohunga", "rangatira", "pou"];
const SESSIONS = ["0", "5", "25", "75", "200+"];

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

export default async function HapaiOpengraphImage() {
  const headlineText = "hapai";
  const bodyText =
    "assembl · practical internal tools. " +
    TIERS.join(" ") +
    " " +
    SESSIONS.join(" ") +
    " assembl.co.nz";

  const [cormorant, inter] = await Promise.all([
    loadGoogleFont("Lato", "900", headlineText),
    loadGoogleFont("Lato", "400;700", bodyText),
  ]);

  // Register the heavy Lato buffer under a distinct family at weight 400 so the
  // OG headline (which renders at the default weight) matches it and prints bold.
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 500; style: "normal" }[] = [];
  if (cormorant) {
    fonts.push({ name: "Lato Display", data: cormorant, weight: 400, style: "normal" });
  }
  if (inter) {
    fonts.push({ name: "Lato", data: inter, weight: 400, style: "normal" });
    fonts.push({ name: "Lato", data: inter, weight: 500, style: "normal" });
  }

  const headlineFont = cormorant ? "Lato Display" : "sans-serif";
  const bodyFont = inter ? "Lato" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: MIST,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          fontFamily: bodyFont,
          color: TAUPE_900,
        }}
      >
        {/* TOP-LEFT WORDMARK */}
        <div
          style={{
            display: "flex",
            fontFamily: bodyFont,
            fontSize: 26,
            letterSpacing: "0.04em",
            color: TAUPE_600,
            fontWeight: 500,
          }}
        >
          assembl&nbsp;·
        </div>

        {/* CENTRE BLOCK */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontFamily: headlineFont,
              fontSize: 200,
              lineHeight: 1,
              color: POUNAMU_900,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              display: "flex",
            }}
          >
            hapai
          </div>

          {/* hairline under headline — pounamu + gold thread */}
          <div
            style={{
              display: "flex",
              marginTop: 14,
              width: 360,
              height: 3,
              background: POUNAMU_900,
            }}
          />
          <div
            style={{
              display: "flex",
              width: 120,
              height: 3,
              background: KETE_GOLD,
              marginTop: -3,
              marginLeft: 18,
            }}
          />

          <div
            style={{
              display: "flex",
              fontFamily: bodyFont,
              fontSize: 32,
              lineHeight: 1.35,
              color: TAUPE_700,
              marginTop: 30,
              maxWidth: 900,
              fontWeight: 400,
            }}
          >
            Mahi that earns its proof.
          </div>
        </div>

        {/* TIER LADDER */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              fontFamily: bodyFont,
              fontSize: 18,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: TAUPE_600,
              fontWeight: 500,
              marginBottom: 14,
            }}
          >
            {TIERS.map((t) => (
              <span key={t} style={{ display: "flex" }}>
                {t}
              </span>
            ))}
          </div>

          {/* tier bar with soft-gold underline */}
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <div style={{ display: "flex", width: "100%", gap: 10 }}>
              {TIERS.map((t, i) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    flex: 1,
                    height: 14,
                    background: i === 0 ? POUNAMU_900 : POUNAMU_700,
                    opacity: i === 0 ? 1 : 0.55 + i * 0.11,
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", width: "100%", gap: 10, marginTop: 4 }}>
              {TIERS.map((t) => (
                <div
                  key={`${t}-gold`}
                  style={{
                    display: "flex",
                    flex: 1,
                    height: 3,
                    background: KETE_GOLD,
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
          </div>

          {/* sessions scale */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              fontFamily: bodyFont,
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: TAUPE_500,
              marginTop: 14,
              fontWeight: 400,
            }}
          >
            {SESSIONS.map((s, i) => (
              <span key={`${s}-${i}`} style={{ display: "flex" }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* BOTTOM-RIGHT URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            fontFamily: bodyFont,
            fontSize: 22,
            letterSpacing: "0.12em",
            color: TAUPE_600,
            fontWeight: 500,
          }}
        >
          assembl.co.nz
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
