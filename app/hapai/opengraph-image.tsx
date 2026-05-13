import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "HAPAI — the AI adoption framework for NZ teams";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F3EE",
          padding: "72px 80px",
        }}
      >
        {/* TOP — wordmark + section label */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#605548",
            fontSize: "26px",
            letterSpacing: "0.02em",
          }}
        >
          <span>assembl ·</span>
          <span
            style={{
              fontSize: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#9D8C7D",
            }}
          >
            adoption framework
          </span>
        </div>

        {/* HEADLINE BLOCK */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "-40px",
          }}
        >
          <div
            style={{
              fontFamily: "serif",
              fontSize: "260px",
              fontWeight: 400,
              color: "#0E5546",
              lineHeight: 0.86,
              letterSpacing: "-0.025em",
            }}
          >
            HAPAI
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#605548",
              lineHeight: 1.25,
              maxWidth: "920px",
              marginTop: "8px",
            }}
          >
            the AI adoption framework for NZ teams.
          </div>
        </div>

        {/* TIER LADDER */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "17px",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "#605548",
              marginBottom: "12px",
            }}
          >
            <span>akoranga</span>
            <span>kaimahi</span>
            <span>tohunga</span>
            <span>rangatira</span>
            <span>pou</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1, height: "10px", background: "#0E5546", borderRadius: "2px" }} />
            <div style={{ flex: 1, height: "10px", background: "#0E5546", borderRadius: "2px" }} />
            <div style={{ flex: 1, height: "10px", background: "#0E5546", borderRadius: "2px" }} />
            <div style={{ flex: 1, height: "10px", background: "#0E5546", borderRadius: "2px" }} />
            <div style={{ flex: 1, height: "10px", background: "#0E5546", borderRadius: "2px" }} />
          </div>
          <div style={{ height: "3px", background: "#D9BC7A", marginTop: "6px" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "15px",
              letterSpacing: "0.08em",
              color: "#9D8C7D",
              marginTop: "12px",
            }}
          >
            <span>0</span>
            <span>5</span>
            <span>25</span>
            <span>75</span>
            <span>200+ sessions / person / month</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
