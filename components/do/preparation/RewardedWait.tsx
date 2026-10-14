'use client';
import { useState } from 'react';
import { demoReward, type RewardEvent } from '@/lib/do/preparation/contracts';
/** A human-review wait, never a timer and never a prerequisite for task completion. */
export function RewardedWait({ active, event, onActivity }: { active: boolean; event?: RewardEvent; onActivity: (choice: string) => void }) {
  const [choice, setChoice] = useState<string>(demoReward.choices[0]);
  const [checked, setChecked] = useState(false);
  return <aside className="prep-reward" aria-label="Simulated rewarded wait">
    <p className="prep-eyebrow">Optional · simulated sponsored utility</p><h3>While your basket awaits review</h3>
    <p>Useful activity: choose to use available pantry stock first. Your basket can be completed without doing this activity.</p>
    <p><strong>Sponsor: {demoReward.sponsor} (fictional).</strong> {demoReward.terms}</p>
    <details><summary>Eligibility and terms</summary><p>{demoReward.eligibility}</p><p>No Woolworths connection, Everyday Rewards points, agreed funding or reward issuance.</p></details>
    <label>Reward choice<select value={choice} disabled={!!event || !active} onChange={e => setChoice(e.target.value)}>{demoReward.choices.map(c => <option key={c}>{c}</option>)}</select></label>
    <label className="prep-check"><input type="checkbox" checked={checked} disabled={!!event || !active} onChange={e => setChecked(e.target.checked)} />I chose to use pantry stock first</label>
    <button type="button" disabled={!active || !checked || !!event} onClick={() => onActivity(choice)}>Record optional activity</button>
    <p role="status">{event ? `Simulated reward ${event.state}: ${event.evidence}` : active ? 'Genuine wait: basket is awaiting your review. No artificial delay.' : 'No active review wait. No reward offered.'}</p>
  </aside>;
}
