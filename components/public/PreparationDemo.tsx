"use client";

import { useState, type CSSProperties } from "react";

const STAGES = [
  {
    title: "Choose what to share.",
    detail:
      "The customer selects the information that can be used. They can skip preparation and continue with their main task.",
    sheet: "Permission",
    line: "Only the agreed information.",
    status: "01 / Permission comes first",
  },
  {
    title: "Prepare a useful draft.",
    detail:
      "Relevant information comes together as a brief, a checklist or a set of questions for the next conversation.",
    sheet: "Preparation",
    line: "A useful draft, ready to inspect.",
    status: "02 / The pieces come together",
  },
  {
    title: "Keep a person in control.",
    detail:
      "The customer can correct or remove information. The agreed person or team reviews any consequential next step.",
    sheet: "Review",
    line: "Changes and approval stay visible.",
    status: "03 / Review before handoff",
  },
  {
    title: "Carry the proof forward.",
    detail:
      "Keep a record of the permission, sources, prepared work and approved handoff so the next person can understand what happened.",
    sheet: "Evidence",
    line: "What happened, and who owns the next step.",
    status: "04 / A better-prepared next step",
  },
];

export function PreparationDemo() {
  const [stage, setStage] = useState(0);
  return (
    <div className="public-step-demo">
      <div
        className="public-step-controls"
        aria-label="Explore the preparation steps"
      >
        {STAGES.map((item, index) => (
          <button
            key={item.title}
            aria-pressed={stage === index}
            aria-controls="preparation-model"
            onClick={() => setStage(index)}
          >
            <span>0{index + 1}</span>
            <div>
              <strong>{item.title}</strong>
              {stage === index && <p>{item.detail}</p>}
            </div>
          </button>
        ))}
      </div>
      <div
        id="preparation-model"
        className="public-folio-demo"
        data-stage={stage}
      >
        <div className="public-folio-stack" aria-hidden="true">
          {[STAGES[stage], ...STAGES.filter((_, index) => index !== stage)].map(
            (item, index) => (
              <div
                className="public-folio-sheet"
                key={index}
                style={{ "--sheet": index } as CSSProperties}
              >
                <small>assembl / prepared work</small>
                <h3>{item.sheet}</h3>
                <p>{item.line}</p>
                <span>
                  {index === 0
                    ? "For a person to review"
                    : "Part of the same journey"}
                </span>
              </div>
            ),
          )}
        </div>
        <p className="public-folio-caption" role="status">
          {STAGES[stage].status}
          <br />
          Illustrated example · nothing is saved or sent
        </p>
      </div>
    </div>
  );
}
