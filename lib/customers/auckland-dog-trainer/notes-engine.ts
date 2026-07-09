/**
 * Session Notes → Client Plan engine (demo).
 *
 * Deterministic, local transform so the pitch works without a model key.
 * Pattern-matches Fred-style voice notes into the six killer outputs.
 */

export type NotesPlan = {
  clientSummary: string;
  dogProfile: {
    name: string;
    age: string;
    breed: string;
    issues: string[];
  };
  weeklyHomework: string[];
  riskNotes: string[];
  courseMatch: { module: string; reason: string };
  nextBooking: { offer: string; reason: string };
  trainerHandover: string;
  followUp: { when: string; message: string };
  contentIdea: string;
};

const DEFAULT_NOTE = `Met Bruno today. Two-year-old staffy mix. Reactive to scooters and dogs within ten metres. Owner struggles with timing. Started engagement work and pressure/release basics. Homework: three short engagement sessions daily, mark the look-back, keep distance from scooters. Suggest Reactivity Rewired week 2 thresholds module. Follow up Friday.`;

function pickName(text: string): string {
  const m = text.match(/\b(?:met|saw|worked with|session with)\s+([A-Z][a-z]+)\b/i)
    ?? text.match(/\b([A-Z][a-z]{2,})\s+today\b/);
  return m?.[1] ?? 'the dog';
}

function pickAge(text: string): string {
  const m = text.match(/(\d+[-\s]?(?:month|mo|year|yr|y)[-\s]?olds?|\d+\s*(?:months?|years?|yrs?|y)\b)/i);
  return m?.[1]?.replace(/\s+/g, ' ') ?? 'age not stated';
}

function pickBreed(text: string): string {
  const breeds = [
    'staffy mix',
    'staffordshire',
    'labrador',
    'lab cross',
    'border collie',
    'rottweiler',
    'poodle',
    'husky',
    'shepherd',
    'terrier',
    'bulldog',
    'spaniel',
    'mix',
  ];
  const lower = text.toLowerCase();
  for (const b of breeds) {
    if (lower.includes(b)) return b;
  }
  return 'breed not stated';
}

function detectIssues(text: string): string[] {
  const map: Array<[RegExp, string]> = [
    [/reactiv/i, 'reactivity'],
    [/scooter|skateboard|bike/i, 'moving-object triggers'],
    [/pull(?:ing)?|loose\s*lead|leash/i, 'lead manners'],
    [/jump/i, 'jumping on people'],
    [/recall|come\s*when\s*called|selective\s*hearing/i, 'recall'],
    [/bark/i, 'barking'],
    [/separat/i, 'separation distress'],
    [/aggress|bite|lunge/i, 'escalation risk'],
    [/timing|inconsistent|reward/i, 'handler timing'],
  ];
  const found: string[] = [];
  for (const [re, label] of map) {
    if (re.test(text) && !found.includes(label)) found.push(label);
  }
  return found.length ? found : ['general manners'];
}

function isReactivity(text: string, issues: string[]): boolean {
  return issues.includes('reactivity') || /reactiv|threshold|scooter|lunge/i.test(text);
}

function isRecall(text: string, issues: string[]): boolean {
  return issues.includes('recall') || /recall|off-?leash|e-?collar/i.test(text);
}

export function transformSessionNotes(raw: string): NotesPlan {
  const text = raw.trim() || DEFAULT_NOTE;
  const name = pickName(text);
  const age = pickAge(text);
  const breed = pickBreed(text);
  const issues = detectIssues(text);
  const reactive = isReactivity(text, issues);
  const recall = isRecall(text, issues);
  const Name = name.charAt(0).toUpperCase() + name.slice(1);

  const weeklyHomework = reactive
    ? [
        `3× daily engagement games (30–60 sec) — mark and pay the look-back to you.`,
        `Walks: keep ${Name} under threshold. If a scooter/dog appears inside the working distance, increase space first, then ask for engagement.`,
        `Practice pressure/release on a quiet street — release the moment ${Name} softens.`,
        `Film one 20-sec clip of a near-trigger recovery and upload for review.`,
      ]
    : recall
      ? [
          `2× daily recall reps on a long line before any free roam.`,
          `Proof “come” away from a mild distraction (gate bark, distant dog) — mark the turn.`,
          `Keep e-collar communication clear and fair — one cue, one meaning.`,
          `Upload one recall video from a new environment this week.`,
        ]
      : [
          `Short daily manners reps: sit, wait at thresholds, calm greetings.`,
          `Practice loose-lead in low distraction for 5 minutes before the “real” walk.`,
          `Reward calm defaults in the house — catch ${Name} being settled.`,
          `Send Fred one clip of the hardest moment this week.`,
        ];

  const riskNotes = [
    ...(reactive
      ? [
          `Do not flood ${Name} with close triggers — distance is the training tool.`,
          'Owner timing is currently the bottleneck; coach mark-and-pay before adding pressure.',
        ]
      : []),
    ...(issues.includes('escalation risk')
      ? ['Safety flag: review bite/lunge history before park or group work.']
      : []),
    ...(issues.length === 0 ? ['No elevated risk flags from this note.'] : []),
  ];

  const courseMatch = reactive
    ? {
        module: 'Week 2 · Thresholds, engagement & play',
        reason: `${Name}'s scooter/dog reactivity fits the thresholds module before closer work.`,
      }
    : recall
      ? {
          module: 'Module · Recall under distraction',
          reason: 'Session focus maps cleanly to the recall curriculum.',
        }
      : {
          module: 'Module 2 · Loose lead walking',
          reason: 'Foundations session — send the lead-walking lesson + manners checklist.',
        };

  const nextBooking = reactive
    ? {
        offer: 'Reactivity Rewired · continue week plan',
        reason: 'Structured 6-week tracker beats one-off private sessions for this pattern.',
      }
    : recall
      ? {
          offer: 'Recall Mastery · next weekly session',
          reason: 'Keep the 4-week arc tight while proofing under distraction.',
        }
      : {
          offer: 'Private session → 6-Week Obedience if they want structure',
          reason: 'Assessment done; package the foundations into a programme.',
        };

  return {
    clientSummary: `Kia ora — quick notes from today’s session with ${Name}.\n\nWe worked on ${issues.slice(0, 3).join(', ')}. ${
      reactive
        ? `The priority is keeping ${Name} under threshold while you build engagement and cleaner timing.`
        : recall
          ? `The priority is a clean, conflict-free recall so ${Name} can earn more freedom safely.`
          : `The priority is clear communication and short, consistent practice at home.`
    }\n\nHomework for the week is below. Film one short clip if you can — I’ll review it between sessions.\n\n— Fred · Auckland Dog Trainer`,
    dogProfile: { name: Name, age, breed, issues },
    weeklyHomework,
    riskNotes: riskNotes.length ? riskNotes : ['No elevated risk flags from this note.'],
    courseMatch,
    nextBooking,
    trainerHandover: `${Name} · ${age} · ${breed}. Issues: ${issues.join(', ')}. Today: engagement + ${
      reactive ? 'pressure/release at distance' : recall ? 'recall proofing' : 'manners foundations'
    }. Owner note: ${
      /timing|inconsistent/i.test(text) ? 'coach timing before adding complexity.' : 'supportive — keep instructions concrete.'
    } Do not change the method mid-week; follow the homework list and escalate to Fred if a safety flag appears.`,
    followUp: {
      when: /friday|fri\b/i.test(text) ? 'Friday check-in' : '3 days after session',
      message: `How did ${Name}'s practice go this week? Any scooter/dog moments under threshold — or did something feel too close? Reply with a 20-sec clip if you can.`,
    },
    contentIdea: reactive
      ? 'Reel/email: “Why distance is a training tool — not a failure”'
      : recall
        ? 'Post: “Freedom without conflict — what reliable recall actually looks like”'
        : 'FAQ: “Why your dog pulls on the lead (and what to practise this week)”',
  };
}

export { DEFAULT_NOTE };
