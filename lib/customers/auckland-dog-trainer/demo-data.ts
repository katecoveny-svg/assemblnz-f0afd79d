/**
 * Fred OS — Auckland Dog Trainer concept demo data.
 *
 * SAMPLE only. Programme names track aucklanddogtrainer.com; pricing and
 * Reactivity Rewired / online course slots come from the pitch brief and are
 * tagged SAMPLE so nothing reads as a live quote.
 */

export type Urgency = 'routine' | 'soon' | 'urgent' | 'safety';
export type OfferSlug =
  | 'private'
  | 'obedience-6w'
  | 'recall'
  | 'reactivity'
  | 'board-train'
  | 'boutique-board'
  | 'course';

export type Lead = {
  id: string;
  owner: string;
  dog: string;
  breed: string;
  age: string;
  suburb: string;
  issues: string[];
  triage: string;
  recommended: OfferSlug;
  urgency: Urgency;
  source: string;
  receivedAt: string;
};

export type DogProfile = {
  id: string;
  name: string;
  breed: string;
  age: string;
  owner: string;
  suburb: string;
  programme: OfferSlug;
  week: number;
  weeksTotal: number;
  triggers: string[];
  goals: string[];
  riskNotes: string[];
  homeworkDone: boolean;
  nextSession: string;
  lastWin: string;
};

export type Programme = {
  slug: OfferSlug;
  name: string;
  weeks: number | null;
  priceSample: string;
  blurb: string;
  activeDogs: number;
};

export type CourseModule = {
  id: string;
  title: string;
  status: 'live' | 'draft' | 'gap';
  lessons: number;
  fromSession?: string;
};

export type SupportMessage = {
  id: string;
  from: string;
  dog: string;
  preview: string;
  bucket: 'urgent' | 'needs-fred' | 'course-answer' | 'booking';
  at: string;
};

export type Applicant = {
  id: string;
  name: string;
  score: number;
  experience: string;
  methodFit: string;
  stage: 'screen' | 'interview' | 'trial' | 'onboarding';
};

export const OFFERS: Record<
  OfferSlug,
  { label: string; short: string; priceSample: string }
> = {
  private: {
    label: 'Private In-Home Session',
    short: 'Private',
    priceSample: '$299 + GST',
  },
  'obedience-6w': {
    label: '6-Week Obedience & Manners',
    short: 'Obedience',
    priceSample: 'programme · SAMPLE',
  },
  recall: {
    label: 'Recall Mastery',
    short: 'Recall',
    priceSample: '$1,750 + GST',
  },
  reactivity: {
    label: 'Reactivity Rewired',
    short: 'Reactivity',
    priceSample: '$2,200 + GST',
  },
  'board-train': {
    label: 'Perfect Dog Board & Train',
    short: 'Board & Train',
    priceSample: '$4,500 + GST',
  },
  'boutique-board': {
    label: 'Boutique Boarding',
    short: 'Boarding',
    priceSample: 'stay · SAMPLE',
  },
  course: {
    label: 'Online Course',
    short: 'Course',
    priceSample: 'coming · SAMPLE',
  },
};

export const LEADS: Lead[] = [
  {
    id: 'lead-bruno',
    owner: 'Sam & Jess',
    dog: 'Bruno',
    breed: 'Staffy mix',
    age: '2y',
    suburb: 'Ponsonby',
    issues: ['scooter reactivity', 'dog reactivity', 'timing'],
    triage: 'Reactivity within ~10 m of scooters and dogs. Owner timing inconsistent. Not a bite-history case — programme fit, not emergency referral.',
    recommended: 'reactivity',
    urgency: 'soon',
    source: 'Instagram DM',
    receivedAt: 'Today · 07:42',
  },
  {
    id: 'lead-luna',
    owner: 'Priya',
    dog: 'Luna',
    breed: 'Labrador',
    age: '18m',
    suburb: 'Grey Lynn',
    issues: ['lead pulling', 'jumps on guests', 'reward inconsistency'],
    triage: 'Foundations + manners. Private assessment first, then 6-week obedience if they want structure.',
    recommended: 'obedience-6w',
    urgency: 'routine',
    source: 'Website form',
    receivedAt: 'Yesterday · 18:10',
  },
  {
    id: 'lead-alpha',
    owner: 'Luarell',
    dog: 'Alpha',
    breed: 'Rottweiler',
    age: '4y',
    suburb: 'West Auckland',
    issues: ['dog reactivity', 'selective recall', 'park freedom'],
    triage: 'Classic Recall Mastery candidate — wants off-leash freedom with reliable communication.',
    recommended: 'recall',
    urgency: 'soon',
    source: 'Referral',
    receivedAt: 'Mon · 09:05',
  },
  {
    id: 'lead-cyrus',
    owner: 'J family',
    dog: 'Cyrus',
    breed: 'Border Collie',
    age: '5m',
    suburb: 'Central Auckland',
    issues: ['passersby reactivity', 'aggression on walks', 'prior puppy school failed'],
    triage: 'Adolescent reactivity escalating. Flag for private path + full-family attendance. Safety notes required before group or park work.',
    recommended: 'private',
    urgency: 'urgent',
    source: 'Dog park intro',
    receivedAt: 'Sun · 16:40',
  },
  {
    id: 'lead-beau',
    owner: 'Mariah',
    dog: 'Beau',
    breed: 'Mixed',
    age: '3y',
    suburb: 'Auckland',
    issues: ['holiday care', 'light recall top-up'],
    triage: 'Boutique boarding with optional manners reinforcement while owners travel.',
    recommended: 'boutique-board',
    urgency: 'routine',
    source: 'Repeat client',
    receivedAt: 'Sat · 11:20',
  },
];

export const DOGS: DogProfile[] = [
  {
    id: 'dog-bruno',
    name: 'Bruno',
    breed: 'Staffy mix',
    age: '2y',
    owner: 'Sam & Jess',
    suburb: 'Ponsonby',
    programme: 'reactivity',
    week: 2,
    weeksTotal: 6,
    triggers: ['scooters', 'dogs within 10 m', 'sudden bike pass'],
    goals: ['calm engagement at threshold', 'pressure/release basics', 'safer walks'],
    riskNotes: ['Do not flood with close triggers', 'Owner timing is the bottleneck'],
    homeworkDone: false,
    nextSession: 'Thu 10:00 · Western Springs',
    lastWin: 'Looked back to handler at 12 m from a scooter',
  },
  {
    id: 'dog-diesel',
    name: 'Diesel',
    breed: 'Large mix',
    age: '2y',
    owner: 'Nirtika',
    suburb: 'Central',
    programme: 'recall',
    week: 3,
    weeksTotal: 4,
    triggers: ['other dogs at play', 'selective hearing off-leash'],
    goals: ['reliable recall under distraction', 'loose lead', 'impulse control'],
    riskNotes: ['Keep e-collar communication ethical and clear', 'Practice before free roam'],
    homeworkDone: true,
    nextSession: 'Fri 16:30 · local park',
    lastWin: 'Recalled away from barking gate dogs',
  },
  {
    id: 'dog-raymond',
    name: 'Raymond',
    breed: 'Poodle',
    age: '1y',
    owner: 'Rebecca',
    suburb: 'Auckland',
    programme: 'obedience-6w',
    week: 4,
    weeksTotal: 6,
    triggers: ['guest excitement', 'silly adolescent energy'],
    goals: ['household manners', 'settle', 'polite greetings'],
    riskNotes: ['Keep sessions short and clear'],
    homeworkDone: true,
    nextSession: 'Wed 17:00 · home',
    lastWin: 'Waited at threshold without rushing',
  },
  {
    id: 'dog-tank',
    name: 'Tank',
    breed: 'Mixed',
    age: '3y',
    owner: 'Hunta',
    suburb: 'West',
    programme: 'recall',
    week: 4,
    weeksTotal: 4,
    triggers: ['ignoring cues', 'impulse control gaps'],
    goals: ['house dog manners', 'recall', 'calm default'],
    riskNotes: [],
    homeworkDone: true,
    nextSession: 'Handover pack · this week',
    lastWin: 'Became a reliable house dog in 4 weeks',
  },
];

export const PROGRAMMES: Programme[] = [
  {
    slug: 'private',
    name: 'Private In-Home Session',
    weeks: null,
    priceSample: '$299 + GST',
    blurb: 'Assessment + success plan + custom homework. Triage into the right programme.',
    activeDogs: 3,
  },
  {
    slug: 'obedience-6w',
    name: '6-Week Obedience & Manners',
    weeks: 6,
    priceSample: 'programme · SAMPLE',
    blurb: 'Foundations, impulse control, real-life manners — weekly sessions + lifetime online support.',
    activeDogs: 5,
  },
  {
    slug: 'recall',
    name: 'Recall Mastery',
    weeks: 4,
    priceSample: '$1,750 + GST',
    blurb: 'Ethical e-collar communication for off-leash freedom without conflict.',
    activeDogs: 4,
  },
  {
    slug: 'reactivity',
    name: 'Reactivity Rewired',
    weeks: 6,
    priceSample: '$2,200 + GST',
    blurb: 'Trigger/threshold tracker, safety notes, weekly plans for reactive dog–human teams.',
    activeDogs: 2,
  },
  {
    slug: 'board-train',
    name: 'Perfect Dog Board & Train',
    weeks: 3,
    priceSample: '$4,500 + GST',
    blurb: 'Intensive live-in training with daily owner updates and a handover pack.',
    activeDogs: 1,
  },
  {
    slug: 'course',
    name: 'Online Course',
    weeks: null,
    priceSample: 'building · SAMPLE',
    blurb: 'Turn Fred’s method into modules, worksheets, and student support — with upsells to private help.',
    activeDogs: 0,
  },
];

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'm1',
    title: 'Puppy foundations & household manners',
    status: 'draft',
    lessons: 4,
    fromSession: 'Raymond W2 notes',
  },
  {
    id: 'm2',
    title: 'Loose lead walking',
    status: 'live',
    lessons: 5,
    fromSession: 'Luna private session',
  },
  {
    id: 'm3',
    title: 'Thresholds, engagement & play',
    status: 'draft',
    lessons: 3,
    fromSession: 'Bruno W2 voice note',
  },
  {
    id: 'm4',
    title: 'Recall under distraction',
    status: 'live',
    lessons: 6,
    fromSession: 'Diesel W3',
  },
  {
    id: 'm5',
    title: 'Reactivity: distance, timing, recovery',
    status: 'gap',
    lessons: 0,
  },
  {
    id: 'm6',
    title: 'Calmness & enrichment at home',
    status: 'gap',
    lessons: 0,
  },
];

export const SUPPORT_INBOX: SupportMessage[] = [
  {
    id: 'sup-1',
    from: 'Jess',
    dog: 'Bruno',
    preview: 'Scooter came past at ~8 m today and he lunged — what should we do differently?',
    bucket: 'needs-fred',
    at: '08:14',
  },
  {
    id: 'sup-2',
    from: 'Priya',
    dog: 'Luna',
    preview: 'Is it ok to practice sit-stay with guests this weekend?',
    bucket: 'course-answer',
    at: 'Yesterday',
  },
  {
    id: 'sup-3',
    from: 'New enquiry',
    dog: 'Unknown',
    preview: 'Dog bit a visitor’s sleeve yesterday. Can you help?',
    bucket: 'urgent',
    at: '21:02',
  },
  {
    id: 'sup-4',
    from: 'Nirtika',
    dog: 'Diesel',
    preview: 'Ready to book the advanced recall top-up after the course?',
    bucket: 'booking',
    at: 'Mon',
  },
];

export const APPLICANTS: Applicant[] = [
  {
    id: 'app-1',
    name: 'Maya Chen',
    score: 86,
    experience: '3 yrs private + daycare',
    methodFit: 'Strong on engagement & timing; needs e-collar ethics module',
    stage: 'interview',
  },
  {
    id: 'app-2',
    name: 'Tom R.',
    score: 62,
    experience: '1 yr group classes',
    methodFit: 'Positive-only background — method gap on balanced communication',
    stage: 'screen',
  },
  {
    id: 'app-3',
    name: 'Aroha W.',
    score: 91,
    experience: '5 yrs behaviour + boarding',
    methodFit: 'Excellent handler calm; trial session booked',
    stage: 'trial',
  },
];

export const REVENUE_SAMPLE = {
  leadsThisWeek: 5,
  bookingsPending: 3,
  activeProgrammes: 12,
  courseWaitlist: 18,
  trainerCapacity: 'Fred at 92% · second trainer needed',
  repeatClients: '41%',
};

export const SAMPLE_VOICE_NOTE = `Met Bruno today. Two-year-old staffy mix. Reactive to scooters and dogs within ten metres. Owner struggles with timing. Started engagement work and pressure/release basics. Homework: three short engagement sessions daily, mark the look-back, keep distance from scooters. Suggest Reactivity Rewired week 2 thresholds module. Follow up Friday.`;
