import type { Metadata } from "next";
import Link from "next/link";
import { PilotCta } from "@/components/creative/PilotCta";

export const metadata: Metadata = {
  title: "AUAHA — a creative studio in a chat",
  description:
    "Prism art-directs and generates imagery, Muse writes, Flux films, Verse voices. Real AI generation, on-brand, made in Aotearoa.",
};

const PAPER = "#FBFAF6";
const INK = "#1A1918";
const GREY = "#5A5850";
const GOLD = "#BFA37A";
const GOLD_DEEP = "#A88A5E";
const SAND = "#EFEADC";
const CLOUD = "#FFFFFF";
const serif = "var(--font-display), 'Cormorant Garamond', Georgia, serif";
const mono = "var(--font-mono), 'Space Mono', ui-monospace, monospace";

const ANCHOR = "/generated/creative-agency/anchors";

const CARDS = [
  { name: "Prism", role: "Art direction", copy: "A brief in, four on-brand variations out. Iterate by talking — 'more editorial', 'darker', 'add fog'." },
  { name: "Muse", role: "Copy & campaigns", copy: "Headlines, social, email, scripts — written like an elite human copywriter, in your brand's voice." },
  { name: "Flux", role: "Cinematic video", copy: "A fifteen-second brand film from a single scene. Real generation, 720p, plays inline." },
  { name: "Verse", role: "Podcast & voice", copy: "A scripted, voiced segment in a warm NZ presenter voice. Written and recorded for you." },
];

const MUSE_SAMPLE = `“Your perfect winter cuppa is here.”\n“Warm up with our new winter single origin.”\n“Beat the Wellington chill, one sip at a time.”\n\n#WellingtonCoffee #SpecialtyCoffeeNZ #WinterBrew`;

export default function CreativeAgencyLanding() {
  return (
    <main style={{ background: PAPER, color: INK, minHeight: "100vh" }}>
      {/* hero */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "64px 26px 34px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,0.85fr)", gap: 40, alignItems: "center" }} className="ca-hero">
          <div>
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD_DEEP }}>
              assembl · the AUAHA creative kete
            </p>
            <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: "clamp(2.6rem, 6vw, 4.4rem)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: "14px 0 0" }}>
              a creative studio<br />in a chat<span style={{ color: GOLD }}>.</span>
            </h1>
            <p style={{ fontSize: 16.5, color: GREY, lineHeight: 1.6, maxWidth: 520, marginTop: 18 }}>
              Describe what you need once. The image, the words, the film, the voice — they arrive together, on-brand,
              ready for you to say yes. Everything on this page was generated for real.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
              <Link href="/customers/creative-agency/ops"
                style={{ padding: "12px 24px", borderRadius: 999, background: INK, color: PAPER, fontSize: 14.5, fontWeight: 600, textDecoration: "none" }}>
                Open the workspace →
              </Link>
              <a href="#pilot"
                style={{ padding: "12px 24px", borderRadius: 999, border: `1px solid ${SAND}`, color: INK, fontSize: 14.5, fontWeight: 600, textDecoration: "none", background: CLOUD }}>
                Book a pilot
              </a>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ANCHOR}/prism-skincare.png`} alt="A Prism-generated editorial product still"
            style={{ width: "100%", borderRadius: 18, border: `1px solid ${SAND}`, boxShadow: "0 12px 40px rgba(26,25,24,0.10)" }} />
        </div>
      </section>

      {/* four cards */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 26px 10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
          {CARDS.map((c) => (
            <div key={c.name} style={{ border: `1px solid ${SAND}`, background: CLOUD, borderRadius: 16, padding: "18px 18px 20px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <h3 style={{ fontFamily: serif, fontWeight: 600, fontSize: 24, margin: 0 }}>{c.name}</h3>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: GOLD }} />
              </div>
              <p style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD_DEEP, margin: "2px 0 8px" }}>{c.role}</p>
              <p style={{ fontSize: 13.5, color: GREY, lineHeight: 1.55, margin: 0 }}>{c.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* live gallery — 6 real samples */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "34px 26px 20px" }}>
        <h2 style={{ fontFamily: serif, fontWeight: 500, fontSize: 30, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
          made by the kete<span style={{ color: GOLD }}>.</span>
        </h2>
        <p style={{ fontSize: 13.5, color: GREY, marginBottom: 18 }}>
          Six samples — every one generated, not stock. Imagen 4.0 for stills, Veo 3.1 for film, ElevenLabs for voice, Gemini for words.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          <Sample img={`${ANCHOR}/prism-vessel.png`} agent="Prism" note="Editorial still · Imagen 4.0" />
          <Sample img={`${ANCHOR}/prism-cafe.png`} agent="Prism" note="Café campaign · Imagen 4.0" />
          <Sample img={`${ANCHOR}/prism-portrait.png`} agent="Prism" note="Founder portrait · Imagen 4.0" />
          <VideoSample src={`${ANCHOR}/flux-studio.mp4`} agent="Flux" note="Studio film · Veo 3.1" />
          <AudioSample src={`${ANCHOR}/verse-podcast.mp3`} agent="Verse" note="The Assembling · ElevenLabs" />
          <TextSample text={MUSE_SAMPLE} agent="Muse" note="Winter single-origin · Gemini" />
        </div>
      </section>

      {/* pilot */}
      <section id="pilot" style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 26px 72px" }}>
        <div style={{ border: `1px solid ${SAND}`, background: CLOUD, borderRadius: 18, padding: "30px 28px" }}>
          <h2 style={{ fontFamily: serif, fontWeight: 500, fontSize: 30, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
            book a pilot<span style={{ color: GOLD }}>.</span>
          </h2>
          <p style={{ fontSize: 14.5, color: GREY, marginBottom: 20, maxWidth: 560 }}>
            Want the kete pointed at your brand? Tell us what you'd make first. It lands in the queue — nothing is sent automatically.
          </p>
          <PilotCta />
        </div>
        <p style={{ fontFamily: mono, fontSize: 11, color: GREY, textAlign: "center", marginTop: 34 }}>
          made in Aotearoa · draft-only demo · a person approves before anything is published
        </p>
      </section>

      <style>{`@media (max-width: 820px){ .ca-hero{ grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}

function Sample({ img, agent, note }: { img: string; agent: string; note: string }) {
  return (
    <figure style={{ margin: 0, border: `1px solid ${SAND}`, borderRadius: 14, overflow: "hidden", background: CLOUD }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt={note} style={{ width: "100%", display: "block", aspectRatio: "1/1", objectFit: "cover" }} />
      <Cap agent={agent} note={note} />
    </figure>
  );
}
function VideoSample({ src, agent, note }: { src: string; agent: string; note: string }) {
  return (
    <figure style={{ margin: 0, border: `1px solid ${SAND}`, borderRadius: 14, overflow: "hidden", background: CLOUD }}>
      <video src={src} controls playsInline muted loop style={{ width: "100%", display: "block", aspectRatio: "1/1", objectFit: "cover", background: "#000" }} />
      <Cap agent={agent} note={note} />
    </figure>
  );
}
function AudioSample({ src, agent, note }: { src: string; agent: string; note: string }) {
  return (
    <figure style={{ margin: 0, border: `1px solid ${SAND}`, borderRadius: 14, overflow: "hidden", background: CLOUD, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, background: "linear-gradient(135deg,#F3ECD9,#E9DFC6)", display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1/1" }}>
        <span style={{ fontFamily: serif, fontSize: 44, color: GOLD_DEEP }}>♪</span>
      </div>
      <div style={{ padding: "0 10px" }}><audio src={src} controls style={{ width: "100%" }} /></div>
      <Cap agent={agent} note={note} />
    </figure>
  );
}
function TextSample({ text, agent, note }: { text: string; agent: string; note: string }) {
  return (
    <figure style={{ margin: 0, border: `1px solid ${SAND}`, borderRadius: 14, overflow: "hidden", background: CLOUD, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "16px 16px", aspectRatio: "1/1", overflow: "hidden", fontSize: 14.5, lineHeight: 1.5, fontFamily: serif, color: INK, whiteSpace: "pre-wrap" }}>
        {text}
      </div>
      <Cap agent={agent} note={note} />
    </figure>
  );
}
function Cap({ agent, note }: { agent: string; note: string }) {
  return (
    <figcaption style={{ padding: "9px 12px", borderTop: `1px solid ${SAND}` }}>
      <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 15 }}>{agent}</span>
      <span style={{ fontFamily: mono, fontSize: 10, color: GOLD_DEEP, display: "block", marginTop: 1 }}>◆ {note} · original generation</span>
    </figcaption>
  );
}
