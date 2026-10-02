"use client";

import { useEffect, useRef, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { DO_PRONUNCIATION_SAMPLE, DO_READOUT_VOICE_KEY, doReadoutVoiceLabel, localDoReadoutVoices, selectedDoReadoutVoice } from "@/apps/do/shared/read-aloud";
import styles from "./do-share.module.css";

let activeReadout: { stop: () => void } | null = null;

/** Optional local speech output. Explicit click, no microphone or provider request. */
export function DoReadAloud({ text }: { text: string }) {
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState(text);
  if (sourceText !== text) { setSourceText(text); setSpokenText(null); }
  const speaking = spokenText !== null;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selected, setSelected] = useState("");
  const [notice, setNotice] = useState("");
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const controller = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const refresh = () => setVoices(localDoReadoutVoices(window.speechSynthesis.getVoices()));
    const preference = () => { try { setSelected(localStorage.getItem(DO_READOUT_VOICE_KEY) ?? ""); } catch { /* Device storage is optional. */ } };
    refresh(); preference();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    window.addEventListener("assembl:do-readout-voice", preference);
    window.addEventListener("storage", preference);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", refresh);
      window.removeEventListener("assembl:do-readout-voice", preference);
      window.removeEventListener("storage", preference);
    };
  }, []);

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
  function read(content = text) {
    if (speaking) { stop(); return; }
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setNotice("Read-aloud is unavailable in this browser. Your device’s screen reader can read the draft.");
      return;
    }
    const voice = selectedDoReadoutVoice(window.speechSynthesis.getVoices(), selected);
    if (!voice) {
      setNotice(selected ? "Your selected on-device voice is unavailable. Choose another explicitly; no replacement was used." : "No on-device English voice is available here. Your draft has not been sent to a voice service.");
      return;
    }
    activeReadout?.stop();
    const speech = new SpeechSynthesisUtterance(content);
    speech.voice = voice;
    speech.lang = voice.lang;
    speech.rate = 1;
    utterance.current = speech;
    controller.current = { stop };
    activeReadout = controller.current;
    speech.onend = () => { if (utterance.current === speech) { stop(); setNotice(""); } };
    speech.onerror = () => { if (utterance.current === speech) { stop(); setNotice("Read-aloud stopped. You can try again."); } };
    setNotice(`Reading with ${doReadoutVoiceLabel(voice)}. Check the accent and pronunciation yourself.`);
    setSpokenText(content);
    try { window.speechSynthesis.speak(speech); }
    catch { stop(); setNotice("Read-aloud could not start. Your draft is still here."); }
  }
  return <div className={styles.wrap}>
    <button type="button" className={styles.button} disabled={!text.trim()} aria-pressed={speaking} onClick={() => read()} title="Read this draft using an on-device English voice, when available.">
      {speaking ? <Square size={15} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}{speaking ? "Stop reading" : "Read aloud"}
    </button>
    <details style={{ maxWidth: "100%" }}>
      <summary>Voice options</summary>
      <label>On-device read-aloud voice <select style={{ maxWidth: "100%" }} value={selected} onChange={event => {
        stop(); activeReadout?.stop(); const value = event.target.value; setSelected(value);
        try {
          if (value) localStorage.setItem(DO_READOUT_VOICE_KEY, value); else localStorage.removeItem(DO_READOUT_VOICE_KEY);
          window.dispatchEvent(new Event("assembl:do-readout-voice"));
        } catch { /* Preference still works for this panel. */ }
        setNotice("Voice choice applies to read-aloud on this browser, not calls or dictation.");
      }}>
        <option value="">Automatic on-device English</option>
        {selected && !voices.some(voice => voice.voiceURI === selected) && <option value={selected} disabled>Selected voice unavailable</option>}
        {voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{doReadoutVoiceLabel(voice)}</option>)}
      </select></label>
      <span className={styles.notice}>{voices.some(voice => /^en[-_]NZ$/i.test(voice.lang)) ? "NZ locale is reported by your device. Listen before relying on the accent or Māori pronunciation." : "No on-device NZ English voice is reported here. Other English voices are not labelled as NZ."} Choice stays in this browser.</span>
      <button type="button" className={styles.button} onClick={() => read(DO_PRONUNCIATION_SAMPLE)} disabled={speaking}>Preview pronunciation</button>
    </details>
    {notice && <span role="status" className={styles.notice}>{notice}</span>}
  </div>;
}
