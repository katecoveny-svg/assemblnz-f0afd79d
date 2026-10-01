import {FileSearch,MessageSquareText,UserCheck,ArrowDown} from 'lucide-react';
export default function InterviewVisual(){return <div className="interview-visual" role="img" aria-label="Illustrative client preparation: checked evidence, a clear question, then human review">
 <span className="cs-eyebrow">A CLIENT CONVERSATION, PREPARED</span>
 <div><FileSearch aria-hidden="true"/><section><strong>Check the evidence</strong><p>Source, date and uncertainty stay visible.</p></section></div><ArrowDown aria-hidden="true"/>
 <div><MessageSquareText aria-hidden="true"/><section><strong>Clarify the question</strong><p>One problem. A finite next step.</p></section></div><ArrowDown aria-hidden="true"/>
 <div><UserCheck aria-hidden="true"/><section><strong>Review the handoff</strong><p>A person decides what happens next.</p></section></div>
 <small>Illustrative workflow · no client systems connected</small>
 </div>;}
