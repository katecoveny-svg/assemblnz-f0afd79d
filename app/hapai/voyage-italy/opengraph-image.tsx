import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Voyage Travel Desk by assembl for Kate and Adrian in Italy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FAF7F2",
          color: "#23211F",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 78% 18%, rgba(217,168,90,0.34), transparent 28%), radial-gradient(circle at 18% 80%, rgba(43,107,87,0.18), transparent 30%)",
          }}
        />
        <div style={{ position: "absolute", left: 76, top: 58, fontSize: 34, color: "#103F35" }}>assembl</div>
        <div style={{ position: "absolute", left: 76, top: 118, fontSize: 18, letterSpacing: "0.24em", color: "#2B6B57", textTransform: "uppercase" }}>
          HAPAI · Voyage Travel Desk
        </div>
        <div style={{ position: "absolute", left: 76, top: 178, width: 620, fontSize: 72, lineHeight: 0.94, fontStyle: "italic", color: "#103F35" }}>
          Kate & Adrian, Italy in one calm place.
        </div>
        <div style={{ position: "absolute", left: 80, bottom: 70, display: "flex", gap: 14, fontSize: 24, color: "#3D4250" }}>
          <span>Milan</span>
          <span>→</span>
          <span>Garda</span>
          <span>→</span>
          <span>Florence</span>
          <span>→</span>
          <span>Rome</span>
          <span>→</span>
          <span>Praiano</span>
        </div>
        <div
          style={{
            position: "absolute",
            right: 80,
            top: 92,
            width: 360,
            height: 440,
            borderRadius: 10,
            border: "1px solid rgba(35,33,31,0.12)",
            background: "rgba(255,255,255,0.62)",
            boxShadow: "0 34px 90px rgba(35,33,31,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: 250, height: 290 }}>
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                key={item}
                style={{
                  position: "absolute",
                  left: 26 + item * 10,
                  top: 136 - item * 31,
                  width: 196,
                  height: 58,
                  borderRadius: 40,
                  border: "1px solid rgba(43,107,87,0.28)",
                  background: `rgba(${item % 2 ? "217,168,90" : "43,107,87"},${0.18 + item * 0.045})`,
                  transform: `rotate(${item % 2 ? -5 : 5}deg)`,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                left: 84,
                top: 4,
                width: 90,
                height: 170,
                borderRadius: "70% 50% 55% 45%",
                background: "#E8DDD0",
                transform: "rotate(74deg)",
                boxShadow: "0 18px 36px rgba(35,33,31,0.15)",
              }}
            />
            <div style={{ position: "absolute", left: 44, bottom: 0, width: 210, height: 62, borderRadius: "0 0 90px 90px", border: "2px solid rgba(217,168,90,0.68)" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
