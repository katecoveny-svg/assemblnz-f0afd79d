'use client';
import { useRef, useState } from 'react';
import { Plus, Trash2, Copy, Share2 } from 'lucide-react';
import { DoProductFrame } from '@/components/do/DoProductFrame';
import { shareDo } from '@/apps/do/shared/sharing';
import { meetingReminderCalendar } from '@/apps/do/shared/meeting-followthrough';
import { MAX_BACKUP_BYTES, MAX_THREADS, EXAMPLE_SOURCE, canShare, candidateActions, editConversation, emptyWorkspace, newConversation, outgoingText, parseWorkspace, reviewedText, serialiseWorkspace, type Conversation, type MessageWorkspace as Workspace } from '@/apps/do/messages/model';
import { forgetMessages, loadMessages, saveMessages } from '@/apps/do/messages/storage';
import styles from './messages.module.css';
function download(text: string, filename: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function MessageWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const [status, setStatus] = useState('Nothing is saved until you choose Save on this device.');
  const [imported, setImported] = useState<Workspace | null>(null);
  const [removed, setRemoved] = useState<Conversation | null>(null);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const current = workspace.conversations.find(c => c.id === workspace.activeId)!;
  const preview = outgoingText(current);
  const update = (change: Partial<Pick<Conversation, 'title' | 'source' | 'notes' | 'reply' | 'actions'>>) => {
    try {
      const next = editConversation(current, change);
      setWorkspace(w => ({ ...w, conversations: w.conversations.map(c => c.id === next.id ? next : c) }));
      setStatus('Changed in this tab. Review again before sharing; save again to keep changes.');
    } catch { setStatus('That change could not be used. Check the text length or date.'); }
  };
  const attempt = (work: () => void, success: string) => {
    try { work(); setStatus(success); } catch (e) { setStatus(e instanceof Error ? e.message : 'Could not complete that step.'); }
  };
  const handoff = async (kind: 'share' | 'copy') => {
    if (busy) return; setBusy(true);
    try {
      const text = reviewedText(current);
      if (kind === 'share') setStatus(await shareDo({ kind: 'content', content: { title: 'Reviewed reply', text, filename: 'do-reply.txt' } }));
      else { await navigator.clipboard.writeText(text); setStatus('Reply copied. Paste it into your chosen app; nothing has been sent.'); }
    } catch (e) { setStatus(e instanceof Error ? e.message : 'Could not share. Use Download reply instead.'); }
    finally { setBusy(false); }
  };
  return <DoProductFrame product="Messages"><div className={styles.workspace}>
    <header className={styles.intro}><h1>Keep the conversation moving.</h1><p>Pull out the next steps. Write the reply. Choose what leaves DO.</p></header>
    <nav className={styles.threads} aria-label="Your conversations">
      {workspace.conversations.map(c => <button key={c.id} type="button" aria-pressed={current.id === c.id} onClick={() => { setWorkspace(w => ({ ...w, activeId: c.id })); setStatus('Conversation opened in this tab.'); }}>{c.title || 'Untitled conversation'}</button>)}
      <button type="button" disabled={workspace.conversations.length >= MAX_THREADS} onClick={() => {
        const next = newConversation(); setWorkspace(w => ({...w, activeId:next.id, conversations:[...w.conversations,next]}));
        setStatus('New conversation. Kept separate from your other work.');
      }}><Plus size={16} aria-hidden="true" /> New conversation</button>
    </nav>
    <div className={styles.columns}><section className={styles.composer} aria-labelledby="conversation-heading">
      <h2 id="conversation-heading">The conversation</h2>
      <label>Conversation name<input maxLength={100} value={current.title} onChange={e => update({title:e.target.value})} /></label>
      <label>Paste the useful messages<textarea rows={6} maxLength={8000} value={current.source} onChange={e => update({source:e.target.value})} placeholder="Paste the part you want to work on." /></label>
      <p className={styles.hint}>Stays in this tab unless you save or export a backup. DO cannot read your inbox.</p>
      <div className={styles.actions}><button type="button" className={styles.primary} disabled={!current.source.trim()} onClick={() => {
        if(current.actions.length) {setStatus('Remove existing steps before extracting again. Your work is unchanged.');return;}
        const actions=candidateActions(current.source); update({actions});
        setStatus(actions.length ? 'Candidate lines copied from your messages. Check wording, owners and dates.' : 'No request lines found. Add a next step yourself.');
      }}>Find possible next steps</button><button type="button" disabled={!!current.source} onClick={() => update({source:EXAMPLE_SOURCE,title:'Fictional example'})}>Try an example</button></div>
      <details><summary>Private notes</summary><label>Only for you<textarea rows={3} maxLength={2000} value={current.notes} onChange={e => update({notes:e.target.value})} /></label><p className={styles.hint}>Excluded from replies and calendar files. Included in your private backup.</p></details>
      <label>Your reply<textarea rows={5} maxLength={4000} value={current.reply} onChange={e => update({reply:e.target.value})} placeholder="Write or paste the reply you want to send." /></label>
    </section><section className={styles.work} aria-labelledby="steps-heading">
      <div className={styles.sectionHeading}><h2 id="steps-heading">Next steps</h2><span>{current.actions.filter(a=>a.done).length}/{current.actions.length} checked</span></div>
      {!current.actions.length && <p className={styles.empty}>A clear next step starts here. Add one yourself or find possible steps in the conversation.</p>}
      <ul className={styles.taskList}>{current.actions.map((a,index)=>{
        const edit=(change:Partial<typeof a>)=>update({actions:current.actions.map(t=>t.id===a.id?{...t,...change}:t)});
        return <li key={a.id}>
          <label className={styles.check}><input type="checkbox" checked={a.done} onChange={e=>edit({done:e.target.checked})} /> I have completed step {index+1}</label>
          <label>Step {index+1}<input maxLength={300} value={a.title} onChange={e=>edit({title:e.target.value})} /></label>
          <div className={styles.taskFields}><label>Owner<input aria-label={'Owner for step '+(index+1)} maxLength={100} value={a.owner} onChange={e=>edit({owner:e.target.value})} placeholder="Choose a person" /></label><label>Due date<input aria-label={'Due date for step '+(index+1)} type="date" value={a.due} onChange={e=>edit({due:e.target.value})} /></label></div>
          <div className={styles.taskBottom}><label className={styles.check}><input type="checkbox" checked={a.share} onChange={e=>edit({share:e.target.checked})} /> Include in reply</label><button type="button" aria-label={'Remove step '+(index+1)} onClick={()=>update({actions:current.actions.filter(t=>t.id!==a.id)})}><Trash2 size={16} aria-hidden="true" /></button></div>
          <button type="button" disabled={!a.title.trim()||!a.due} onClick={()=>attempt(()=>{
            const startsAt=new Date(a.due+'T09:00:00');
            download(meetingReminderCalendar({title:a.title,agenda:a.owner?'Owner: '+a.owner:'',startsAt:startsAt.toISOString(),id:a.id}),'do-reminder.ics','text/calendar');
          },'Calendar file downloaded for 9am in this device’s timezone. Import it yourself; no booking was made.')}>Download 9am reminder</button>
        </li>;
      })}</ul>
      <button type="button" disabled={current.actions.length>=12} onClick={()=>update({actions:[...current.actions,{id:crypto.randomUUID(),title:'',owner:'',due:'',done:false,share:false}]})}><Plus size={16} aria-hidden="true" /> Add a next step</button>
    </section></div>
    <section className={styles.review} aria-labelledby="review-heading"><div><h2 id="review-heading">Only this leaves DO.</h2><p>Check the exact reply below. Your original messages and private notes stay out of it.</p></div><div>
      <label>Ready to share<textarea readOnly rows={5} value={preview} placeholder="Your reply and selected next steps appear here." /></label>
      <label className={styles.check}><input type="checkbox" checked={canShare(current)} disabled={!preview.trim()} onChange={e=>setWorkspace(w=>({...w,conversations:w.conversations.map(c=>c.id===current.id?{...c,reviewedRevision:e.target.checked?c.revision:null}:c)}))} /> I’ve reviewed this exact reply</label>
      <div className={styles.actions}><button type="button" className={styles.primary} disabled={!canShare(current)||busy} onClick={()=>void handoff('share')}><Share2 size={16} aria-hidden="true" /> Share reply</button><button type="button" disabled={!canShare(current)||busy} onClick={()=>void handoff('copy')}><Copy size={16} aria-hidden="true" /> Copy</button><button type="button" disabled={!canShare(current)} onClick={()=>attempt(()=>download(reviewedText(current),'do-reply.txt'),'Reviewed reply downloaded. Nothing has been sent.')}>Download reply</button></div>
      <p className={styles.hint}>Your chosen app handles sending. DO does not confirm delivery.</p>
    </div></section>
    <p role="status" className={styles.status}>{status}</p>
    <details className={styles.persistence}><summary>Save, load or back up your workspace</summary><p>Saving uses this browser on this device. Anyone with access to it may be able to read your messages. A backup contains all conversations and private notes; keep it private.</p>
      <div className={styles.actions}>
        <button type="button" onClick={()=>attempt(()=>saveMessages(workspace,localStorage),'Saved on this device. Later changes need saving again.')}>Save on this device</button>
        <button type="button" onClick={()=>attempt(()=>{const saved=loadMessages(localStorage);if(!saved)throw Error('No saved workspace found on this device.');setImported(saved);},'Saved copy ready below. Review before replacing this tab.')}>Load saved copy</button>
        <button type="button" onClick={()=>attempt(()=>forgetMessages(localStorage),'Saved copy removed. This tab and downloaded backups are unchanged.')}>Forget saved copy</button>
        <button type="button" onClick={()=>attempt(()=>download(serialiseWorkspace(workspace),'do-messages-private.json','application/json'),'Private backup downloaded. Review resets when reopened.')}>Export private backup</button>
        <button type="button" onClick={()=>file.current?.click()}>Import backup</button>
        <input ref={file} className={styles.file} type="file" accept="application/json,.json" aria-label="Choose a private workspace backup" onChange={async e=>{
          const chosen=e.target.files?.[0];e.target.value='';if(!chosen)return;
          try{if(chosen.size>MAX_BACKUP_BYTES)throw Error('too large');setImported(parseWorkspace(await chosen.text()));setStatus('Backup checked. Review before replacing this tab.');}
          catch{setStatus('Choose a valid DO messages backup smaller than 180 KB.');}
        }} />
      </div>
      {imported&&<div className={styles.importReview}><p>Replace this tab with {imported.conversations.length} conversation(s)? Unsaved changes will be lost. Sharing must be reviewed again.</p><button type="button" onClick={()=>{setWorkspace(imported);setImported(null);setRemoved(null);setStatus('Workspace opened. Review replies again before sharing.');}}>Replace current workspace</button><button type="button" onClick={()=>setImported(null)}>Cancel</button></div>}
    </details>
    <div className={styles.actions}><button type="button" className={styles.remove} onClick={()=>{
      setRemoved(current);const rest=workspace.conversations.filter(c=>c.id!==current.id);
      setWorkspace(rest.length?{version:1,activeId:rest[0].id,conversations:rest}:emptyWorkspace());
      setStatus('Removed from this tab. Undo is available. Save again to update the saved copy.');
    }}><Trash2 size={16} aria-hidden="true" /> Remove this conversation</button>
    {removed&&workspace.conversations.length<MAX_THREADS&&<button type="button" onClick={()=>{
      const restored={...removed,id:crypto.randomUUID(),reviewedRevision:null};
      setWorkspace(w=>({...w,activeId:restored.id,conversations:[...w.conversations,restored]}));setRemoved(null);setStatus('Conversation restored. Review again before sharing.');
    }}>Undo removal</button>}</div>
  </div></DoProductFrame>;
}
