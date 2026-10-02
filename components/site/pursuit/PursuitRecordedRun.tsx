import Link from 'next/link';
import styles from './pursuit-recorded-run.module.css';

const assets = '/videos/pursuit/assembl-20261002';

export function PursuitRecordedRun() {
  return <section className={styles.section} aria-labelledby="pursuit-recording-title">
    <header className={styles.heading}>
      <p className={styles.kicker}>Pursuit / a real recorded run</p>
      <h2 id="pursuit-recording-title">Watch a question<br />become a sourced first step.</h2>
      <p>A fictional consultancy asks a real question about assembl. Watch Pursuit check two public pages, prepare a proposed piece of work and export the brief.</p>
    </header>
    <figure className={styles.film}>
      <video controls playsInline preload="none" poster={`${assets}/poster.png`} aria-label="Real Pursuit research, review, export and saved-result recovery">
        <source src={`${assets}/recording.mp4`} type="video/mp4" />
        <track kind="captions" src={`${assets}/captions.vtt`} srcLang="en" label="English screen descriptions" default />
        Your browser does not support this video. <a href={`${assets}/recording.mp4`}>Download the recording</a>.
      </video>
      <figcaption>Recorded 2 October 2026. Real research and saved results; the consultancy is an example input. Two fixed sources, zero web searches. Proposed work, with demand still to check.</figcaption>
    </figure>
    <div className={styles.evidence}>
      <div><p className={styles.kicker}>The pages checked</p><a href="https://www.assembl.co.nz/" target="_blank" rel="noopener noreferrer">assembl website</a><a href="https://www.business.govt.nz/operations/getting-started-with-ai/safe-and-smart-ai-use" target="_blank" rel="noopener noreferrer">Safe and smart AI use · Business.govt.nz</a><p>Publication dates are unknown. The proposed engagement is a hypothesis, not confirmed buyer interest or an agreed project.</p></div>
      <div><p className={styles.kicker}>Review the actual output</p><a href={`${assets}/pitch.html`} download="assembl-pursuit-pitch.html">Download the editable pitch</a><a href={`${assets}/source-brief.json`} download="assembl-pursuit-handoff.json">Download the source brief</a><a href={`${assets}/transcript.txt`}>Read the recording transcript</a><Link href="/pursuit#try-pursuit">Try your own question</Link></div>
    </div>
  </section>;
}
