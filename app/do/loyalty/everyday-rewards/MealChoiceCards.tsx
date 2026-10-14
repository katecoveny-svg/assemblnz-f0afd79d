"use client";
import { useId } from 'react';
import { mealChoiceCards, money } from './model';

/** Original vector still lifes. Decorative sample dishes, not product photographs. */
function MealArt({ kind }: { kind: string }) {
  const id = useId().replace(/:/g, '');
  const rice = kind === 'rice-night', eggs = kind === 'eggs-toast';
  return <svg viewBox="0 0 360 235" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-paper`} x2="1" y2="1"><stop stopColor="#faf1dc"/><stop offset="1" stopColor="#dfdbc1"/></linearGradient>
      <radialGradient id={`${id}-plate`} cx="40%" cy="30%"><stop stopColor="#fffff7"/><stop offset=".75" stopColor="#efe9d9"/><stop offset="1" stopColor="#bdc7ae"/></radialGradient>
      <radialGradient id={`${id}-tomato`} cx="30%" cy="25%"><stop stopColor="#ffad50"/><stop offset=".5" stopColor="#e6582c"/><stop offset="1" stopColor="#9b3321"/></radialGradient>
      <radialGradient id={`${id}-yolk`} cx="35%" cy="25%"><stop stopColor="#ffe79a"/><stop offset=".6" stopColor="#ffb82e"/><stop offset="1" stopColor="#d57b17"/></radialGradient>
      <filter id={`${id}-shadow`} x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#243c24" floodOpacity=".22"/></filter>
    </defs>
    <rect width="360" height="235" fill={`url(#${id}-paper)`}/>
    <path d="M290 -20L375 8 318 260 246 246Z" fill="#c67c3b" opacity=".24"/>
    {[0,1,2,3].map(n=><path key={n} d={`M${279+n*12} 0l-45 235`} stroke="#fff7e3" strokeWidth="2" opacity=".55"/>)}
    <g filter={`url(#${id}-shadow)`}>
      <ellipse cx="171" cy="125" rx="128" ry="85" fill="#fdf9ee"/>
      <ellipse cx="171" cy="121" rx="113" ry="72" fill={`url(#${id}-plate)`} stroke="#e4dfc9" strokeWidth="2"/>
      <ellipse cx="171" cy="120" rx="88" ry="52" fill={eggs?'#cd9553':rice?'#f6e7bd':'#ce763b'}/>
      {eggs ? <>
        <path d="M91 96q5-23 28-18l51 10 6 59-81 12Z" fill="#b97537" stroke="#8b522d" strokeWidth="5"/>
        <path d="M178 85q26-18 57 6l13 55-74 19-8-55Z" fill="#d3a262" stroke="#996133" strokeWidth="5"/>
        {[132,205].map((x,i)=><g key={x} transform={`rotate(${i?12:-9} ${x} 121)`}><path d={`M${x-31} 105q-9-25 16-26 29-8 36 12 28 14 10 36 4 28-29 25-34 7-37-16-10-21 4-31`} fill="#fffaf0"/><ellipse cx={x} cy="117" rx="22" ry="18" fill={`url(#${id}-yolk)`}/><ellipse cx={x-7} cy="111" rx="7" ry="3" fill="#fff5c3" opacity=".6"/></g>)}
      </> : <>
        {Array.from({length: rice?48:22},(_,i)=>{const x=104+(i*37)%139,y=84+(i*19)%72;return rice?<ellipse key={i} cx={x} cy={y} rx="7" ry="2.3" transform={`rotate(${i*29} ${x} ${y})`} fill={i%3?'#fff4d2':'#d6b77d'}/>:<path key={i} d={`M${x} ${y}q-10-12-18 0t-18 0`} fill="none" stroke={i%2?'#f4c267':'#e6a049'} strokeWidth="7" strokeLinecap="round"/>;})}
        {[[-26,-16],[31,13],[-40,27],[42,-25]].map(([x,y],i)=><g key={i} transform={`translate(${171+x} ${121+y}) rotate(${i*44})`}><ellipse rx="25" ry="13" fill="#493129"/><ellipse rx="19" ry="9" fill="#b59460"/><path d="M-13-3L14 3M-12 3L10 7" stroke="#6c5134" strokeWidth="2"/></g>)}
      </>}
      {[[-58,-21],[51,24],[10,-35]].map(([x,y],i)=><g key={i} transform={`translate(${171+x} ${121+y}) rotate(${i*61})`}><ellipse rx="18" ry="12" fill={`url(#${id}-tomato)`}/><path d="M-10-1q10-8 20 0M0-8v15" stroke="#ffc381" strokeWidth="2" opacity=".7"/></g>)}
      {[[-12,-3],[58,-10],[-45,42]].map(([x,y],i)=><g key={i} transform={`translate(${171+x} ${121+y}) rotate(${i*75})`}><path d="M0 0q-23-25-29-7Q-22 9 0 0q15-23 27-11Q20 10 0 0" fill="#386345"/><path d="M-23-8L0 0 22-8" fill="none" stroke="#92a865"/></g>)}
    </g>
    <path d="M36 55l-11 121M28 52l-4 28M36 51l-4 29M44 53l-4 28" stroke="#8c997b" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="308" cy="188" r="22" fill="#e4ad39"/><circle cx="308" cy="188" r="17" fill="#fff0a1"/>
    {[0,60,120].map(n=><path key={n} d="M291 188h34" transform={`rotate(${n} 308 188)`} stroke="#e1bc60" strokeWidth="2"/>)}
  </svg>;
}

export function MealChoiceCards({ cards, selected, onChoose }: { cards: ReturnType<typeof mealChoiceCards>; selected: string; onChoose: (id: string) => void }) {
  return <section className="ld-meal-choices" aria-label="Choose your dinner">
    <div className="ld-meal-intro"><h3>Your kitchen. Three possibilities.</h3><p>Original sample dish illustrations · fictional whole-pack prices. No retailer stock or cart connection.</p></div>
    <div className="ld-meal-grid">{cards.map(card=><article key={card.id} className="ld-meal-card" data-selected={selected===card.id} data-meal={card.id}>
      <div className="ld-meal-art"><MealArt kind={card.id}/><span>{selected===card.id?'Your selected dinner':'Sample dinner'}</span></div>
      <div className="ld-meal-content"><h4>{card.name}</h4>
        {card.totalMinor !== null ? <>
          <p className="ld-meal-price"><strong>{money(card.totalMinor)}</strong><span>sample basket · whole packs</span></p>
          <h5>From your confirmed pantry</h5><ul className="ld-meal-pantry">{card.used.map(line=><li key={line.ingredientId}>{line.name} · {line.pantryUsed} {line.unit}</li>)}</ul>{!card.used.length&&<p className="ld-meal-note">Nothing to deduct.</p>}
          <h5>Still to get</h5><ul className="ld-meal-missing">{card.missing.map(line=><li key={line.ingredientId}><span>{line.name}</span><strong>{line.packs} {line.packs===1?'pack':'packs'}</strong></li>)}</ul>{!card.missing.length&&<p className="ld-meal-note">Covered by your confirmed pantry.</p>}
        </>:<p className="ld-meal-note">Calculation awaits review.</p>}
        {card.blockers.map(reason=><p key={reason} className="ld-meal-blocker">{reason}</p>)}
        <button type="button" className="ld-dark" aria-label={`Choose ${card.name}`} aria-pressed={selected===card.id} disabled={card.blockers.length>0} onClick={()=>onChoose(card.id)}>{selected===card.id?'Selected dinner':'Choose this dinner'}<span aria-hidden="true">↗</span></button>
      </div>
    </article>)}</div>
  </section>;
}
