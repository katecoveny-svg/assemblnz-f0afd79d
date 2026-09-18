#!/usr/bin/env python3
"""One-time scoped migration for the inspected DO UI. Never edits an unrecognised file.
Generated source is committed on the feature branch by the review workflow, not on main.
"""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
 'app/do/meetings/MeetingDo.tsx': '667bec45e9031adccba7257c16ab214d97a37ee7',
 'app/do/DoTextWorkspace.tsx': 'c20cdbf8b96d04f477a20c3e8114f85e434b4c4e',
 'app/do/DoUtilityDock.tsx': 'c5d18cfa11539c7b7d3614dad28b5f9961fa51a0',
}

def blob(data):
 return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()

def read(path):
 data=(ROOT/path).read_bytes()
 if blob(data)!=EXPECTED[path]:
  raise SystemExit(f'Unrecognised source: {path}. Review concurrent changes before applying.')
 return data.decode()

def once(s, old, new):
 if s.count(old)!=1: raise SystemExit(f'Expected exactly one source boundary: {old[:80]}')
 return s.replace(old,new,1)

changes={}
s=read('app/do/meetings/MeetingDo.tsx')
s=once(s,"import Link from 'next/link';\n",'')
s=once(s,'useEffect, useMemo, useRef','useEffect, useRef')
for imp in ["import { DoLivingBlob } from '@/components/do/DoLivingBlob';\n", "import { DoWorkBoard } from '@/components/do/DoWorkBoard';\n", "import { DoInstallPwaCta } from '@/components/do/DoInstallPwaCta';\n", "import { DoTaskPanel } from '@/components/do/DoTaskPanel';\n", "  parseMeetingSmartNotes,\n", "import styles from './meeting.module.css';\n"]:
 s=once(s,imp,'')
s=once(s,"import { useRouter, useSearchParams } from 'next/navigation';", "import { useRouter, useSearchParams } from 'next/navigation';\nimport { MeetingDoExperience } from './MeetingDoExperience';")
s=once(s,"  const phoneMode = params.get('phone') === '1';\n",'')
s=once(s,'  const recordRef = useRef<HTMLElement | null>(null);\n','')
s=once(s,"  const [pasteOpen, setPasteOpen] = useState(false);\n  const [editNotesOpen, setEditNotesOpen] = useState(false);", "  const [activity, setActivity] = useState<'transcribe' | 'smart-notes' | null>(null);")
s=once(s,'    setPasteOpen(true);\n    setShareNotes(true);','')
a=s.index('    setReceipt({',s.index('// Local UI preview'))
b=s.index('\n    });',a)+len('\n    });')
s=s[:a]+'    setReceipt(null);'+s[b:]
a=s.index('  const noteSections = useMemo('); b=s.index('  async function start()',a)
s=s[:a]+s[b:]
s=once(s,'      setAudioUrl(\'\');\n      setRecording(true);', "      setAudioUrl('');\n      setNotes(''); setDraft(''); setReceipt(null); setReviewed(false); setShareNotes(false);\n      setRecording(true);")
s=once(s,"    setBusy(true);\n    setMessage('');", "    setBusy(true);\n    setActivity(kind);\n    setMessage('');")
s=once(s,'      const data = await response.json();\n      if (!response.ok)', '      const data = await response.json();\n      if (!alive.current || controller.signal.aborted) return;\n      if (!response.ok)')
s=once(s,'        setPasteOpen(true);', "        setDraft(''); setReceipt(null); setReviewed(false); setShareNotes(false);")
s=once(s,'        setEditNotesOpen(false);\n','')
s=once(s,'      if (alive.current) setBusy(false);', '      if (alive.current) { setBusy(false); setActivity(null); }')
a=s.index('  function jumpToRecord()');b=s.index('\nexport function MeetingDo()',a)
s=s[:a]+'''  async function refreshConnection() {
    const [runtime, transcription] = await Promise.all([
      fetch('/api/do/runtime', { credentials: 'same-origin', cache: 'no-store' }).then(r => r.json()).catch(() => null),
      fetch('/api/do/meetings/transcribe', { credentials: 'same-origin', cache: 'no-store' }).then(r => r.json()).catch(() => null),
    ]);
    if (!alive.current) return;
    setSignedIn(runtime ? (typeof runtime.signedIn === 'boolean' ? runtime.signedIn : Boolean(runtime.trial?.bypassed)) : null);
    setTranscriptionReady(transcription ? Boolean(transcription.configured) : null);
  }

  return <MeetingDoExperience
    preview={previewNotes} captureMode={captureMode} permission={permission}
    shareAudio={shareAudio} shareNotes={shareNotes} recording={recording} starting={starting}
    busy={busy} activity={activity} hasAudio={Boolean(audio)} audioUrl={audioUrl}
    extension={audio?.type.includes('mp4') ? 'm4a' : 'webm'} notes={notes} draft={draft}
    receipt={receipt} reviewed={reviewed} signedIn={signedIn}
    transcriptionReady={transcriptionReady} message={message}
    setCaptureMode={setCaptureMode} setPermission={setPermission}
    setShareAudio={setShareAudio} setShareNotes={setShareNotes}
    editNotes={value => { setNotes(value); setDraft(''); setReceipt(null); setReviewed(false); setShareNotes(false); }}
    editDraft={value => { setDraft(value); setReviewed(false); }} setReviewed={setReviewed}
    start={() => void start()} stop={stop} process={kind => void process(kind)} handoff={handoff}
    cancel={() => request.current?.abort()} refreshConnection={() => void refreshConnection()}
  />;
}
''' + s[b:]
s=s.replace(' * `?phone=1` → one-screen Install → Record landing for tonight’s phone use.',' * The same focused recording experience adapts to desktop and phone.')
s=s.replace(' * Compatible with per-DO to-do panel from PR #1303 (boardId meeting-do).',' * Saved tasks remain accessible via More; no task board competes with recording.')
changes['app/do/meetings/MeetingDo.tsx']=s

s=read('app/do/DoTextWorkspace.tsx')
s=once(s,"export function DoTextWorkspace({ initialBrief = '', initialTask = 'reply', embedded = false, onSettled }: { initialBrief?: string; initialTask?: DoTask; embedded?: boolean; onSettled?: () => void }) {", "export function DoTextWorkspace({ initialBrief = '', initialTask = 'reply', embedded = false, onSettled, focus = false, offeredContext, onSourceChange }: { initialBrief?: string; initialTask?: DoTask; embedded?: boolean; onSettled?: () => void; focus?: boolean; offeredContext?: { text: string; id: number }; onSourceChange?: (value: string) => void }) {")
s=once(s,"  // An embed can offer context for review. It cannot trigger generation or read the result.", '''  useEffect(() => { onSourceChange?.(source); }, [source, onSourceChange]);
  useEffect(() => {
    if (!offeredContext) return;
    const frame = requestAnimationFrame(() => {
      abort.current?.abort();
      setSource(offeredContext.text.slice(0, DO_SOURCE_LIMIT)); setSourceTitle('Reviewed DO context');
      setSourceUrl(''); setConsent(false); setDraft(null); setNotice('Context added. Review it before preparing.');
    });
    return () => cancelAnimationFrame(frame);
  }, [offeredContext]);

  // An embed can offer context for review. It cannot trigger generation or read the result.''')
s=once(s,"      if (event.source !== window.parent || event.data?.type !== 'assembl-do:context') return;", "      if (event.source !== window.parent) return;\n      if (event.data?.type === 'assembl-do:hello') { window.parent.postMessage({ type: 'assembl-do:ready' }, '*'); return; }\n      if (event.data?.type !== 'assembl-do:context') return;")
s=once(s,"    window.addEventListener('message', receive);", "    window.addEventListener('message', receive);\n    window.parent.postMessage({ type: 'assembl-do:ready' }, '*');")
old='<fieldset className="do-task-picker" disabled={busy}><legend>Choose your agent</legend>{DO_TASKS.map(option => <label key={option.id} className={task === option.id ? \'is-selected\' : \'\'}><input type="radio" name="do-task" value={option.id} checked={task === option.id} onChange={() => { setTask(option.id); setConsent(false); }} /><span className="do-task-glyph" aria-hidden>{option.glyph}</span><span><strong>{option.title}</strong><small>{option.description}</small></span></label>)}</fieldset>'
new='{focus ? <label className="do-focus-task">What should DO prepare?<select aria-label="Task" value={task} disabled={busy} onChange={e => { setTask(e.target.value as DoTask); setConsent(false); }}>{DO_TASKS.map(option => <option value={option.id} key={option.id}>{option.title}</option>)}</select></label> : '+old+'}'
s=once(s,old,new)
a=s.index('      <div className="do-example-row">');b=s.index('\n      <details',a)
s=s[:a]+'      {!focus && '+s[a:b].strip()+'}'+s[b:]
changes['app/do/DoTextWorkspace.tsx']=s

s=read('app/do/DoUtilityDock.tsx')
s=once(s,"pathname === '/do/widget' ||", "pathname === '/do/widget' ||\n    pathname === '/do/meetings' ||")
changes['app/do/DoUtilityDock.tsx']=s
changes['app/do/widget/page.tsx']='''import type { Metadata } from 'next';
import { DoFocusWorkspace } from '@/components/do/DoFocusWorkspace';
import '../do.css';
export const metadata: Metadata = {
  title: { absolute: 'DO workspace · assembl' },
  robots: { index: false, follow: false },
};
export default function DoWidgetPage() { return <DoFocusWorkspace />; }
'''
registry=(ROOT/'docs/factory/PRIMITIVES.md').read_text()
row='| DO focused product frame | review branch | `components/do/DoProductFrame.tsx`, `do-product-focus.module.css` | Meeting DO + portable workspace | `scripts/review-do-focus.py` | Shared chrome, one primary task, secondary tools in More; no task/record data deleted; capture and provider permissions remain separate |\n'
registry=once(registry,'| Canvas/design primitives |',row+'| Canvas/design primitives |')
changes['docs/factory/PRIMITIVES.md']=registry
for path, content in changes.items(): (ROOT/path).write_text(content)
print(json.dumps({'changed':list(changes),'method':'exact inspected source boundaries','no_backend_changes':True},indent=2))
