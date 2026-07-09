/**
 * Fred OS — extended command-centre demo data.
 * SAMPLE only. Offers track aucklanddogtrainer.com + pitch brief pricing.
 */

export type Urgency = 'routine' | 'soon' | 'urgent' | 'safety';
export type OfferSlug =
  | 'private'
  | 'obedience-6w'
  | 'recall'
  | 'reactivity'
  | 'board-train'
  | 'boutique-board'
  | 'bootcamp'
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
  riskLevel: 'low' | 'medium' | 'high';
  source: string;
  receivedAt: string;
  draftReply?: string;
  explainerVideo?: string;
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
  videosPending: number;
  timeSpentHrs: number;
  revenueSample: string;
  paymentStatus: 'paid' | 'deposit' | 'due';
};

export type Programme = {
  slug: OfferSlug;
  name: string;
  weeks: number | null;
  priceSample: string;
  blurb: string;
  activeDogs: number;
  curriculum: Array<{ week: number; title: string; ownerTask: string; video?: string }>;
};

export type CourseModule = {
  id: string;
  title: string;
  status: 'live' | 'draft' | 'gap';
  lessons: number;
  fromSession?: string;
  scriptReady?: boolean;
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

export type ChallengeCard = {
  id: string;
  title: string;
  blurb: string;
  mapsTo: OfferSlug;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: Array<{ id: string; label: string; weight: OfferSlug }>;
};

export type AgentMeshItem = {
  id: string;
  name: string;
  job: string;
  status: 'live' | 'drafting' | 'watching';
};

export type WeekBlock = {
  id: string;
  when: string;
  kind: 'session' | 'travel' | 'admin' | 'follow-up' | 'content' | 'hiring';
  title: string;
  mins: number;
};

export type VideoUpload = {
  id: string;
  dog: string;
  title: string;
  summary: string;
  needsFred: boolean;
  homework: string;
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
  bootcamp: {
    label: 'Group Bootcamp',
    short: 'Bootcamp',
    priceSample: 'launching · SAMPLE',
  },
  course: {
    label: 'Online Course',
    short: 'Course',
    priceSample: 'coming · SAMPLE',
  },
};

export const CHALLENGES: ChallengeCard[] = [
  {
    id: 'reacts',
    title: 'My dog reacts to other dogs',
    blurb: 'Lunging, barking, scooters, bikes — walks feel stressful.',
    mapsTo: 'reactivity',
  },
  {
    id: 'recall',
    title: 'My dog won’t come back',
    blurb: 'Selective hearing off-leash. You want freedom without conflict.',
    mapsTo: 'recall',
  },
  {
    id: 'home',
    title: 'I need help at home',
    blurb: 'Pulling, jumping, manners, household chaos.',
    mapsTo: 'obedience-6w',
  },
  {
    id: 'full',
    title: 'I want full training support',
    blurb: 'Intensive live-in training with daily updates and a handover pack.',
    mapsTo: 'board-train',
  },
  {
    id: 'group',
    title: 'We want to train with other dogs',
    blurb: 'NEW Group Bootcamp — Saturday intensives, real-world proofing as a pack.',
    mapsTo: 'bootcamp',
  },
  {
    id: 'unsure',
    title: 'I’m not sure yet',
    blurb: 'Start with a private assessment — Fred maps the right path.',
    mapsTo: 'private',
  },
];

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'What’s the biggest challenge right now?',
    options: [
      { id: 'a', label: 'Reacts to dogs / scooters / people', weight: 'reactivity' },
      { id: 'b', label: 'Won’t come when called', weight: 'recall' },
      { id: 'c', label: 'Pulling, jumping, manners at home', weight: 'obedience-6w' },
      { id: 'd', label: 'Need intensive help while I’m busy', weight: 'board-train' },
    ],
  },
  {
    id: 'q2',
    prompt: 'Any bite history or serious escalation?',
    options: [
      { id: 'a', label: 'No', weight: 'private' },
      { id: 'b', label: 'Growling / lunging only', weight: 'reactivity' },
      { id: 'c', label: 'Yes — contact skin or clothing', weight: 'private' },
    ],
  },
  {
    id: 'q3',
    prompt: 'What does success look like in 4–6 weeks?',
    options: [
      { id: 'a', label: 'Calmer walks past triggers', weight: 'reactivity' },
      { id: 'b', label: 'Reliable off-leash recall', weight: 'recall' },
      { id: 'c', label: 'Polite house dog', weight: 'obedience-6w' },
      { id: 'd', label: 'Done-for-you training', weight: 'board-train' },
    ],
  },
];

export const AGENT_MESH: AgentMeshItem[] = [
  { id: 'intake', name: 'Intake Agent', job: 'Reads enquiry forms → dog/client profiles', status: 'live' },
  { id: 'pathway', name: 'Pathway Agent', job: 'Recommends the right Fred offer', status: 'live' },
  { id: 'risk', name: 'Risk Agent', job: 'Flags bite history, aggression, child safety', status: 'watching' },
  { id: 'scribe', name: 'Session Scribe', job: 'Voice notes → CRM + client summaries', status: 'live' },
  { id: 'homework', name: 'Homework Agent', job: 'Weekly owner tasks', status: 'live' },
  { id: 'video', name: 'Video Review Agent', job: 'Summarises clips; queues Fred checks', status: 'drafting' },
  { id: 'support', name: 'Support Agent', job: 'Answers repeats from Fred’s material', status: 'live' },
  { id: 'course', name: 'Course Agent', job: 'Lessons, worksheets, Google Vids scripts', status: 'drafting' },
  { id: 'content', name: 'Content Agent', job: 'Posts, emails, course promos from issues', status: 'watching' },
  { id: 'time', name: 'Time Agent', job: 'Calendar, travel, admin debt, capacity', status: 'live' },
  { id: 'hiring', name: 'Hiring Agent', job: 'Screens applicants + onboarding plans', status: 'watching' },
];

export const WEEK_BLOCKS: WeekBlock[] = [
  { id: 'w1', when: 'Thu 09:20', kind: 'travel', title: 'Drive to Western Springs', mins: 28 },
  { id: 'w2', when: 'Thu 10:00', kind: 'session', title: 'Bruno · Reactivity W2', mins: 75 },
  { id: 'w3', when: 'Thu 12:10', kind: 'admin', title: 'Session notes + homework drafts', mins: 35 },
  { id: 'w4', when: 'Thu 15:00', kind: 'follow-up', title: 'Jess — scooter clip review', mins: 20 },
  { id: 'w5', when: 'Fri 09:00', kind: 'session', title: 'Diesel · Recall W3', mins: 75 },
  { id: 'w6', when: 'Fri 14:00', kind: 'content', title: 'Course Studio · thresholds lesson', mins: 45 },
  { id: 'w7', when: 'Sat 10:00', kind: 'hiring', title: 'Aroha trial session scorecard', mins: 90 },
];

export const VIDEO_UPLOADS: VideoUpload[] = [
  {
    id: 'vid-1',
    dog: 'Bruno',
    title: 'Walk clip · scooter at ~8 m',
    summary: 'Handler marked late; Bruno lunged once then recovered after space increased.',
    needsFred: true,
    homework: 'Practice look-back at 12 m+ before closer scooter work.',
  },
  {
    id: 'vid-2',
    dog: 'Diesel',
    title: 'Recall away from gate bark',
    summary: 'Clean turn on first cue. Ready to proof in a busier park.',
    needsFred: false,
    homework: 'Two long-line recalls in a new environment this week.',
  },
];

export const FAQ_VIDEOS = [
  { id: 'f1', q: 'What is reactivity?', dur: '0:48' },
  { id: 'f2', q: 'Will this work for my dog?', dur: '1:02' },
  { id: 'f3', q: 'What happens after the programme?', dur: '0:55' },
  { id: 'f4', q: 'Do I need a private session first?', dur: '0:41' },
];

export const LEADS: Lead[] = [
  {
    id: 'lead-killer',
    owner: 'Alex & Mo',
    dog: 'Nova',
    breed: 'Kelpie cross',
    age: '20m',
    suburb: 'Mt Eden',
    issues: ['dog reactivity', 'bike lunging', 'walks avoided'],
    triage:
      'Classic Reactivity Rewired fit. No bite history. Owner timing needs coaching. Private assessment optional but programme path is clear.',
    recommended: 'reactivity',
    urgency: 'soon',
    riskLevel: 'medium',
    source: 'Landing quiz',
    receivedAt: 'Just now',
    draftReply:
      'Kia ora Alex & Mo — thanks for the quiz about Nova. From what you’ve shared, Reactivity Rewired is the cleanest path: six weeks of threshold work, engagement, and safer walks. I’ve reserved a private assessment slot so we can confirm fit. Draft only — Fred will send.',
    explainerVideo: 'Understanding thresholds (Reactivity W2)',
  },
  {
    id: 'lead-bruno',
    owner: 'Sam & Jess',
    dog: 'Bruno',
    breed: 'Staffy mix',
    age: '2y',
    suburb: 'Ponsonby',
    issues: ['scooter reactivity', 'dog reactivity', 'timing'],
    triage:
      'Reactivity within ~10 m of scooters and dogs. Owner timing inconsistent. Not a bite-history case — programme fit, not emergency referral.',
    recommended: 'reactivity',
    urgency: 'soon',
    riskLevel: 'medium',
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
    riskLevel: 'low',
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
    riskLevel: 'medium',
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
    triage:
      'Adolescent reactivity escalating. Flag for private path + full-family attendance. Safety notes required before group or park work.',
    recommended: 'private',
    urgency: 'urgent',
    riskLevel: 'high',
    source: 'Dog park intro',
    receivedAt: 'Sun · 16:40',
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
    videosPending: 1,
    timeSpentHrs: 6.5,
    revenueSample: '$2,200',
    paymentStatus: 'paid',
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
    riskNotes: ['Keep e-collar communication ethical and clear'],
    homeworkDone: true,
    nextSession: 'Fri 16:30 · local park',
    lastWin: 'Recalled away from barking gate dogs',
    videosPending: 0,
    timeSpentHrs: 5.0,
    revenueSample: '$1,750',
    paymentStatus: 'paid',
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
    riskNotes: [],
    homeworkDone: true,
    nextSession: 'Wed 17:00 · home',
    lastWin: 'Waited at threshold without rushing',
    videosPending: 0,
    timeSpentHrs: 4.0,
    revenueSample: 'programme',
    paymentStatus: 'deposit',
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
    videosPending: 0,
    timeSpentHrs: 7.0,
    revenueSample: '$1,750',
    paymentStatus: 'paid',
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
    curriculum: [
      { week: 1, title: 'Assessment & success plan', ownerTask: 'Film one hard moment this week' },
    ],
  },
  {
    slug: 'obedience-6w',
    name: '6-Week Obedience & Manners',
    weeks: 6,
    priceSample: 'programme · SAMPLE',
    blurb: 'Foundations, impulse control, real-life manners — weekly sessions + lifetime online support.',
    activeDogs: 5,
    curriculum: [
      { week: 1, title: 'Communication basics', ownerTask: 'Short daily sit/wait reps' },
      { week: 2, title: 'Loose lead foundations', ownerTask: '5-min low-distraction lead work', video: 'Loose lead walking' },
      { week: 3, title: 'Thresholds & settle', ownerTask: 'Wait at every doorway' },
      { week: 4, title: 'Guest manners', ownerTask: 'Practice calm greetings' },
      { week: 5, title: 'Impulse control outdoors', ownerTask: 'One park session with long line' },
      { week: 6, title: 'Handover & maintenance', ownerTask: 'Keep the weekly checklist' },
    ],
  },
  {
    slug: 'recall',
    name: 'Recall Mastery',
    weeks: 4,
    priceSample: '$1,750 + GST',
    blurb: 'Ethical e-collar communication for off-leash freedom without conflict.',
    activeDogs: 4,
    curriculum: [
      { week: 1, title: 'Engagement & cue meaning', ownerTask: '2× daily long-line recalls' },
      { week: 2, title: 'Mild distraction proofing', ownerTask: 'Recall away from gate bark', video: 'Recall under distraction' },
      { week: 3, title: 'New environments', ownerTask: 'Upload one new-park clip' },
      { week: 4, title: 'Freedom with standards', ownerTask: 'Maintenance plan' },
    ],
  },
  {
    slug: 'reactivity',
    name: 'Reactivity Rewired',
    weeks: 6,
    priceSample: '$2,200 + GST',
    blurb: 'Trigger/threshold tracker, safety notes, weekly plans for reactive dog–human teams.',
    activeDogs: 2,
    curriculum: [
      { week: 1, title: 'Map triggers & distance', ownerTask: 'Log three walks with distance notes' },
      { week: 2, title: 'Understanding thresholds', ownerTask: 'Engagement at distance', video: 'Understanding thresholds' },
      { week: 3, title: 'Pressure/release basics', ownerTask: 'Quiet-street softens' },
      { week: 4, title: 'Moving-object triggers', ownerTask: 'Scooter/bike distance work' },
      { week: 5, title: 'Recovery after a spike', ownerTask: 'Upload a recovery clip' },
      { week: 6, title: 'Maintenance & freedom plan', ownerTask: 'Keep threshold habits' },
    ],
  },
  {
    slug: 'board-train',
    name: 'Perfect Dog Board & Train',
    weeks: 3,
    priceSample: '$4,500 + GST',
    blurb: 'Intensive live-in training with daily owner updates and a handover pack.',
    activeDogs: 1,
    curriculum: [
      { week: 1, title: 'Structure & calm defaults', ownerTask: 'Watch daily update clips' },
      { week: 2, title: 'Lead, recall, manners', ownerTask: 'Mid-stay check-in call' },
      { week: 3, title: 'Handover pack', ownerTask: 'Owner training day' },
    ],
  },
  {
    slug: 'bootcamp',
    name: 'Group Bootcamp',
    weeks: 4,
    priceSample: 'launching · SAMPLE',
    blurb: 'NEW — small-group Saturday intensives: obedience, lead work, and real-world manners around other dogs. Fred coaches the humans; the group proofs the dogs.',
    activeDogs: 0,
    curriculum: [
      { week: 1, title: 'Group foundations & engagement', ownerTask: 'Daily 5-min engagement reps before meals' },
      { week: 2, title: 'Lead work around other dogs', ownerTask: 'One quiet-street walk using the group protocol' },
      { week: 3, title: 'Distraction proofing as a pack', ownerTask: 'Film one park pass-by for review' },
      { week: 4, title: 'Real-world graduation walk', ownerTask: 'Keep the weekly group checklist' },
    ],
  },
  {
    slug: 'course',
    name: 'Online Course',
    weeks: null,
    priceSample: 'building · SAMPLE',
    blurb: 'Turn Fred’s method into modules, worksheets, and student support — with upsells to private help.',
    activeDogs: 0,
    curriculum: [],
  },
];

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'm1',
    title: 'Puppy foundations & household manners',
    status: 'draft',
    lessons: 4,
    fromSession: 'Raymond W2 notes',
    scriptReady: true,
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
    scriptReady: true,
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

export const TIME_COCKPIT = {
  capacityPct: 92,
  sessionsToday: 2,
  travelMins: 48,
  adminDebtMins: 95,
  unpaidSupportMins: 40,
  followUpsDue: 3,
  contentBlocks: 1,
  nextBestActions: [
    'Approve Nova enquiry reply (Reactivity Rewired + thresholds video)',
    'Review Bruno scooter clip — Video Review queued',
    'Send Diesel Friday check-in',
  ],
  timeLeakage: [
    { label: 'Repeated “what is a threshold?” questions', mins: 55, course: 'Course lesson' },
    { label: 'Unpaid WhatsApp support', mins: 40, action: 'Support Agent + FAQ clip' },
    { label: 'Manual homework emails', mins: 70, action: 'Session Scribe → auto draft' },
  ],
};

export const REVENUE_SAMPLE = {
  leadsThisWeek: 5,
  bookingsPending: 3,
  activeProgrammes: 12,
  courseWaitlist: 18,
  trainerCapacity: 'Fred at 92% · second trainer needed',
  repeatClients: '41%',
};

export const SAMPLE_VOICE_NOTE = `Met Bruno today. Two-year-old staffy mix. Reactive to scooters and dogs within ten metres. Owner struggles with timing. Started engagement work and pressure/release basics. Homework: three short engagement sessions daily, mark the look-back, keep distance from scooters. Suggest Reactivity Rewired week 2 thresholds module. Follow up Friday.`;

export const COURSE_STUDIO_DRAFT = {
  module: 'Reactivity Rewired: Week 2',
  lessonTitle: 'Understanding thresholds',
  outline: [
    'What a threshold is (in plain language)',
    'Why distance is a training tool',
    'How to mark engagement before the spike',
    'Owner mistake: flooding with close triggers',
  ],
  script:
    'Today we’re talking thresholds — the distance where your dog can still think. If Nova or Bruno goes over threshold, training stops working. Your job this week is simple: stay far enough that they can look back to you…',
  ownerTask: 'Track distance before reaction on three walks',
  worksheet: 'Threshold distance log · 7-day grid',
  googleVidsPrompt:
    'Storyboard a 90-sec training lesson: title Understanding thresholds, B-roll of calm walk at distance, on-camera Fred intro/outro, lower-third: “Distance is a tool”.',
};
