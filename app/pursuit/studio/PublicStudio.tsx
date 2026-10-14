'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Download, Play, Square, Upload, X } from 'lucide-react';
import { PURSUIT_EXAMPLES } from '@/components/site/pursuit/pursuit-examples';
import { canvasFontFamily } from '@/lib/creative/canvas-font';
import { paintVideo, recordVideo, videoMimeType, videoVtt } from '@/lib/studio/motion-video';
import { exportPublicProject, MAX_PROJECT_BYTES, parsePublicProject, projectVideo, publicProjectSchema, seedProject, validateMedia, type PublicProject } from '@/lib/studio/public-project';
import styles from './studio.module.css';

type ImageAsset = { image: HTMLImageElement; url: string; name: string };
type AudioAsset = { file: File; url: string; duration: number };
const stages = ['Brief', 'Storyboard', 'Export'];

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function PublicStudio({ exampleId }: { exampleId?: string }) {
  const [project, setProject] = useState<PublicProject>(() => seedProject(exampleId));
  const [stage, setStage] = useState(0);
  const [scene, setScene] = useState(0);
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [audio, setAudio] = useState<AudioAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [encoding, setEncoding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [result, setResult] = useState<{ url: string; blob: Blob; extension: string; captions: string } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const busy = useRef(false);
  const audioPreview = useRef<HTMLAudioElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const valid = publicProjectSchema.safeParse(project).success;
  const locked = encoding || loading;
  const example = PURSUIT_EXAMPLES.find(item => item.id === project.example)!;

  useEffect(() => {
    alive.current = true;
    const frame = requestAnimationFrame(() => setSupported(!!videoMimeType() && !!HTMLCanvasElement.prototype.captureStream));
    return () => { cancelAnimationFrame(frame); alive.current = false; controller.current?.abort(); };
  }, []);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image.url); }, [image]);
  useEffect(() => () => { if (audio) URL.revokeObjectURL(audio.url); }, [audio]);
  useEffect(() => () => { if (result) { URL.revokeObjectURL(result.url); URL.revokeObjectURL(result.captions); } }, [result]);
  useEffect(() => {
    if (encoding) return;
    let frame = 0;
    let stopped = false;
    const start = performance.now();
    const draw = (now: number) => {
      if (stopped || !canvas.current) return;
      const elapsed = playing ? (now - start) / 1000 : scene * project.seconds + 1;
      try { paintVideo(canvas.current, projectVideo(project, canvasFontFamily()), Math.min(elapsed, project.seconds * 4 - .01), project.format, project.seconds, image?.image); }
      catch { setError('Preview is unavailable. Download your project and reopen it in another browser.'); setPlaying(false); return; }
      if (playing && elapsed < project.seconds * 4) frame = requestAnimationFrame(draw);
      else if (playing) setPlaying(false);
    };
    void document.fonts.ready.then(() => { if (!stopped) draw(performance.now()); });
    const hide = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', hide);
    return () => { stopped = true; cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', hide); };
  }, [project, scene, playing, encoding, image]);

  function edit(next: PublicProject) { setPlaying(false); setResult(null); setProject(next); setError(''); setMessage(''); }
  function go(next: number) { setPlaying(false); setStage(next); requestAnimationFrame(() => heading.current?.focus()); }
  function updateScene(key: 'title' | 'body', value: string) {
    edit({ ...project, scenes: project.scenes.map((item, index) => index === scene ? { ...item, [key]: value } : item) });
  }
  async function importProject(file?: File) {
    if (!file || busy.current) return;
    busy.current = true; setLoading(true); setError('');
    try {
      if (file.size > MAX_PROJECT_BYTES) throw Error('Project is too large. Choose a Studio project under 32 KB.');
      const parsed = parsePublicProject(await file.text());
      if (!alive.current) return;
      edit(parsed); setImage(null); setAudio(null); setScene(0); go(1);
      setMessage('Project reopened. Reselect any image or narration: media is not included in project files.');
    } catch (cause) { if (alive.current) setError(cause instanceof Error ? cause.message : 'Project could not be opened.'); }
    finally { busy.current = false; if (alive.current) setLoading(false); }
  }
  async function importMedia(file: File | undefined, kind: 'image' | 'audio') {
    if (!file || busy.current) return;
    busy.current = true; setLoading(true); setError(''); setPlaying(false);
    let url: string | undefined;
    try {
      validateMedia(file, kind); url = URL.createObjectURL(file);
      if (kind === 'image') {
        const asset = new Image(); asset.src = url;
        await asset.decode();
        if (asset.naturalWidth * asset.naturalHeight > 16_000_000) throw Error('This image is too large to draw safely. Resize it to 16 megapixels or less.');
        if (!alive.current) return;
        setImage({ image: asset, name: file.name, url });
      } else {
        const asset = new Audio();
        const duration = await new Promise<number>((resolve, reject) => {
          const timer = setTimeout(() => finish(Error('Audio could not be read. Try another file.')), 8000);
          function finish(error?: Error) {
            clearTimeout(timer); const seconds = asset.duration;
            asset.onloadedmetadata = null; asset.onerror = null; asset.removeAttribute('src'); asset.load();
            if (error) reject(error); else resolve(seconds);
          }
          asset.onloadedmetadata = () => finish();
          asset.onerror = () => finish(Error('Audio could not be read. Try another file.'));
          asset.src = url!;
        });
        if (!Number.isFinite(duration) || duration <= 0 || duration > 120) throw Error('Choose an audio clip between 1 and 120 seconds.');
        if (!alive.current) return;
        setAudio({ file, url, duration });
      }
      url = undefined; setResult(null); setMessage('Media added on this device only. It will not be included in the project file.');
    } catch (cause) { if (alive.current) setError(cause instanceof Error ? cause.message : 'The media file could not be opened.'); }
    finally { if (url) URL.revokeObjectURL(url); busy.current = false; if (alive.current) setLoading(false); }
  }
  async function encode() {
    if (!canvas.current || !valid || busy.current) return;
    busy.current = true; audioPreview.current?.pause(); setPlaying(false); setEncoding(true); setProgress(0); setError(''); setResult(null); setMessage('');
    const abort = new AbortController(); controller.current = abort;
    try {
      const output = await recordVideo(canvas.current, projectVideo(project, canvasFontFamily()), project.format, project.seconds, value => { if (alive.current) setProgress(value); }, abort.signal, image?.image, audio?.file);
      if (alive.current) {
        setResult({ ...output, url: URL.createObjectURL(output.blob), captions: URL.createObjectURL(new Blob([videoVtt(projectVideo(project, canvasFontFamily()), project.seconds)], { type: 'text/vtt' })) });
        setMessage('Video ready on this device. Play it below and check the words and sound before downloading.');
      }
    } catch (cause) { if (alive.current) setError(cause instanceof Error ? cause.message : 'Export failed. Try again or download the project.'); }
    finally { busy.current = false; controller.current = null; if (alive.current) setEncoding(false); }
  }
  function saveProject() {
    download(new Blob([exportPublicProject(project)], { type: 'application/json' }), 'assembl-studio-project.json');
    setMessage('Project downloaded with text and timing only. Keep your original image and narration to reselect when reopening.');
  }

  return <div className={styles.page}>
    <header className={styles.header}><Link href="/" className={styles.wordmark}>assembl</Link><nav aria-label="Product navigation"><Link href="/pursuit">Pursuit</Link><Link href="/creative-studio">Studio</Link></nav></header>
    <section className={styles.intro}><h1>From an opening<br />to an opening scene.</h1><div><p>Take a fictional Pursuit opportunity into Studio. Shape a concept, edit four scenes and make a short film you can play and download.</p><p className={styles.note}>Public sample · no sign-in · everything you edit stays in this tab.</p></div></section>
    <div className={styles.toolbar}><nav aria-label="Making progress">{stages.map((name, index) => <button key={name} disabled={locked} aria-current={stage === index ? 'step' : undefined} onClick={() => go(index)}><span>{index + 1}</span>{name}</button>)}</nav><label className={styles.fileButton}><Upload size={16} />Reopen project<input type="file" accept=".json,application/json" aria-label="Reopen project" disabled={locked} onChange={event => { void importProject(event.target.files?.[0]); event.target.value = ''; }} /></label></div>
    <div className={styles.workspace}>
      <section className={styles.editor} aria-labelledby="editor-title">
        <h2 id="editor-title" ref={heading} tabIndex={-1}>{['Choose the opening.', 'Make the story yours.', 'Make something to show.'][stage]}</h2>
        {stage === 0 && <fieldset disabled={locked}>
          <label>Fictional opportunity<select value={project.example} onChange={event => { edit(seedProject(event.target.value)); setScene(0); }} >{PURSUIT_EXAMPLES.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <p className={styles.note}>Changing the example replaces the brief and all scene copy.</p>
          <label>Project name<input maxLength={80} value={project.title} onChange={event => edit({ ...project, title: event.target.value })} /></label>
          <label>The signal<textarea maxLength={600} rows={3} value={project.brief} onChange={event => edit({ ...project, brief: event.target.value })} /></label>
          <label>The concept<textarea maxLength={300} rows={3} value={project.concept} onChange={event => edit({ ...project, concept: event.target.value })} /></label>
          <p className={styles.note}>Source: {example.source}. Fictional, not research. {example.unknown}</p>
          <button className={styles.primary} disabled={!valid} onClick={() => { edit({ ...project, scenes: project.scenes.map((item, i) => i === 1 ? { ...item, body: project.brief.slice(0, 240) } : i === 2 ? { ...item, body: project.concept.slice(0, 240) } : item) }); go(1); setMessage('Signal and concept copied into scenes 2 and 3, up to 240 characters each. Edit the short version before export.'); }}>Use brief in storyboard <ArrowRight size={18} /></button>
          <Link className={styles.textLink} href="/pursuit#try-pursuit">Explore the existing public research tools</Link>
        </fieldset>}
        {stage === 1 && <fieldset disabled={locked}>
          <div className={styles.sceneTabs} role="group" aria-label="Select scene">{project.scenes.map((item, index) => <button key={index} aria-pressed={scene === index} onClick={() => { setPlaying(false); setScene(index); }}><span>{index + 1}</span><small>{index * project.seconds}–{(index + 1) * project.seconds}s</small></button>)}</div>
          <label>Scene {scene + 1} headline<input maxLength={80} value={project.scenes[scene].title} onChange={event => updateScene('title', event.target.value)} /></label>
          <label>Scene {scene + 1} copy<textarea maxLength={240} rows={4} value={project.scenes[scene].body} onChange={event => updateScene('body', event.target.value)} /></label>
          <div className={styles.settings}><label>Frame<select value={project.format} onChange={event => edit({ ...project, format: event.target.value as PublicProject['format'] })}><option value="landscape">Landscape · 16:9</option><option value="portrait">Portrait · 9:16</option><option value="square">Square · 1:1</option></select></label><label>Per scene<select value={project.seconds} onChange={event => edit({ ...project, seconds: Number(event.target.value) as PublicProject['seconds'] })}>{[4, 6, 8].map(value => <option key={value} value={value}>{value} seconds</option>)}</select></label></div>
          <details className={styles.media}><summary>Add your image or narration</summary><p className={styles.note}>Optional local files. One image is used across all scenes. Use media you have permission to use.</p>
            <label>Image · PNG, JPEG or WebP · up to 5 MB<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { void importMedia(event.target.files?.[0], 'image'); event.target.value = ''; }} /></label>
            {image && <button onClick={() => { setImage(null); setResult(null); }}><X size={16} />Remove {image.name}</button>}
            <label>Narration · up to 10 MB and 120 seconds<input type="file" accept="audio/wav,audio/x-wav,audio/mpeg,audio/mp4,audio/ogg,audio/webm" onChange={event => { void importMedia(event.target.files?.[0], 'audio'); event.target.value = ''; }} /></label>
            {audio && <><audio ref={audioPreview} controls src={audio.url} aria-label="Audition imported narration" /><p className={styles.note}>{audio.duration.toFixed(1)}s audio. Starts at 0s in the export; {audio.duration > project.seconds * 4 ? `cut at ${project.seconds * 4}s.` : 'the remaining video is silent.'}</p><button onClick={() => { setAudio(null); setResult(null); }}><X size={16} />Remove narration</button></>}
          </details>
          <button className={styles.primary} disabled={!valid} onClick={() => go(2)}>Review and export <ArrowRight size={18} /></button>
        </fieldset>}
        {stage === 2 && <div className={styles.exports}>
          <p>{project.seconds * 4} seconds. Four scenes. {project.format} frame. {audio ? 'Imported narration starts at 0s and ends with the film.' : 'Silent film. Add narration from the storyboard if you want sound.'}</p>
          <p className={styles.note}>Recording takes the length of the film. Keep this tab visible. Your browser chooses MP4 or WebM; there is no server rendering.</p>
          {supported === false && <p role="status">Video encoding is unavailable here. Use a current Chrome, Edge or Safari browser. Project and caption downloads still work.</p>}
          <button className={styles.primary} disabled={locked || !valid || !supported} onClick={() => void encode()}><Play size={18} />{result ? 'Record again' : 'Record video'}</button>
          {encoding && <div><progress max={1} value={progress} aria-label="Video export progress" /><p>Recording {Math.round(progress * 100)}%</p><button onClick={() => controller.current?.abort()}><Square size={16} />Cancel export</button></div>}
          {result && <><video className={styles.result} controls playsInline src={result.url} aria-label="Exported film"><track kind="captions" label="Scene copy (not speech-aligned)" srcLang="en" src={result.captions} /></video><a className={styles.download} href={result.url} download={`assembl-film.${result.extension}`}><Download size={18} />Download {result.extension.toUpperCase()} · {(result.blob.size / 1024 / 1024).toFixed(1)} MB</a></>}
          <div className={styles.downloads}><button disabled={locked || !valid} onClick={saveProject}><Download size={16} />Project file</button><button disabled={locked || !valid} onClick={() => download(new Blob([videoVtt(projectVideo(project, canvasFontFamily()), project.seconds)], { type: 'text/vtt' }), 'assembl-scene-captions.vtt')}><Download size={16} />Scene captions</button></div>
          <p className={styles.note}>Captions repeat scene copy at scene boundaries; they are not a transcript or aligned to speech. Check them against your narration. Project files contain text and settings only, with no images, audio or video.</p>
        </div>}
        {!valid && <p role="alert">Fill in the project name, signal, concept and every scene headline and copy before continuing or exporting.</p>}
        {loading && <p role="status">Checking your local file…</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <p className={styles.status} role="status">{message}</p>
      </section>
      <aside className={styles.preview} aria-label="Film preview">
        <div className={styles.previewTop}><span>Fictional concept / for review</span><span>{project.seconds * 4}s</span></div>
        <div className={styles.canvasFrame} data-format={project.format}><canvas ref={canvas} aria-label={`Scene ${scene + 1} visual preview. All scene text is listed below.`} /></div>
        <div className={styles.previewControls}><button disabled={locked} onClick={() => setPlaying(value => !value)}>{playing ? <Square size={16} /> : <Play size={16} />}{playing ? 'Stop preview' : 'Preview motion'}</button><span>Silent preview · sound in export</span></div>
        <ol className={styles.transcript}>{project.scenes.map((item, index) => <li key={index}><button disabled={locked} aria-current={scene === index ? 'true' : undefined} onClick={() => { setScene(index); setPlaying(false); if (stage === 0) go(1); }}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.title || 'Add a headline'}</strong><p>{item.body || 'Add scene copy'}</p></div></button></li>)}</ol>
      </aside>
    </div>
    <footer className={styles.footer}><p><strong>Keep a copy before you leave.</strong> Refreshing or closing this tab clears your work. Download the project to reopen the text and timing; reselect your original media. Files are processed on this device and never uploaded by this editor.</p><p>This public sample uses fictional briefs and local editing. Personal saves, client projects, generated voices and provider rendering are separate protected capabilities. <Link href="/creative-studio">Explore Studio</Link></p></footer>
  </div>;
}
