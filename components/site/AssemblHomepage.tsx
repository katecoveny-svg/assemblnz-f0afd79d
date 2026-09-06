'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import './assembl-homepage.css';

type Mode = 'live' | 'rewarded' | 'sponsored';

const scenarios = [
  {
    id: 'flight',
    label: 'my flight changed',
    eyebrow: 'travel disruption',
    status: 'Your Auckland → Queenstown flight has changed.',
    wait: 'We’re checking your options now.',
    prompt: 'While that happens, what matters most?',
    choices: ['protect my connection', 'keep us together', 'earliest arrival', 'I need accommodation'],
    agents: [
      ['journey agent', 'checking viable options'],
      ['family context', '2 travellers · seats together'],
      ['recovery agent', 'ground transport prepared'],
      ['human owner', 'review required'],
    ],
    outcome: 'Your next best option is ready.',
    detail: 'A recovery plan is prepared for review before you need to repeat the story.',
    proof: 'resolution readiness',
  },
  {
    id: 'quote',
    label: 'my quote is being reviewed',
    eyebrow: 'lending',
    status: 'Your personalised quote is being reviewed.',
    wait: 'The assessment is still running.',
    prompt: 'While that happens, I can prepare the decision.',
    choices: ['align with payday', 'check my documents', 'show total cost', 'prepare my questions'],
    agents: [
      ['context agent', 'pay cycle understood'],
      ['readiness agent', 'documents checked'],
      ['clarity agent', 'total cost explained'],
      ['human owner', 'adviser handoff ready'],
    ],
    outcome: 'Your adviser-ready summary is assembled.',
    detail: 'The customer reaches the next step informed, organised and still in control.',
    proof: 'first-time completion',
  },
  {
    id: 'village',
    label: 'my family is choosing a village',
    eyebrow: 'retirement living',
    status: 'Your information pack is being prepared.',
    wait: 'A village adviser is reviewing your enquiry.',
    prompt: 'Let’s make sure the visit answers the questions that matter.',
    choices: ['I’m exploring for myself', 'I’m helping a parent', 'different care needs', 'understand the costs'],
    agents: [
      ['family context', 'priorities kept distinct'],
      ['planning agent', 'visit shaped around needs'],
      ['questions agent', 'unanswered items assembled'],
      ['human owner', 'adviser brief prepared'],
    ],
    outcome: 'Your family readiness plan is ready.',
    detail: 'One shared, permissioned context carries into the human conversation.',
    proof: 'visit readiness',
  },
  {
    id: 'car',
    label: 'my car is being prepared',
    eyebrow: 'automotive',
    status: 'Your vehicle is being prepared.',
    wait: 'The ownership handover is being coordinated.',
    prompt: 'While that happens, let’s assemble the experience around you.',
    choices: ['configure handover', 'organise trade-in', 'plan servicing', 'set delivery around me'],
    agents: [
      ['ownership agent', 'preferences assembled'],
      ['trade-in agent', 'history prepared'],
      ['service agent', 'future care mapped'],
      ['human owner', 'concierge review ready'],
    ],
    outcome: 'Your ownership plan is ready.',
    detail: 'The car is only one part of the journey; everything around it arrives prepared too.',
    proof: 'handover readiness',
  },
] as const;

type ScenarioId = (typeof scenarios)[number]['id'];

const modeCopy: Record<Mode, { kicker: string; title: string; body: string; example: string; value: string }> = {
  live: {
    kicker: '01 · live',
    title: 'help while it happens',
    body: 'A live agent explains the process, gathers what is missing and prepares the next step while real work is underway.',
    example: '“Your application has reached the team. While they review it, I can check what is ready.”',
    value: 'better completion · less uncertainty · stronger handoff',
  },
  rewarded: {
    kicker: '02 · rewarded',
    title: 'return value for useful participation',
    body: 'The business gives something useful back when the customer completes an optional action that improves the journey.',
    example: '“Complete your household energy profile and receive a proposed power-bill credit.”',
    value: 'better context · more self-service · stronger loyalty',
  },
  sponsored: {
    kicker: '03 · sponsored',
    title: 'sponsored utility. not sponsored interruption.',
    body: 'A relevant partner can fund a useful tool, service or reward without buying control of the customer’s outcome.',
    example: '“Funded by a participating partner. Your information is not shared unless you ask to be contacted.”',
    value: 'new partner value · clear disclosure · customer utility first',
  },
};

const concepts = [
  {
    name: 'Summerset',
    line: 'A family decision, assembled.',
    body: 'Family priorities become a tailored visit, shared questions and a better-prepared human conversation.',
    className: 'summerset',
  },
  {
    name: 'Ryman',
    line: 'One family story across changing needs.',
    body: 'Approved context travels across living, support and care without asking a family to begin again.',
    className: 'ryman',
  },
  {
    name: 'Nectar',
    line: 'Clarity, assembled.',
    body: 'Quote processing becomes time to understand cost, prepare documents and arrive at the decision ready.',
    className: 'nectar',
  },
  {
    name: 'Giltrap',
    line: 'The entire ownership experience, assembled.',
    body: 'Discovery, sourcing, trade-in, handover, servicing and concierge support become one active journey.',
    className: 'giltrap',
  },
] as const;

const architecture = [
  ['business genome', 'products · policies · language · permissions'],
  ['journey composer', 'stages · decisions · waits · handoffs'],
  ['runtime', 'context · tools · state · approvals'],
  ['specialist agents', 'intent · plan · action · resolution'],
  ['customer experience', 'one coherent journey'],
  ['proof', 'work completed · effort reduced · outcome'],
] as const;

function AssemblyField() {
  const reduced = useReducedMotion();
  const fragments = ['intent', 'context', 'permission', 'business rules', 'human owner'];

  return (
    <div className="ah-assembly" aria-label="A passive loading ring opening into context, permissions, specialist agents and a prepared next step">
      <div className="ah-assembly-grid" aria-hidden="true" />
      <motion.div
        className="ah-orbit ah-orbit-outer"
        aria-hidden="true"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="ah-orbit ah-orbit-inner"
        aria-hidden="true"
        animate={reduced ? undefined : { rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <div className="ah-core-wrap">
        <motion.div
          className="ah-core"
          aria-hidden="true"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        />
        <span>processing</span>
      </div>

      {fragments.map((fragment, index) => (
        <motion.div
          className={`ah-fragment ah-fragment-${index + 1}`}
          key={fragment}
          initial={false}
          animate={reduced ? undefined : { y: [0, index % 2 ? -8 : 7, 0], rotate: [0, index % 2 ? 1.5 : -1.5, 0] }}
          transition={{ duration: 4.8 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
        >
          <i aria-hidden="true" />
          <span>{fragment}</span>
        </motion.div>
      ))}

      <motion.div
        className="ah-human-anchor"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ delay: 0.25, duration: 0.7 }}
      >
        <span>human owner</span>
        <strong>Sophie · customer team</strong>
      </motion.div>

      <motion.div
        className="ah-ready-card"
        initial={{ opacity: 0, y: 22, rotateX: 8 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ delay: 0.45, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <small>next step</small>
        <strong>ready</strong>
        <p>0:18 of waiting → useful progress</p>
      </motion.div>
    </div>
  );
}

export function AssemblHomepage() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('flight');
  const [choice, setChoice] = useState(0);
  const [mode, setMode] = useState<Mode>('live');

  const scenario = useMemo(
    () => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0],
    [scenarioId],
  );

  const chooseScenario = (id: ScenarioId) => {
    setScenarioId(id);
    setChoice(0);
  };

  return (
    <div className="ahome">
      <header className="ah-nav">
        <Link className="ah-wordmark" href="/" aria-label="assembl home">assembl<span>·</span></Link>
        <nav aria-label="Primary">
          <a href="#platform">platform</a>
          <a href="#waits">active waits</a>
          <a href="#concepts">concepts</a>
          <a href="#proof">proof</a>
        </nav>
        <a className="ah-nav-cta" href="mailto:assembl@assembl.co.nz?subject=Start%20with%20one%20customer%20moment">start with one moment <span>↗</span></a>
      </header>

      <main>
        <section className="ah-hero" aria-labelledby="ah-hero-title">
          <div className="ah-hero-copy">
            <p className="ah-kicker">active customer journeys</p>
            <h1 id="ah-hero-title">Every customer journey has moments in between.</h1>
            <p className="ah-hero-lede">Assembl turns them into useful progress.</p>
            <p className="ah-hero-body">
              While systems process, people review and customers wait, specialist agents prepare what comes next — with the customer informed and people still in control.
            </p>
            <div className="ah-hero-actions">
              <a className="ah-primary" href="#experience">see a journey assemble <span>↓</span></a>
              <a className="ah-text-link" href="#lost-time">explore the moments in between</a>
            </div>
            <p className="ah-proof-line">Quotes · claims · orders · bookings · applications · handoffs · every moment marked <em>processing</em>.</p>
          </div>
          <AssemblyField />
        </section>

        <section className="ah-lost" id="lost-time">
          <div className="ah-section-copy">
            <p className="ah-kicker">the moments in between</p>
            <h2>The spinner is lost time.</h2>
            <p>Not because nothing is happening. Because nothing useful is happening <em>for the customer</em>.</p>
          </div>
          <div className="ah-timeline" aria-label="A passive wait becoming an active customer journey">
            <div className="ah-timeline-before">
              {['loading', 'checking', 'reviewing', 'assigning', 'preparing'].map((item, index) => (
                <span key={item}><b>{String(index + 1).padStart(2, '0')}</b>{item}</span>
              ))}
            </div>
            <div className="ah-timeline-cut"><i /> <strong>assembl</strong> <i /></div>
            <div className="ah-timeline-after">
              {['understand', 'prepare', 'approve', 'hand off', 'prove'].map((item, index) => (
                <span key={item}><b>{String(index + 1).padStart(2, '0')}</b>{item}</span>
              ))}
            </div>
          </div>
          <p className="ah-manifesto-line">The wait already exists. The opportunity is what can happen inside it.</p>
        </section>

        <section className="ah-experience" id="experience">
          <div className="ah-experience-head">
            <p className="ah-kicker">try an active customer journey</p>
            <h2>Choose a moment.</h2>
            <p>No empty chat box. No theatre. Start with the customer’s real situation and prepare something useful.</p>
          </div>

          <div className="ah-scenario-tabs" role="tablist" aria-label="Customer journey scenarios">
            {scenarios.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={scenarioId === item.id}
                className={scenarioId === item.id ? 'is-active' : ''}
                onClick={() => chooseScenario(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={`ah-scenario ah-theme-${scenario.id}`}>
            <AnimatePresence mode="wait">
              <motion.div
                className="ah-scenario-customer"
                key={scenario.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <p className="ah-scenario-kicker">{scenario.eyebrow} · simulated concept</p>
                <h3>{scenario.status}</h3>
                <p className="ah-scenario-wait">{scenario.wait}</p>
                <div className="ah-live-signal"><i aria-hidden="true" /><span>work is happening</span></div>
                <h4>{scenario.prompt}</h4>
                <div className="ah-choice-grid">
                  {scenario.choices.map((item, index) => (
                    <button
                      type="button"
                      className={choice === index ? 'is-selected' : ''}
                      onClick={() => setChoice(index)}
                      key={item}
                    >
                      <span>{item}</span><i aria-hidden="true">{choice === index ? '✓' : '→'}</i>
                    </button>
                  ))}
                </div>
                <p className="ah-permission"><b>permission</b> Only the context approved for this moment is used. Review or remove it before handoff.</p>
              </motion.div>
            </AnimatePresence>

            <div className="ah-scenario-work">
              <p className="ah-scenario-kicker">behind the journey</p>
              <div className="ah-agent-list">
                {scenario.agents.map(([agent, status], index) => (
                  <motion.div
                    className="ah-agent-row"
                    key={`${scenario.id}-${agent}`}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <i aria-hidden="true" />
                    <span><b>{agent}</b><small>{status}</small></span>
                    <em>{index === scenario.agents.length - 1 ? 'review' : 'active'}</em>
                  </motion.div>
                ))}
              </div>
              <motion.div
                className="ah-output"
                key={`${scenario.id}-${choice}`}
                initial={{ opacity: 0, y: 16, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.15 }}
              >
                <span>prepared output</span>
                <h4>{scenario.outcome}</h4>
                <p>{scenario.detail}</p>
                <div><b>pilot measure</b><strong>{scenario.proof}</strong></div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="ah-platform" id="platform">
          <div className="ah-platform-head">
            <p className="ah-kicker">the operating system</p>
            <h2>The customer sees one journey. The business sees a governed system.</h2>
          </div>
          <div className="ah-architecture" aria-label="Assembl platform architecture">
            {architecture.map(([title, body], index) => (
              <div className="ah-architecture-node" key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                {index < architecture.length - 1 ? <i aria-hidden="true">→</i> : null}
              </div>
            ))}
          </div>
          <div className="ah-platform-note">
            <strong>Assembl is not one giant assistant.</strong>
            <p>Specialist agents work within explicit purpose, tools, permissions and limits. The customer experiences one coherent service.</p>
          </div>
        </section>

        <section className="ah-waits" id="waits">
          <div className="ah-waits-head">
            <p className="ah-kicker">one layer · three models</p>
            <h2>Not every wait should work the same way.</h2>
          </div>
          <div className="ah-mode-switch" role="tablist" aria-label="Active wait models">
            {(['live', 'rewarded', 'sponsored'] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                className={mode === item ? 'is-active' : ''}
                onClick={() => setMode(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              className={`ah-mode-stage ah-mode-${mode}`}
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <div className="ah-mode-copy">
                <span>{modeCopy[mode].kicker}</span>
                <h3>{modeCopy[mode].title}</h3>
                <p>{modeCopy[mode].body}</p>
                <blockquote>{modeCopy[mode].example}</blockquote>
                <small>{modeCopy[mode].value}</small>
              </div>
              <div className="ah-mode-object" aria-hidden="true">
                <div className="ah-mode-core"><span>{mode}</span></div>
                <div className="ah-mode-ring ah-mode-ring-a" />
                <div className="ah-mode-ring ah-mode-ring-b" />
                <div className="ah-mode-token ah-mode-token-a">customer</div>
                <div className="ah-mode-token ah-mode-token-b">utility</div>
                <div className="ah-mode-token ah-mode-token-c">proof</div>
              </div>
            </motion.div>
          </AnimatePresence>
          <p className="ah-sponsor-rule">The sponsor pays for usefulness — not access to interrupt.</p>
        </section>

        <section className="ah-concepts" id="concepts">
          <div className="ah-concepts-head">
            <p className="ah-kicker">concept lab</p>
            <h2>One operating system. Entirely different customer worlds.</h2>
            <p>Assembl should disappear into the experience. The client remains the hero.</p>
          </div>
          <div className="ah-concept-grid">
            {concepts.map((concept, index) => (
              <Link href="/concepts" className={`ah-concept ah-concept-${concept.className}`} key={concept.name}>
                <span>0{index + 1} · independent concept</span>
                <div className="ah-concept-object" aria-hidden="true"><i /><i /><i /></div>
                <div>
                  <small>{concept.name}</small>
                  <h3>{concept.line}</h3>
                  <p>{concept.body}</p>
                  <b>enter concept <em>↗</em></b>
                </div>
              </Link>
            ))}
          </div>
          <p className="ah-concept-disclaimer">Independent concepts use simulated data. No commercial relationship with the named organisations is implied.</p>
        </section>

        <section className="ah-proof" id="proof">
          <div className="ah-proof-copy">
            <p className="ah-kicker">proof</p>
            <h2>Do not ask the business to believe the experience improved. Show it.</h2>
            <p>Every journey starts with a measurable problem and ends with evidence of what changed.</p>
          </div>
          <div className="ah-proof-fold">
            <div className="ah-proof-face ah-proof-customer">
              <span>customer sees</span>
              <h3>the next step, prepared.</h3>
              <ul>
                <li>clear progress</li>
                <li>less repeated explanation</li>
                <li>visible control</li>
                <li>a named person when it matters</li>
              </ul>
            </div>
            <div className="ah-proof-spine">turn the journey over <span>→</span></div>
            <div className="ah-proof-face ah-proof-business">
              <span>business can measure</span>
              <h3>pilot measures</h3>
              <div className="ah-measures">
                {['completion', 'customer effort', 'handoff quality', 'staff preparation', 'confidence', 'conversion'].map((item) => <b key={item}>{item}</b>)}
              </div>
              <small>Example measurement framework · no invented client results.</small>
            </div>
          </div>
        </section>

        <section className="ah-trust">
          <div className="ah-trust-head">
            <p className="ah-kicker">trust is interface</p>
            <h2>Useful because the customer stays in control.</h2>
          </div>
          <div className="ah-trust-grid">
            <article><span>01</span><h3>permission at the moment of use</h3><p>“Use this application to prepare your adviser summary?”</p></article>
            <article><span>02</span><h3>a named human owner</h3><p>“Prepared for Moana, your lending adviser.”</p></article>
            <article><span>03</span><h3>clear authority</h3><p>“I can prepare this. I cannot approve it.”</p></article>
            <article><span>04</span><h3>transparent sponsorship</h3><p>Funded utility stays visibly separate from the core recommendation.</p></article>
            <article><span>05</span><h3>reversible consent</h3><p>Review, remove or change what will be shared.</p></article>
            <article><span>06</span><h3>traceable action</h3><p>See what context was used, what was prepared and who approved it.</p></article>
          </div>
        </section>

        <section className="ah-close">
          <p className="ah-kicker">the active journey sprint</p>
          <h2>The journey already has moments in between.<br />Make one useful.</h2>
          <p>Choose a customer moment that already contains delay, uncertainty or repeated work. Assembl will design the active journey around it and define how to prove whether it worked.</p>
          <a className="ah-primary ah-close-cta" href="mailto:assembl@assembl.co.nz?subject=Assemble%20one%20customer%20moment&body=The%20customer%20moment%3A%0A%0AWhat%20happens%20today%3A%0A%0AWhat%20I%27d%20like%20to%20improve%3A%0A%0ACompany%3A%0A">assemble a customer journey <span>↗</span></a>
          <small>Find the friction. Assemble the journey. Prove the result.</small>
        </section>
      </main>

      <footer className="ah-footer">
        <Link className="ah-wordmark" href="/">assembl<span>·</span></Link>
        <p>active customer journeys · Aotearoa New Zealand</p>
        <nav aria-label="Footer">
          <Link href="/concepts">concepts</Link>
          <Link href="/generative-studio">studio</Link>
          <a href="mailto:assembl@assembl.co.nz">contact</a>
        </nav>
      </footer>
    </div>
  );
}
