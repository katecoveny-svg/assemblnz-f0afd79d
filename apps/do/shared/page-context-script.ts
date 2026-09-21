/** One DOM reader for the website companion and its packaged extension. No network or storage. */
export const PAGE_CONTEXT_READER = String.raw`(() => {
  const blocked = 'input,textarea,select,option,[contenteditable],[role="textbox"],[data-do-private],[data-private],[data-do-companion],script,style,noscript,iframe,canvas,video,audio,[hidden],[aria-hidden="true"]';
  const limit = 12000;
  function inView(rect) { return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth; }
  function visible(element) {
    if (!element || element.closest(blocked) || !inView(element.getBoundingClientRect())) return false;
    for (let parent = element, depth = 0; parent && depth < 80; parent = parent.parentElement, depth++) {
      const style = getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || Number(style.opacity) === 0 || style.contentVisibility === 'hidden') return false;
    }
    return true;
  }
  function source(text) {
    const value = text.trim().slice(0,limit);
    if (!value) return null;
    return { text:value, title:String(document.title || 'Chosen page area').slice(0,160), url:location.origin + location.pathname };
  }
  function read(element, range) {
    if (!visible(element)) return null;
    if (element.tagName === 'IMG') return source(element.getAttribute('alt') ? 'Image description (not an image analysis): ' + element.getAttribute('alt') : '');
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node, text = '', visited = 0;
    while ((node = walker.nextNode()) && text.length < limit && visited++ < 2000) {
      if (!node.textContent?.trim() || !visible(node.parentElement) || (range && !range.intersectsNode(node))) continue;
      const bounds = document.createRange(); bounds.selectNodeContents(node);
      if (![...bounds.getClientRects()].some(inView)) continue;
      let value = node.textContent;
      if (range?.endContainer === node) value = value.slice(0,range.endOffset);
      if (range?.startContainer === node) value = value.slice(range.startOffset);
      text += value.replace(/\s+/g,' ').trim() + '\n';
    }
    return source(text);
  }
  function candidate(element) {
    if (!element || element === document.body || element === document.documentElement || element.closest(blocked)) return null;
    if (element.tagName === 'IMG') return visible(element) ? element : null;
    const area = element.closest('p,h1,h2,h3,h4,h5,h6,li,td,th,figcaption,blockquote,article,section,[role="article"],main') || element;
    return visible(area) ? area : null;
  }
  function selection() {
    const chosen = window.getSelection();
    if (!chosen?.rangeCount || document.activeElement?.closest('input,textarea,[contenteditable],[role="textbox"]')) return null;
    let text = '';
    for (let i = 0; i < chosen.rangeCount; i++) {
      const range = chosen.getRangeAt(i);
      for (const node of document.querySelectorAll(blocked)) if (range.intersectsNode(node)) return null;
      const ancestor = range.commonAncestorContainer;
      const root = ancestor.nodeType === 1 ? ancestor : ancestor.parentElement;
      const result = read(root,range);
      if (result) text += result.text + '\n';
    }
    return source(text);
  }
  return Object.freeze({ read, candidate, selection });
})()`;
