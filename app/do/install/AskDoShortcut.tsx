"use client";
import { useState } from "react";
import { DO_INVITE_URL } from "@/apps/do/shared/sharing";
import styles from "./install.module.css";

export const ASK_DO_URL = `${DO_INVITE_URL}/ask?q=`;

/** Ask DO from Spotlight, Siri or a long-press: the phone's own shortcut opens /do/ask with the words. */
export function AskDoShortcut() {
  const [notice, setNotice] = useState("");
  async function copy() {
    try { await navigator.clipboard.writeText(ASK_DO_URL); setNotice("Link copied. Paste it into the Open URLs action."); }
    catch { setNotice(`Copy is unavailable here. The link is ${ASK_DO_URL}`); }
  }
  return (
    <section className={styles.card} id="ask">
      <p className={styles.kicker}>ADD ONCE IN SHORTCUTS · ABOUT ONE MINUTE</p>
      <h2 className={styles.cardTitle}>Ask DO from Spotlight and Siri.</h2>
      <p className={styles.heroCopy}>Like “Ask Claude” on your iPhone: search for Ask DO, say what you would like done, and DO opens with your words ready for review. A website cannot add itself to Spotlight or Siri, so the Shortcuts app does it for you.</p>
      <ol className={styles.list}>
        <li className={styles.listItem}>Open the <strong>Shortcuts</strong> app and tap <strong>+</strong>.</li>
        <li className={styles.listItem}>Add the action <strong>Ask for Input</strong>. Set the prompt to “What would you like done?”. Choose <strong>Dictate Text</strong> instead if you would rather speak.</li>
        <li className={styles.listItem}>Add the action <strong>Open URLs</strong>. Paste the link below, then tap the end of it and insert the <strong>Provided Input</strong> variable so the URL ends with your words.</li>
        <li className={styles.listItem}>Name the shortcut <strong>Ask DO</strong> and tap Done. It now appears in Spotlight search and Siri answers to “Ask DO”. Add it to your Home Screen from its share menu if you like.</li>
      </ol>
      <p className={styles.note}>
        <code>{ASK_DO_URL}</code>
      </p>
      <button type="button" className={styles.cta} onClick={() => void copy()}>Copy the Ask DO link</button>
      {notice && <p className={styles.alt} role="status">{notice}</p>}
      <p className={styles.note}>On Android, press and hold the DO icon and choose <strong>Ask DO</strong>. Either way DO shows your words first and only goes further when you tap Open. Nothing is saved, sent or opened from a link until then.</p>
    </section>
  );
}
