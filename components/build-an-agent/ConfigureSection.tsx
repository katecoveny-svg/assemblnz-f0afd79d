'use client';

import {
  GUARDRAIL_OPTIONS,
  KNOWLEDGE_OPTIONS,
  MEMORY_SCOPES,
  MODEL_TIERS,
  TOOL_OPTIONS,
} from '@/lib/build-an-agent/config';
import { useBuilder } from '@/lib/build-an-agent/store';
import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';

import { PartGlyph, type PartShape } from './PartGlyph';
import { useReveal } from './useReveal';
import styles from './configure-section.module.css';

/**
 * The visitor configures each part of their agent — the sub-state that shapes
 * the real Claude call in <AskSection />. Every chip corresponds to a piece
 * that will end up inside the system prompt.
 */
export function ConfigureSection() {
  const {
    state: { config },
    setName,
    setModelTier,
    setMemoryScope,
    toggleTool,
    toggleKnowledge,
    setVoice,
    toggleGuardrail,
  } = useBuilder();

  const copy = BUILD_AN_AGENT.configure;
  const { ref, shown } = useReveal<HTMLElement>();

  return (
    <section
      id="configure"
      ref={ref}
      className={`${styles.root} reveal ${shown ? 'revealShown' : ''}`}
      aria-label="Configure your agent"
    >
      <div className="chromeField" aria-hidden />
      <header className={`${styles.banner} glowSoft`} data-parallax="0.05">
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 className={styles.heading}>{copy.heading}</h2>
        <p className={styles.lede}>{copy.lede}</p>
      </header>

      <div className={styles.card}>
        <label className={styles.nameRow}>
          <span className={styles.nameLabel}>{copy.nameLabel}</span>
          <input
            type="text"
            className={styles.nameInput}
            value={config.name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.namePlaceholder}
            maxLength={80}
          />
        </label>

        {/* Model core — tier */}
        <PartCard
          number="01"
          shape="knot"
          title={BUILD_AN_AGENT.parts.modelCore.label}
          helper={BUILD_AN_AGENT.parts.modelCore.helper}
        >
          <ChipRow>
            {MODEL_TIERS.map((tier) => (
              <Chip
                key={tier.id}
                active={config.modelTier === tier.id}
                onClick={() => setModelTier(tier.id)}
              >
                <span className={styles.chipLabel}>{tier.label}</span>
                <span className={styles.chipHelper}>{tier.helper}</span>
              </Chip>
            ))}
          </ChipRow>
        </PartCard>

        {/* Memory — scope */}
        <PartCard
          number="02"
          shape="cubes"
          title={BUILD_AN_AGENT.parts.memory.label}
          helper={BUILD_AN_AGENT.parts.memory.helper}
        >
          <ChipRow>
            {MEMORY_SCOPES.map((m) => (
              <Chip
                key={m.id}
                active={config.memoryScope === m.id}
                onClick={() => setMemoryScope(m.id)}
              >
                <span className={styles.chipLabel}>{m.label}</span>
                <span className={styles.chipHelper}>{m.helper}</span>
              </Chip>
            ))}
          </ChipRow>
        </PartCard>

        {/* Tools — multi-select */}
        <PartCard
          number="03"
          shape="capsule"
          title={BUILD_AN_AGENT.parts.tools.label}
          helper={BUILD_AN_AGENT.parts.tools.helper}
        >
          <ChipRow>
            {TOOL_OPTIONS.map((t) => (
              <Chip
                key={t.id}
                active={config.tools.includes(t.id)}
                onClick={() => toggleTool(t.id)}
              >
                <span className={styles.chipLabel}>{t.label}</span>
                <span className={styles.chipHelper}>{t.helper}</span>
              </Chip>
            ))}
          </ChipRow>
        </PartCard>

        {/* Knowledge — multi-select NZ sources */}
        <PartCard
          number="04"
          shape="octahedron"
          title={BUILD_AN_AGENT.parts.connectors.label}
          helper={BUILD_AN_AGENT.parts.connectors.helper}
        >
          <ChipRow>
            {KNOWLEDGE_OPTIONS.map((k) => (
              <Chip
                key={k.id}
                active={config.knowledge.includes(k.id)}
                onClick={() => toggleKnowledge(k.id)}
              >
                <span className={styles.chipLabel}>{k.label}</span>
                <span className={styles.chipHelper}>{k.helper}</span>
              </Chip>
            ))}
          </ChipRow>
        </PartCard>

        {/* Voice — free text */}
        <PartCard
          number="05"
          shape="sphere"
          title={BUILD_AN_AGENT.parts.prompt.label}
          helper={BUILD_AN_AGENT.parts.prompt.helper}
        >
          <label className={styles.voiceField}>
            <span className={styles.voiceLabel}>{copy.voiceLabel}</span>
            <textarea
              className={styles.voiceArea}
              value={config.voice}
              onChange={(e) => setVoice(e.target.value)}
              placeholder={copy.voicePlaceholder}
              rows={3}
              maxLength={500}
            />
          </label>
        </PartCard>

        {/* Guardrails — multi-select */}
        <PartCard
          number="06"
          shape="ring"
          title={BUILD_AN_AGENT.parts.guardrails.label}
          helper={BUILD_AN_AGENT.parts.guardrails.helper}
        >
          <ChipRow>
            {GUARDRAIL_OPTIONS.map((g) => (
              <Chip
                key={g.id}
                active={config.guardrails.includes(g.id)}
                onClick={() => toggleGuardrail(g.id)}
              >
                <span className={styles.chipLabel}>{g.label}</span>
                <span className={styles.chipHelper}>{g.helper}</span>
              </Chip>
            ))}
          </ChipRow>
        </PartCard>
      </div>
    </section>
  );
}

function PartCard({
  number,
  shape,
  title,
  helper,
  children,
}: {
  number: string;
  shape: PartShape;
  title: string;
  helper: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.partCard} liftCard`}>
      <div className={styles.partHead}>
        <PartGlyph shape={shape} />
        <span className={styles.partNumber} aria-hidden>
          {number}
        </span>
        <div className={styles.partHeadCopy}>
          <h3 className={styles.partTitle}>{title}</h3>
          <p className={styles.partHelper}>{helper}</p>
        </div>
      </div>
      <div className={styles.partBody}>{children}</div>
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className={styles.chipRow}>{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${active ? styles.chipActive : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
