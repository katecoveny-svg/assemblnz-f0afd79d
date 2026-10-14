/** Fixed isolated-world reader. No page-supplied script, DOM dump, cookies or form values. */
export function selectedText() {
  const blocked = 'input,textarea,select,[contenteditable],[role="textbox"],[data-private],[data-do-private],script,style,iframe,canvas,[hidden],[aria-hidden="true"]';
  if (document.contentType !== 'text/html' || document.activeElement?.closest(blocked)) throw new Error('Selected text unavailable.');
  const selection = window.getSelection();
  if (!selection || selection.rangeCount !== 1 || selection.isCollapsed) throw new Error('Select ordinary visible text first.');
  const range = selection.getRangeAt(0);
  const root = range.commonAncestorContainer.nodeType === Node.TEXT_NODE ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer as Element;
  if (!root || root.closest(blocked) || root.ownerDocument !== document) throw new Error('Unsupported selection.');
  for (const element of document.querySelectorAll(blocked)) if (range.intersectsNode(element)) throw new Error('Selection touches a private or unsupported area.');
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let result = '', count = 0;
  const read = (node: Node) => {
    if (++count > 5000) throw new Error('Selection too complex.');
    if (!range.intersectsNode(node)) return;
    const parent = node.parentElement;
    if (!parent || parent.closest(blocked)) throw new Error('Unsupported selection.');
    for (let element: Element | null = parent; element; element = element.parentElement) {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) throw new Error('Hidden text unavailable.');
    }
    const bounds = parent.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.right <= 0 || bounds.top >= innerHeight || bounds.left >= innerWidth) throw new Error('Offscreen text unavailable.');
    const text = node.textContent ?? '';
    result += text.slice(node === range.startContainer ? range.startOffset : 0, node === range.endContainer ? range.endOffset : text.length);
    if (result.length > 6000) throw new Error('Select at most 6,000 characters.');
  };
  if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) read(range.commonAncestorContainer);
  else { let node; while ((node = walker.nextNode())) read(node); }
  if (!result.trim()) throw new Error('No ordinary visible text selected.');
  return { text: result.trim(), completeness: 'partial' };
}
/** Identity only, executed only in the explicitly registered first-party document. */
export async function workspaceOwner() {
  if (location.origin !== 'https://www.assembl.co.nz') return null;
  try {
    const response = await fetch('/api/do/session', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(5000) });
    const value = await response.json();
    return response.ok && typeof value.workspaceKey === 'string' && /^[a-f0-9-]{36}$/i.test(value.workspaceKey) ? value.workspaceKey : null;
  } catch { return null; }
}
export function documentUrl() { return location.href; }
