import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PersonalDoAssistant } from '../../../app/do/personal/PersonalDoAssistant';
import { BrowserTaskReview } from '../../../components/do/browser/BrowserTaskReview';
import { reviewShoppingHandoff } from '../../../lib/do/shop/voice-handoff';
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
function Fixture() {
  const [brief, setBrief] = useState<string | null>(null);
  return <><h1>Personal DO connection proof · fictional account</h1><PersonalDoAssistant onBrowserDraft={text => { if (brief) return false; setBrief(text); return true; }} />
    <button onClick={() => { const draft = reviewShoppingHandoff(owner, owner, null, 'Reviewed voice: two fictional oats'); if (draft) setBrief(draft.text); }}>Accept synthetic reviewed voice brief</button>
    {brief && <><button onClick={() => setBrief(null)}>Close task</button><BrowserTaskReview expectedWorkspace={owner} initialBrief={brief} /></>}
  </>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
