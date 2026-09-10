'use client';

import Image from 'next/image';
import { useId, useState } from 'react';
import { ArrowDownRight } from 'lucide-react';

const studies = {
  arc: [
    { file: 'arc-harbour-terraces', label: 'Street study', alt: 'Concept drawing of Auckland terrace homes with timber weatherboards, metal gable roofs, pōhutukawa and harakeke.' },
    { file: 'arc-exploded-model', label: 'Construction study', alt: 'Concept axonometric drawing separating a timber terrace roof and three floors to reveal rooms, stairs and framing.' },
  ],
  forge: [
    { file: 'forge-vehicle-study', label: 'Vehicle study', alt: 'Concept vehicle study with a graphite SUV body, roof glass and wheel separated above a detailed chassis.' },
  ],
  customs: [
    { file: 'customs-harbour-study', label: 'Cargo study', alt: 'Concept drawing of a coastal container vessel at a New Zealand wharf, with cargo, a timber crate and documents.' },
  ],
} as const;

type Props = { agent: keyof typeof studies };

/** Generated concept art is kept separate from the existing, interactive DEMO plans. */
export function AgentStudyArtwork({ agent }: Props) {
  const [active, setActive] = useState(0);
  const id = useId();
  const views = studies[agent];
  const location = agent === 'arc' ? 'Auckland · architectural studies' : agent === 'forge' ? 'New Zealand · automotive' : 'New Zealand · coastal freight';

  return (
    <figure className={`agent-study agent-study-${agent}`}>
      <div className="agent-study-meta aa-mono">
        <span>{location}</span>
        <ArrowDownRight size={17} aria-hidden="true" />
      </div>
      <div className="agent-study-images" id={id} aria-live="polite">
        {views.map((view, index) => (
          <div key={view.file} className="agent-study-image" data-visible={index === active} aria-hidden={index !== active}>
            <Image
              src={`/brand/agent-studies/${view.file}.webp`}
              alt={view.alt}
              fill
              sizes="(max-width: 760px) 100vw, 60vw"
              priority={index === 0}
              className="agent-study-render"
            />
          </div>
        ))}
      </div>
      <figcaption className="agent-study-caption">
        {views.length > 1 ? (
          <div className="agent-study-switch" role="group" aria-label="Architectural study view">
            {views.map((view, index) => (
              <button key={view.file} type="button" aria-pressed={active === index} aria-controls={id} onClick={() => setActive(index)}>
                <span className="aa-mono">0{index + 1}</span>{view.label}
              </button>
            ))}
          </div>
        ) : <span className="aa-mono">01 / {views[0].label}</span>}
        <span className="agent-study-disclosure aa-mono">Concept illustration</span>
      </figcaption>
    </figure>
  );
}
