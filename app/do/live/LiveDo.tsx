"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import TravelWorkspace from "./TravelWorkspace";
import { DoMark } from "../DoAppearance";
import DoMemory from "./DoMemory";
import type {
  DoConversation,
  DoLiveAgent,
} from "@/apps/do/shared/live-conversation";
import "./live-do.css";
function SourceText({ text }: { text: string }) {
  return (
    <p>
      {text
        .split(/(\[[^\]\n]{1,200}\]\(https:\/\/[^\s)]+\))/g)
        .map((part, i) => {
          const m = part.match(/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/);
          if (!m) return part;
          try {
            const u = new URL(m[2]);
            if (u.username || u.password) return part;
            return (
              <a
                key={i}
                href={u.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {m[1]}
              </a>
            );
          } catch {
            return part;
          }
        })}
    </p>
  );
}
type Snapshot = {
  state: DoConversation;
  voice: string;
  voiceFinalized: boolean;
  error?: string;
};
const agents: [DoLiveAgent, string, string][] = [
  ["assistant", "Everyday DO", "Plans, questions and the next step"],
  ["research", "Research", "Find information with sources"],
  ["writing", "Writing", "Prepare a reply or a draft"],
  ["grammar", "Grammar", "Keep your meaning. Polish the words."],
  ["study", "Study buddy", "Learn with hints and examples"],
  ["newsletter", "School admin", "Turn a newsletter into a useful list"],
  ["travel", "Travel DO", "Research, shape and save a trip"],
];
export default function LiveDo({
  initialAgent = "assistant",
  initialInput = "",
  initialName = "DO",
  initialWebSearch = true,
  embedded = false,
}: {
  embedded?: boolean;
  initialAgent?: DoLiveAgent;
  initialInput?: string;
  initialName?: string;
  initialWebSearch?: boolean;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [agent, setAgent] = useState<DoLiveAgent>(initialAgent);
  const [webSearch, setWebSearch] = useState(initialWebSearch);
  const [name, setName] = useState(initialName);
  const [input, setInput] = useState(initialInput);
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);
  const [correction, setCorrection] = useState(false);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [microphoneId, setMicrophoneId] = useState("");
  const [activeMicrophone, setActiveMicrophone] = useState("");
  async function listMicrophones() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === "audioinput");
      setMicrophones(inputs);
      if (!inputs.some((d) => d.deviceId && d.label))
        setNotice(
          "Chrome has not exposed named microphones yet. Allow microphone access for this site, then choose Show microphones again.",
        );
    } catch {
      setNotice(
        "Microphone list unavailable. Check this site’s microphone permission.",
      );
    }
  }
  const [audioStatus, setAudioStatus] = useState("Voice is off");
  const [speakerStatus, setSpeakerStatus] = useState("Sample not played");
  const [orb, setOrb] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );
  const token = useRef("");
  const peer = useRef<RTCPeerConnection | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const generation = useRef(0);
  const request = useCallback(
    async (action: string, body: Record<string, unknown> = {}) => {
      const r = await fetch("/api/do/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          token: token.current || undefined,
          ...body,
        }),
      });
      const data = await r.json();
      if (!r.ok)
        throw new Error(data.message || "DO could not complete that request.");
      return data;
    },
    [],
  );
  const cleanupAudio = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    peer.current?.close();
    peer.current = null;
    if (audio.current) {
      audio.current.pause();
      audio.current.srcObject = null;
    }
    setMuted(false);
    setActiveMicrophone("");
    setAudioStatus("Voice is off");
  }, []);
  useEffect(() => {
    let alive = true;
    const sessionGeneration = generation;
    const timer = setInterval(() => {
      if (token.current)
        void request("poll")
          .then((data) => {
            if (alive) {
              setSnapshot(data);
              if (["closed", "error"].includes(data.voice)) cleanupAudio();
            }
          })
          .catch((e) => {
            if (alive) setNotice(e.message);
          });
    }, 1000);
    return () => {
      alive = false;
      clearInterval(timer);
      sessionGeneration.current++;
      stream.current?.getTracks().forEach((t) => t.stop());
      peer.current?.close();
      if (token.current)
        void fetch("/api/do/live", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "close", token: token.current }),
          keepalive: true,
        }).catch(() => {});
    };
  }, [request, cleanupAudio]);
  async function open() {
    if (!consent) return;
    setBusy(true);
    setNotice("");
    try {
      const data = await request("create", { agent, consent, webSearch });
      token.current = data.token;
      setSnapshot(await request("poll"));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not open DO.");
    } finally {
      setBusy(false);
    }
  }
  async function sendText() {
    if (!input.trim() || !token.current) return;
    setBusy(true);
    setNotice("");
    try {
      setSnapshot(await request("text", { text: input, correction }));
      setInput("");
      setCorrection(false);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not send to DO.");
    } finally {
      setBusy(false);
    }
  }
  async function choose(id: DoLiveAgent) {
    setAgent(id);
    if (token.current)
      try {
        setSnapshot(await request("agent", { agent: id }));
      } catch (e) {
        setNotice(e instanceof Error ? e.message : "Could not change skill.");
      }
  }
  async function voice() {
    if (!token.current || peer.current) return;
    setBusy(true);
    setNotice("");
    setAudioStatus("Waiting for microphone permission");
    const attempt = ++generation.current;
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...(microphoneId ? { deviceId: { exact: microphoneId } } : {}),
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (attempt !== generation.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      setActiveMicrophone(
        media.getAudioTracks()[0]?.label || "Browser default microphone",
      );
      void listMicrophones();
      const pc = new RTCPeerConnection();
      peer.current = pc;
      pc.ontrack = (e) => {
        if (attempt !== generation.current) return;
        if (audio.current) {
          audio.current.srcObject = e.streams[0] || new MediaStream([e.track]);
          setAudioStatus("Audio connected · say hello to DO");
          void audio.current.play().catch(() => {
            setAudioStatus("Playback needs your click");
            setNotice("Tap Play voice to allow audio playback.");
          });
        }
      };
      pc.onconnectionstatechange = () => {
        if (attempt !== generation.current) return;
        if (pc.connectionState === "failed") {
          setNotice("Voice connection failed. Try again.");
          cleanupAudio();
          void request("stop_voice").catch(() => {});
        }
      };
      media.getTracks().forEach((t) => pc.addTrack(t, media));
      const events = pc.createDataChannel("oai-events");
      events.onmessage = (e) => {
        if (attempt !== generation.current) return;
        try {
          const message = JSON.parse(e.data);
          if (message.type === "session.started")
            setAudioStatus("Voice ready · say hello to DO");
          if (message.type === "error")
            setNotice(
              "The voice service reported an error. End voice and try again.",
            );
          if (message.type === "session.closed") cleanupAudio();
        } catch {
          /* Non-JSON events are ignored. */
        }
      };
      await pc.setLocalDescription(await pc.createOffer());
      if (pc.iceGatheringState !== "complete")
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => {
            pc.removeEventListener("icegatheringstatechange", check);
            reject(new Error("Could not establish the audio connection."));
          }, 8000);
          function check() {
            if (pc.iceGatheringState === "complete") {
              clearTimeout(timer);
              pc.removeEventListener("icegatheringstatechange", check);
              resolve();
            }
          }
          pc.addEventListener("icegatheringstatechange", check);
          check();
        });
      if (attempt !== generation.current) return;
      setAudioStatus("Connecting voice");
      const result = await request("voice", {
        sdp: pc.localDescription?.sdp,
        consent: true,
      });
      if (attempt !== generation.current) {
        await request("stop_voice");
        return;
      }
      await pc.setRemoteDescription({ type: "answer", sdp: result.sdp });
      setSnapshot(await request("poll"));
    } catch (e) {
      cleanupAudio();
      void request("stop_voice").catch(() => {});
      setNotice(
        e instanceof Error ? e.message : "Microphone access was not available.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function stopVoice() {
    generation.current++;
    cleanupAudio();
    try {
      setSnapshot(await request("stop_voice"));
    } catch {
      setNotice(
        "Audio stopped on this device. The server did not confirm voice closure.",
      );
    }
  }
  async function close() {
    generation.current++;
    try {
      await request("close");
    } finally {
      cleanupAudio();
      token.current = "";
      setSnapshot(null);
    }
  }
  const activeVoice =
    snapshot && ["connecting", "live", "closing"].includes(snapshot.voice);
  const Container = "section";
  return (
    <Container
      aria-label="DO connected conversation"
      className={`do-live${snapshot ? " is-open" : ""}${embedded ? " do-live-embedded" : ""}`}
    >
      <audio ref={audio} autoPlay playsInline />
      <header>
        <Link href="/do">assembl / DO</Link>
        <span>Personal connected preview · this Mac</span>
        <Link href="/do">Back to DO ↗</Link>
      </header>
      <section className="do-live-intro">
        <span className="do-live-eyebrow">DO / YOUR CONVERSATION</span>
        <h1 aria-label="assembl your DO">
          assembl
          <br /> your <span className="do-approved-heading">DO</span>
        </h1>
        <p>
          Talk or type to research a question, prepare a reply or organise your
          notes.
        </p>
      </section>
      <details className="do-voice-test">
        <summary>Can’t hear DO? Test your speakers</summary>
        <p>
          This is a recorded AI voice sample, not a live conversation. Playing
          it does not use your microphone. The New Zealand accent still needs
          your review.
        </p>
        <audio
          aria-label="DO speaker test"
          controls
          preload="none"
          src="/do/voice/nz-voice-candidate.wav"
          onPlaying={() =>
            setSpeakerStatus(
              "Browser playback started · confirm you can hear it",
            )
          }
          onEnded={() =>
            setSpeakerStatus(
              "Sample playback finished · accent and audibility need your listening check",
            )
          }
          onError={() => setSpeakerStatus("Sample could not load or play")}
        />
        <p role="status">{speakerStatus}</p>
        <p>
          For live conversation, tick the permission box, choose Open DO, then
          Start voice and allow the microphone. Say hello once audio connects.
        </p>
      </details>
      <div className="do-audio-devices">
        <label htmlFor="do-microphone">Microphone</label>
        <select
          id="do-microphone"
          value={microphoneId}
          disabled={busy || !!activeVoice}
          onChange={(e) => setMicrophoneId(e.target.value)}
        >
          <option value="">Browser default</option>
          {microphones
            .filter((d) => d.deviceId && d.deviceId !== "default")
            .map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Microphone ${i + 1}`}
              </option>
            ))}
        </select>
        <button type="button" onClick={() => void listMicrophones()}>
          Show microphones
        </button>
        <small>
          {activeMicrophone
            ? `Using: ${activeMicrophone}`
            : "Choose a microphone before starting voice. Device names may require microphone permission."}
        </small>
        <small>
          Sound plays through your browser’s output. On Mac, check System
          Settings → Sound → Output.
        </small>
      </div>
      <DoMemory
        onUse={(text) => {
          const next = `${input}${input ? "\n\n" : ""}${text}`;
          if (!snapshot || next.length > 12000) return false;
          setInput(next);
          setNotice(
            "Saved context added to your message draft. Review before sending.",
          );
          return true;
        }}
      />
      <div className="do-live-grid">
        <aside>
          <label htmlFor="do-name">Name your DO</label>
          <input
            id="do-name"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="do-live-label">CHOOSE WHAT YOU NEED</p>
          {agents.map(([id, label, description]) => (
            <button
              className="do-live-skill"
              key={id}
              aria-pressed={agent === id}
              onClick={() => void choose(id)}
            >
              <span>
                <DoMark />
              </span>
              <span>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
            </button>
          ))}
          <p className="do-live-note">
            Gmail, Mac app control, booking and background monitoring are not
            connected in this preview. You can bring text here for DO to work
            with.
          </p>
        </aside>
        <section className="do-live-room" aria-label="DO conversation">
          <div className="do-live-room-head">
            <div>
              <span className="do-mini-spark" aria-hidden>
                <DoMark />
              </span>
              <strong>{name || "DO"}</strong>
            </div>
            <span>
              {snapshot
                ? activeVoice
                  ? audioStatus
                  : "Ready for your words"
                : "Ready when you are"}
            </span>
          </div>
          {!snapshot ? (
            <div className="do-live-welcome">
              <h2>What would you like to work on?</h2>
              <p>
                Try a reply, a school newsletter, a tricky paragraph or
                something you need to research.
              </p>
              <label>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                Use my conversation with OpenAI and DO’s preparation providers.
                Voice starts only when I choose it.
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={webSearch}
                  onChange={(e) => setWebSearch(e.target.checked)}
                />
                Allow public web search for this conversation, across all
                selected skills. Search uses public terms; review source links.
              </label>
              <button disabled={!consent || busy} onClick={() => void open()}>
                Open DO ↗
              </button>
              <small>
                This local preview uses your configured API account.
                Conversations stay in server memory for up to 30 minutes. Voice
                stops after five minutes.
              </small>
            </div>
          ) : (
            <>
              <div className="do-live-transcript" aria-label="Conversation">
                {snapshot.state.turns.length === 0 ? (
                  <p className="do-live-empty">
                    Start with what you need done.
                  </p>
                ) : (
                  snapshot.state.turns.map((turn) => (
                    <article
                      key={turn.id}
                      className={`do-live-turn ${turn.role}`}
                    >
                      <span>{turn.role === "user" ? "You" : name}</span>
                      <SourceText text={turn.text} />
                    </article>
                  ))
                )}
              </div>
              <div className="do-live-tasks">
                {Object.values(snapshot.state.tasks)
                  .slice(-4)
                  .map((task) => (
                    <div key={task.id}>
                      <span>
                        {task.agent} ·{" "}
                        {task.status === "completed"
                          ? "Draft ready"
                          : task.status}
                      </span>
                      {task.status === "running" && (
                        <button
                          onClick={() =>
                            void request("cancel", { taskId: task.id })
                              .then(setSnapshot)
                              .catch((e) => setNotice(e.message))
                          }
                        >
                          Cancel task
                        </button>
                      )}
                      {task.status === "completed" && task.output && (
                        <button
                          onClick={() =>
                            void navigator.clipboard
                              .writeText(task.output!)
                              .then(() =>
                                setNotice(
                                  "Draft copied. Review it before sending.",
                                ),
                              )
                              .catch(() =>
                                setNotice(
                                  "Copy was unavailable. Select the text to copy it.",
                                ),
                              )
                          }
                        >
                          Copy draft
                        </button>
                      )}
                    </div>
                  ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendText();
                }}
              >
                <label htmlFor="do-live-input">Tell DO what you need</label>
                <textarea
                  id="do-live-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={12000}
                  rows={3}
                  placeholder="Paste your message or ask a question…"
                />
                <label className="do-live-correction">
                  <input
                    type="checkbox"
                    checked={correction}
                    onChange={(e) => setCorrection(e.target.checked)}
                  />
                  This corrects the running task
                </label>
                <div className="do-live-actions">
                  <button type="submit" disabled={busy || !input.trim()}>
                    Give it to DO ↗
                  </button>
                  {activeVoice ? (
                    <button type="button" onClick={() => void stopVoice()}>
                      End voice
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void voice()}
                    >
                      Start voice
                    </button>
                  )}
                  {activeVoice && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          stream.current
                            ?.getAudioTracks()
                            .forEach((t) => (t.enabled = muted));
                          setMuted(!muted);
                        }}
                      >
                        {muted ? "Unmute mic" : "Mute mic"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void request("interrupt").catch((e) =>
                            setNotice(e.message),
                          )
                        }
                      >
                        Interrupt speech
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!audio.current?.srcObject) {
                            setNotice(
                              "Audio has not connected yet. End voice and try Start voice again.",
                            );
                            return;
                          }
                          void audio.current
                            .play()
                            .then(() =>
                              setNotice("Playback enabled. Say hello to DO."),
                            )
                            .catch(() =>
                              setNotice(
                                "Playback was blocked. Check this tab’s sound permission and your output volume.",
                              ),
                            );
                        }}
                      >
                        Play voice
                      </button>
                    </>
                  )}
                </div>
              </form>
              <div className="do-live-bottom">
                <small>
                  Prepared work stays a draft. Nothing is sent or booked.
                </small>
                <button onClick={() => void close()}>Close conversation</button>
              </div>
            </>
          )}
          {(notice || snapshot?.error) && (
            <p role="status" className="do-live-status">
              {notice || snapshot?.error}
            </p>
          )}
        </section>
      </div>
      {
        <TravelWorkspace
          hidden={agent !== "travel"}
          draft={
            Object.values(snapshot?.state.tasks || {})
              .filter((t) => t.agent === "travel" && t.status === "completed")
              .at(-1)?.output
          }
          onRevise={(text) => {
            setInput(text);
            setCorrection(false);
            setNotice(
              "Trip added to your message. Review it, then click Give it to DO.",
            );
            document.getElementById("do-live-input")?.focus();
          }}
        />
      }
      <button
        className="do-live-orb"
        aria-label="Drag your DO symbol"
        style={{ transform: `translate(${orb.x}px,${orb.y}px)` }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, ox: orb.x, oy: orb.y };
        }}
        onPointerMove={(e) => {
          if (drag.current)
            setOrb({
              x: Math.max(
                -window.innerWidth + 100,
                Math.min(0, drag.current.ox + e.clientX - drag.current.x),
              ),
              y: Math.max(
                -window.innerHeight + 100,
                Math.min(0, drag.current.oy + e.clientY - drag.current.y),
              ),
            });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onKeyDown={(e) => {
          if (e.key === "Home") setOrb({ x: 0, y: 0 });
          if (
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
          ) {
            e.preventDefault();
            setOrb((old) => ({
              x: Math.max(
                -window.innerWidth + 100,
                Math.min(
                  0,
                  old.x +
                    (e.key === "ArrowLeft"
                      ? -20
                      : e.key === "ArrowRight"
                        ? 20
                        : 0),
                ),
              ),
              y: Math.max(
                -window.innerHeight + 100,
                Math.min(
                  0,
                  old.y +
                    (e.key === "ArrowUp"
                      ? -20
                      : e.key === "ArrowDown"
                        ? 20
                        : 0),
                ),
              ),
            }));
          }
        }}
      >
        <span>
          <DoMark />
        </span>
      </button>
    </Container>
  );
}
