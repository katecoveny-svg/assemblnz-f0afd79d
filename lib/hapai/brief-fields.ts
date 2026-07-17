/**
 * Brief generator field sets — shared by the client form and the server
 * route's deterministic fallback. Ported exactly from
 * public/hapai/brief-generator/brief-generator.html (fieldSets).
 */

export type BriefField = readonly [id: string, label: string, helper: string];

export const BRIEF_TYPES = ["creative", "pitch", "project", "campaign"] as const;
export type BriefType = (typeof BRIEF_TYPES)[number];

export const BRIEF_FIELD_SETS: Record<BriefType, readonly BriefField[]> = {
  creative: [
    ["projectName", "Project name", "A clear working title."],
    ["audience", "Audience", "Who is this for? 1-2 sentences."],
    ["problem", "Problem", "What pain needs solving? 1-2 sentences."],
    ["insight", "Insight", "The truth behind the audience behaviour."],
    ["singleMessage", "Single message", "The one thing they should remember."],
    ["tone", "Tone & manner", "How should it feel?"],
    ["mandatories", "Mandatories", "Logo, legal, dates, constraints."],
    ["deliverables", "Deliverables", "What is being made?"],
  ],
  pitch: [
    ["projectName", "Pitch name", "A clear working title."],
    ["pitchContext", "Pitch context", "Who are you pitching to?"],
    ["decisionMaker", "Decision-maker", "Who needs to say yes?"],
    ["pitchLength", "Pitch length", "5 min, 15 min, or 30 min."],
    ["outcome", "Outcome desired", "What should happen next?"],
    ["proofPoints", "Three key proof points", "The strongest reasons to believe."],
    ["risks", "Risks / objections likely", "What might slow the yes?"],
    ["mandatories", "Mandatories", "Anything that must be included."],
  ],
  project: [
    ["projectName", "Project name", "A clear working title."],
    ["owner", "Owner", "Who runs the work?"],
    ["sponsor", "Sponsor", "Who backs the work?"],
    ["timeline", "Timeline", "Key dates or phases."],
    ["budget", "Budget", "Known range or constraints."],
    ["successCriteria", "Success criteria", "How will good be judged?"],
    ["risks", "Risks", "Known blockers or dependencies."],
    ["stakeholders", "Stakeholders", "Who needs to be kept close?"],
  ],
  campaign: [
    ["projectName", "Campaign name", "A clear working title."],
    ["audience", "Audience", "Who needs to act?"],
    ["offer", "Offer", "What is being promoted?"],
    ["message", "Core message", "The claim or invitation."],
    ["channels", "Channels", "Where will it show up?"],
    ["timing", "Timing", "Launch window and cadence."],
    ["proofPoints", "Proof points", "Why should people believe it?"],
    ["mandatories", "Mandatories", "Brand, legal, links, tags."],
  ],
};

export type BriefSection = { heading: string; body: string };
export type Brief = {
  title: string;
  eyebrow: string;
  sections: BriefSection[];
  signature: string;
};
