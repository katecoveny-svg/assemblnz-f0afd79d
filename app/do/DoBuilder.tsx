'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Check, FileText, Grip, ImageIcon, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { DO_TASKS, type DoTask } from '@/apps/do/shared/preparation';
import { DoTextWorkspace } from './DoTextWorkspace';
import './do-builder.css';

type Skill = DoTask | 'image';
type Recipe = { name: string; skill: Skill; direction: string };
const SKILLS = [...DO_TASKS, { id: 'image' as const, title: 'Create an image', description: 'Turn a visual brief into an original image.', glyph: '◈' }];
const ENQUIRE = 'mailto:assembl@assembl.co.nz?subject=DO%20%E2%80%94%20continue%20after%20my%20trial&body=Kia%20ora%20assembl%2C%0A%0AI%E2%80%99d%20like%20to%20keep%20using%20DO.%0A%0AThe%20work%20I%20want%20help%20with%3A%0A';
export function DoBuilder({ initialBrief = '', initialTask = 'reply', embedded = false }: { initialBrief?: string; initialTask?: DoTask; embedded?: boolean }) {
  const [skill, setSkill] = useState<Skill>(initialTask);
  const [name, setName] = useState('My DO agent');
  const [direction, setDirection] = useState('');
  const [context, setContext] = useState(initialBrief);
  const [sources, setSources] = useState<{ name: string; text: string }[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [runningRecipe, setRunningRecipe] = useState<{ skill: DoTask; brief: string; key: number } | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [ratio, setRatio] = useState('1:1');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  async function refreshTrial() {
    try { const r = await fetch('/api/do/runtime'); const d = await r.json(); setRemaining(d.trial?.remaining ?? null); } catch { /* Server still enforces the limit. */ }
  }
  useEffect(() => {
    const frame = requestAnimationFrame(() => { void refreshTrial(); });
    const receive = (e: MessageEvent) => {
      if (!embedded || e.source !== window.parent) return;
      if (e.data?.type === 'assembl-do:hello') { window.parent.postMessage({ type: 'assembl-do:ready' }, '*'); return; }
      if (e.data?.type !== 'assembl-do:context' || typeof e.data.text !== 'string') return;
      setContext(e.data.text.slice(0, 12000)); setConsent(false);
    };
    window.addEventListener('message', receive);
    if (embedded) window.parent.postMessage({ type: 'assembl-do:ready' }, '*');
    return () => { cancelAnimationFrame(frame); window.removeEventListener('message', receive); };
  }, [embedded]);
  const instruction = [direction, context, ...sources.map(s => `${s.name}\n${s.text}`)].filter(Boolean).join('\n\n').slice(0, skill === 'image' ? 4000 : 12000);
  function selectSkill(id: Skill) { setSkill(id); setConsent(false); setRunningRecipe(null); }
  async function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files).slice(0, 4);
    const accepted: { name: string; text: string }[] = [];
    for (const file of incoming) {
      if (!/\.(txt|md|csv)$/i.test(file.name) || file.size > 48000) { setError('Use text, Markdown or CSV files up to 48 KB each. Paste excerpts from other documents.'); continue; }
      accepted.push({ name: file.name, text: (await file.text()).slice(0, 12000) });
    }
    setSources(old => [...old, ...accepted].slice(0, 4)); setConsent(false);
  }
  function saveRecipe() {
    try {
      const entry = { name: name.trim() || 'My DO agent', skill, direction };
      const list = [entry, ...recipes.filter(r => r.name !== entry.name)].slice(0, 8);
      localStorage.setItem('assembl-do-recipes-v1', JSON.stringify(list)); setRecipes(list); setNotice('Agent recipe saved on this device. Source text and files are not saved.');
    } catch { setError('This browser could not save the recipe.'); }
  }
  function loadRecipes() {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem('assembl-do-recipes-v1') || '[]');
      const list = Array.isArray(raw) ? raw.filter((r): r is Recipe => r && typeof r.name === 'string' && r.name.length <= 80 && typeof r.direction === 'string' && r.direction.length <= 2000 && SKILLS.some(s => s.id === r.skill)).slice(0, 8) : [];
      setRecipes(list); setNotice(list.length ? 'Saved recipes opened.' : 'No recipes saved on this device yet.');
    } catch { setError('Saved recipes could not be opened.'); }
  }
  async function runImage() {
    if (!consent || busy || instruction.length < 10) return;
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/do/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: instruction, aspectRatio: ratio, consent }) });
      const data = await r.json();
      if (!r.ok) { if (r.status === 402) setRemaining(0); throw new Error(data.message || 'Image generation failed.'); }
      setImages(data.images); setNotice('Generated image ready for your review.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Image generation failed.'); }
    finally { setBusy(false); void refreshTrial(); }
  }
  return <div className="dob">
    <header className="dob-head"><div><span className="dob-kicker">DO / AGENT BUILDER</span><h2>Make your own little DO.</h2><p>Bring the ingredients. Choose a skill. Make something useful.</p></div><span className="dob-allowance">{remaining === null ? '3 free tasks to try' : `${remaining} of 3 tasks left`}</span></header>
    <div className="dob-trial"><span>Three free tasks across writing and images. Shared per network. Failed generations do not use a task.</span><a href={ENQUIRE}>Enquire about more <ArrowUpRight size={14}/></a></div>
    <div className="dob-layout"><aside className="dob-palette"><span className="dob-kicker">01 / CHOOSE A SKILL</span><p>Drag a card onto your agent, or tap to add.</p>{SKILLS.map(s => <button key={s.id} type="button" draggable disabled={busy} onDragStart={e => e.dataTransfer.setData('application/x-do-skill', s.id)} onClick={() => selectSkill(s.id)} aria-pressed={skill === s.id}><span className="dob-glyph">{s.glyph}</span><span><strong>{s.title}</strong><small>{s.description}</small></span><Grip size={15}/></button>)}</aside>
    <section className="dob-board" aria-label="Agent assembly board" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData('application/x-do-skill'); if (SKILLS.some(s => s.id === id)) selectSkill(id as Skill); else if(e.dataTransfer.files.length) void addFiles(e.dataTransfer.files); }}>
      <div className="dob-source"><div className="dob-card-head"><FileText size={20}/><span className="dob-kicker">02 / INGREDIENTS</span><label className="dob-file"><Plus size={17}/><span>Add files</span><input type="file" multiple accept=".txt,.md,.csv" onChange={e => { if (e.target.files) void addFiles(e.target.files); e.target.value = ''; }}/></label></div><label htmlFor="dob-context">Your material or visual brief</label><textarea id="dob-context" rows={4} maxLength={skill === 'image' ? 4000 : 12000} value={context} onChange={e => { setContext(e.target.value); setConsent(false); }} placeholder={skill === 'image' ? 'A dramatic overhead photograph of silver fish assembling into a spiral in deep plum water…' : 'Paste a message, notes or a brief. You can also drop text files here.'}/><div className="dob-chips">{sources.map((s,i) => <span key={`${s.name}-${i}`}><FileText size={13}/>{s.name}<button aria-label={`Remove ${s.name}`} onClick={() => { setSources(old => old.filter((_,j) => i !== j)); setConsent(false); }}><Trash2 size={13}/></button></span>)}</div><small>Text files only · 4 files maximum · combined text capped at {skill === 'image' ? '4,000' : '12,000'} characters</small></div>
      <ArrowDown className="dob-wire" size={28}/>
      <div className="dob-agent"><div className="dob-agent-mark" aria-hidden>{skill === 'image' ? <ImageIcon size={32}/> : <Sparkles size={32}/>}</div><div className="dob-agent-fields"><span className="dob-kicker">03 / YOUR AGENT</span><label htmlFor="dob-name">Agent name</label><input id="dob-name" value={name} maxLength={80} onChange={e => setName(e.target.value)}/><strong>{SKILLS.find(s => s.id === skill)?.title}</strong><label htmlFor="dob-direction">How should it work?</label><textarea id="dob-direction" value={direction} maxLength={2000} rows={2} onChange={e => {setDirection(e.target.value);setConsent(false);}} placeholder="Tone, audience, style or details to protect…"/><div className="dob-contract"><Check size={14}/> Runs when you choose. Prepares a draft for your review.</div></div></div>
      <ArrowDown className="dob-wire" size={28}/>
      <div className="dob-output"><span className="dob-kicker">04 / MAKE & REVIEW</span><h3>{skill === 'image' ? 'An image you can use.' : 'Work ready for your next step.'}</h3>{remaining === 0 ? <div className="dob-gate"><h3>Your three free tasks are used.</h3><p>Keep your work. Enquire to arrange continued access.</p><a href={ENQUIRE}>Open an enquiry email <ArrowUpRight size={17}/></a></div> : skill === 'image' ? <><label htmlFor="dob-ratio">Image shape</label><select id="dob-ratio" value={ratio} onChange={e => { setRatio(e.target.value); setConsent(false); }}><option value="1:1">Square</option><option value="16:9">Landscape</option><option value="9:16">Portrait</option></select><label className="dob-consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/>Use this brief with assembl’s image provider for one generated image.</label><button className="dob-run" disabled={!consent || instruction.length < 10 || busy} onClick={() => void runImage()}>{busy ? 'Creating your image…' : 'Generate image · 1 task'}<ImageIcon size={18}/></button></> : <button className="dob-run" disabled={!instruction.trim()} onClick={() => setRunningRecipe({ skill, brief: instruction, key: Date.now() })}>Review inputs & run <ArrowUpRight size={18}/></button>}</div>
    </section></div>
    <div className="dob-recipes"><button onClick={saveRecipe}><Save size={16}/>Save agent recipe</button><button onClick={loadRecipes}>Open saved recipes</button>{recipes.map(r => <button key={r.name} onClick={() => { setName(r.name); setDirection(r.direction); selectSkill(r.skill); }}>{r.name}</button>)}</div>
    {error && <p className="dob-error" role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {runningRecipe && <div><DoTextWorkspace key={runningRecipe.key} onSettled={() => void refreshTrial()} initialTask={runningRecipe.skill} initialBrief={runningRecipe.brief} embedded={embedded}/></div>}
    {!!images.length && <section className="dob-gallery" aria-label="Generated images for review">{images.map((src,i) => <figure key={i}><Image unoptimized src={src} alt="Generated image from your visual brief" width={1024} height={1024}/><figcaption>Generated draft · review before use<a href={src} download={`do-image-${i+1}.png`}>Download image <ArrowUpRight size={16}/></a></figcaption></figure>)}</section>}
    <p className="dob-foot">Saved recipes stay on this device. DO prepares work on demand; it does not monitor pages or send anything for you.</p>
  </div>;
}
