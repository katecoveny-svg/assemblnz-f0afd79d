'use client';
import { useState } from 'react';
import { formatVoiceBrief, voiceBrief, type VoiceBriefKey } from './voiceBrief';
import styles from './voices.module.css';
const labels: Record<VoiceBriefKey, string> = { base: 'Base voice', neutral: '1 · Neutral explainer / editorial', casual: '2 · Casual / social', recurring: '3 · Consistent recurring character', tips: 'Follow-up tips', optional: 'Optional Māori English influence · off by default', review: 'Listening and provider review', editorial: 'Editorial correction note' };
export function VoiceBriefPanel({ script }: { script: string }) {
  const [fields, setFields] = useState({ ...voiceBrief });
  const [notice, setNotice] = useState('Edit and download this reusable brief to preserve your changes.');
  const download = () => {
    const url = URL.createObjectURL(new Blob([formatVoiceBrief(fields, script)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'assembl-auckland-voice-brief.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Brief downloaded with style guidance before the separate script.');
  };
  return <section className={styles.brief} aria-labelledby="voice-brief-heading">
    <h2 id="voice-brief-heading">Your Auckland voice brief</h2>
    <p>The full reusable direction, with three variants. This is review guidance: the current worker uses its fixed voice presets and does not receive these edited instructions. Your script stays separate.</p>
    {(Object.keys(fields) as VoiceBriefKey[]).map(key => <details key={key} open={key === 'base'}><summary>{labels[key]}</summary><label>{labels[key]}<textarea rows={key === 'base' ? 5 : 4} value={fields[key]} onChange={e => setFields(previous => ({ ...previous, [key]: e.target.value }))} /></label></details>)}
    <button type="button" onClick={download}>Download full brief + script</button>
    <p role="status">{notice}</p><p className={styles.hint}>Edits stay in this tab until you download them. No recording, cloning, training or generation starts here. Optional influence is guidance only and is not applied automatically.</p>
  </section>;
}
