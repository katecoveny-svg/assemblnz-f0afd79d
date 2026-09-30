"use client";

import { useEffect, useRef, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { localDoReadoutVoice } from "@/apps/do/shared/read-aloud";
import styles from "./do-share.module.css";

let activeReadout: { stop: () => void } | null = null;

/** Optional local speech output. Explicit click, no microphone or provider request. */
export function DoReadAloud({ text }: { text: string }) {
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const speaking = spokenText === text;
  const [notice, setNotice] = useState("");
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const controller = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const cancel = () => {
      if (utterance.current) {
        utterance.current.onend = null;
        utterance.current.onerror = null;
        utterance.current = null;
        window.speechSynthesis?.cancel();
      }
      if (activeReadout === controller.current) activeReadout = null;
    };
    const hide = () => { if (document.hidden) { cancel(); setSpokenText(null); } };
    document.addEventListener("visibilitychange", hide);
    return () => { document.removeEventListener("visibilitychange", hide); cancel(); };
  }, [text]);

  function stop() {
    if (utterance.current) {
      utterance.current.onend = null;
      utterance.current.onerror = null;
      utterance.current = null;
      window.speechSynthesis.cancel();
    }
    if (activeReadout === controller.current) activeReadout = null;
    setSpokenText(null);
  }
  function read() {
    if (speaking) { stop(); return; }
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setNotice("Read-aloud is unavailable in this browser. Your device’s screen reader can read the draft.");
      return;
    }
    const voice = localDoReadoutVoice(window.speechSynthesis.getVoices());
    if (!voice) {
      setNotice("No on-device English voice is available here. Your draft has not been sent to a voice service.");
      return;
    }
    activeReadout?.stop();
    const speech = new SpeechSynthesisUtterance(text);
    speech.voice = voice;
    speech.lang = voice.lang;
    speech.rate = 1;
    utterance.current = speech;
    controller.current = { stop };
    activeReadout = controller.current;
    speech.onend = () => { if (utterance.current === speech) { stop(); setNotice(""); } };
    speech.onerror = () => { if (utterance.current === speech) { stop(); setNotice("Read-aloud stopped. You can try again."); } };
    setNotice("Reading with your device’s voice.");
    setSpokenText(text);
    try { window.speechSynthesis.speak(speech); }
    catch { stop(); setNotice("Read-aloud could not start. Your draft is still here."); }
  }
  return <span className={styles.wrap}>
    <button type="button" className={styles.button} disabled={!text.trim()} aria-pressed={speaking} onClick={read} title="Read this draft using an on-device English voice, when available.">
      {speaking ? <Square size={15} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}{speaking ? "Stop reading" : "Read aloud"}
    </button>
    {notice && <span role="status" className={styles.notice}>{notice}</span>}
  </span>;
}
