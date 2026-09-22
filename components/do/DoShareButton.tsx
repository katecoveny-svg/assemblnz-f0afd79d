'use client';

import { useRef, useState } from 'react';
import { Share2 } from 'lucide-react';
import { DO_INVITE_URL, shareDo, type DoShareContent } from '@/apps/do/shared/sharing';
import styles from './do-share.module.css';

/** An invitation shares a fixed public link; content must be passed explicitly by its review surface. */
export function DoShareButton({ content, label = 'Share DO', disabled = false }: {
  content?: DoShareContent; label?: string; disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [fallback, setFallback] = useState(false);
  const pending = useRef(false);
  async function share() {
    if (pending.current || disabled) return;
    pending.current = true; setBusy(true); setNotice(''); setFallback(false);
    try { setNotice(await shareDo(content ? { kind: 'content', content } : { kind: 'invite' })); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Sharing is unavailable here.'); setFallback(true); }
    finally { pending.current = false; setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(content?.text ?? DO_INVITE_URL); setNotice(content ? 'Text copied.' : 'DO link copied.'); setFallback(false); }
    catch { setNotice(content ? 'Copy is unavailable. Use the download option to keep your notes.' : `Open ${DO_INVITE_URL} and share it from your browser menu.`); }
  }
  return <span className={styles.wrap}>
    <button type="button" className={styles.button} disabled={disabled || busy} onClick={() => void share()} title={content ? 'Share only this reviewed text. No source transcript or recording is attached.' : 'Share a public DO link. No notes or account details are included.'}><Share2 size={16} aria-hidden="true" />{label}</button>
    {notice && <span className={styles.notice} role="status">{notice}</span>}
    {fallback && <button type="button" className={styles.copy} disabled={disabled} onClick={() => void copy()}>{content ? 'Copy text' : 'Copy link'}</button>}
  </span>;
}
