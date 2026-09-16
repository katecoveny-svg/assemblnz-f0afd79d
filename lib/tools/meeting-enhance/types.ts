export type MeetingEnhanceStatus = 'ok' | 'partial';

export type MeetingEnhanceAction = {
  text: string;
  owner: string | null;
  due: string | null;
};

export type MeetingEnhanceDecision = {
  text: string;
};

export type MeetingEnhanceFollowUp = {
  text: string;
  owner: string | null;
};

export type MeetingEnhanceSection = {
  heading: string;
  body: string;
};

export type MeetingEnhanceResult = {
  status: MeetingEnhanceStatus;
  title: string | null;
  summary: string;
  decisions: MeetingEnhanceDecision[];
  actions: MeetingEnhanceAction[];
  followUps: MeetingEnhanceFollowUp[];
  openQuestions: string[];
  sections: MeetingEnhanceSection[];
  adapters: {
    smartNotes: 'sandbox' | 'live' | 'unavailable';
  };
  sandbox: boolean;
  /** Drafts only — never sent */
  draftsOnly: true;
  gaps: string[];
};

export type MeetingEnhanceInput = {
  transcript: string;
  title?: string;
};
