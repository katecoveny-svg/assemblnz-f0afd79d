export type SpecialistSlug = 'retirement' | 'flux' | 'aroha';
export const isSpecialist = (slug: string): slug is SpecialistSlug => ['retirement', 'flux', 'aroha'].includes(slug);
export type SourceDefinition = { id: string; title: string; publisher: string; url: string; topics: string[]; agents: SpecialistSlug[]; kind: 'guidance' | 'legislation' | 'statistics' | 'reform' };
const rv: SpecialistSlug[] = ['retirement'];
const hr: SpecialistSlug[] = ['aroha'];
export const OFFICIAL_SOURCES: SourceDefinition[] = [
  { id: 'village-rights', title: 'Your rights as a retirement village resident', publisher: 'HUD', url: 'https://www.hud.govt.nz/funding-and-support/your-rights-as-a-retirement-village-resident', topics: ['village', 'contract', 'cost', 'fees', 'ora', 'rights', 'law', 'legal', 'visit', 'move'], agents: rv, kind: 'guidance' },
  { id: 'villages-act', title: 'Retirement Villages Act 2003 — latest version', publisher: 'NZ Legislation', url: 'https://www.legislation.govt.nz/act/public/2003/0112/latest/whole.html', topics: ['act', 'law', 'legal', 'contract', 'ora', 'cooling', 'cancel', 'rights', 'dispute'], agents: rv, kind: 'legislation' },
  { id: 'villages-regulations', title: 'Retirement Villages (General) Regulations 2006', publisher: 'NZ Legislation', url: 'https://www.legislation.govt.nz/regulation/public/2006/0298/latest/whole.html', topics: ['regulation', 'disclosure', 'deduction', 'termination', 'ora', 'contract'], agents: rv, kind: 'legislation' },
  { id: 'care-subsidy', title: 'Residential Care Subsidy', publisher: 'Work and Income', url: 'https://www.workandincome.govt.nz/products/a-z-benefits/residential-care-subsidy.html', topics: ['subsidy', 'care', 'asset', 'threshold', 'income', 'gifting', 'funding', 'rest home', 'assessment'], agents: rv, kind: 'guidance' },
  { id: 'care-loan', title: 'Residential Care Loan', publisher: 'Work and Income', url: 'https://www.workandincome.govt.nz/products/a-z-benefits/residential-care-loan.html', topics: ['loan', 'care', 'house', 'assets', 'funding'], agents: rv, kind: 'guidance' },
  { id: 'care-contribution', title: 'Residential care maximum contributions — current regional table', publisher: 'Work and Income', url: 'https://map.workandincome.govt.nz/map/deskfile/extra-help-information/residential-care-subsidy-tables/territorial-local-authority-maximum-contribution-r.html', topics: ['care', 'contribution', 'regional', 'weekly', 'rates', 'rest home'], agents: rv, kind: 'statistics' },
  { id: 'nz-super', title: 'Benefit and NZ Super rates — 1 April 2026 edition', publisher: 'Work and Income', url: 'https://www.workandincome.govt.nz/products/benefit-rates/benefit-rates-april-2026', topics: ['super', 'pension', 'allowance', 'benefit', 'income', 'rates'], agents: rv, kind: 'statistics' },
  { id: 'epa', title: 'Enduring power of attorney', publisher: 'New Zealand Government', url: 'https://www.govt.nz/browse/family-and-whanau/power-of-attorney-enduring-and-ordinary/enduring-power-of-attorney/', topics: ['epa', 'attorney', 'consent', 'capacity', 'decision', 'family', 'parent'], agents: rv, kind: 'guidance' },
  { id: 'sector-evidence', title: 'Retirement village monitoring and reports', publisher: 'Retirement Commission', url: 'https://retirement.govt.nz/retirement-villages/monitoring-and-reports', topics: ['statistics', 'figures', 'residents', 'population', 'sector', 'complaints', 'evidence'], agents: rv, kind: 'statistics' },
  { id: 'village-register', title: 'Retirement village occupation right agreements', publisher: 'Companies Office', url: 'https://www.companiesoffice.govt.nz/all-registers/retirement-villages/registered-documents/occupation-right-agreement/', topics: ['register', 'registration', 'ora', 'agreement', 'disclosure', 'village'], agents: rv, kind: 'guidance' },
  { id: 'village-reform', title: 'Retirement Villages Act review — policy and reform status', publisher: 'HUD', url: 'https://www.hud.govt.nz/our-work/retirement-villages-act-2003', topics: ['reform', 'review', 'change', 'bill', 'proposal', 'repayment'], agents: rv, kind: 'reform' },
  { id: 'care-assessment-law', title: 'Residential Care and Disability Support Services Act 2018 — needs assessment', publisher: 'NZ Legislation', url: 'https://www.legislation.govt.nz/act/public/2018/0033/latest/LMS41589.html', topics: ['nasc', 'assessment', 'needs', 'care', 'rest home'], agents: rv, kind: 'legislation' },
  { id: 'villages-cancellation', title: 'Retirement Villages Act — section 28, cooling-off and cancellation', publisher: 'NZ Legislation', url: 'https://www.legislation.govt.nz/act/public/2003/112/en/latest/sections/DLM220865/', topics: ['cooling', 'cancel', 'delay'], agents: rv, kind: 'legislation' },
  { id: 'village-complaints', title: 'Village complaint figures — October 2025 to March 2026', publisher: 'Retirement Commission', url: 'https://assets.retirement.govt.nz/public/Uploads/Retirement-Villages/Documents-and-white-papers/Retirement_Villages_Report_Oct-2025_Mar_2026.html', topics: ['statistics', 'figures', 'sector', 'complaints', 'registered', 'resolution', 'report'], agents: rv, kind: 'statistics' },
  { id: 'village-code-practice', title: 'Retirement Villages Code of Practice — official guidance', publisher: 'Retirement Commission', url: 'https://retirement.govt.nz/retirement-villages/the-act-regulations-and-codes/code-of-practice', topics: ['code of practice', 'maintenance', 'security', 'emergency', 'transfer', 'operator', 'complaint'], agents: rv, kind: 'guidance' },
  { id: 'village-code-rights', title: 'Code of Residents’ Rights — official guidance', publisher: 'Retirement Commission', url: 'https://retirement.govt.nz/retirement-villages/the-act-regulations-and-codes/code-of-residents-rights', topics: ['code of residents', 'rights', 'resident', 'disclosure'], agents: rv, kind: 'guidance' },
  { id: 'minimum-wage', title: 'Minimum wage rates and types', publisher: 'Employment New Zealand', url: 'https://www.employment.govt.nz/pay-and-hours/pay-and-wages/minimum-wage/minimum-wage-rates-and-types', topics: ['pay', 'salary', 'wage', 'hire', 'cost', 'rates'], agents: hr, kind: 'guidance' },
  { id: 'kiwisaver', title: 'KiwiSaver changes and effective dates', publisher: 'Inland Revenue', url: 'https://www.ird.govt.nz/kiwisaver-changes', topics: ['kiwisaver', 'pay', 'salary', 'contribution', 'hire', 'cost', 'rates'], agents: hr, kind: 'guidance' },
  { id: 'employment-act', title: 'Employment Relations Act 2000 — latest version', publisher: 'NZ Legislation', url: 'https://www.legislation.govt.nz/act/public/2000/0024/latest/whole.html', topics: ['hire', 'agreement', 'contract', 'process', 'dismiss', 'disciplin', 'restructur', 'redundan', 'grievance', 'law', 'trial', 'good faith', 'performance'], agents: hr, kind: 'legislation' },
  { id: 'disciplinary-process', title: 'Disciplinary process', publisher: 'Employment New Zealand', url: 'https://www.employment.govt.nz/resolving-problems/how-to-resolve-problems/disciplinary-process/disciplinary-process', topics: ['disciplin', 'misconduct', 'dismiss', 'warning', 'concern', 'allegation', 'performance'], agents: hr, kind: 'guidance' },
  { id: 'workplace-change', title: 'Workplace change process', publisher: 'Employment New Zealand', url: 'https://www.employment.govt.nz/fair-work-practices/restructuring-and-workplace-change/workplace-change-process', topics: ['restructur', 'redundan', 'consult', 'workplace change', 'proposal', 'redeploy'], agents: hr, kind: 'guidance' },
  { id: 'holidays-act', title: 'Holidays Act 2003 — latest version', publisher: 'NZ Legislation', url: 'https://www.legislation.govt.nz/act/public/2003/0129/latest/whole.html', topics: ['leave', 'holiday', 'sick', 'bereavement', 'pay', 'entitle'], agents: hr, kind: 'legislation' },
];

export function selectSources(slug: SpecialistSlug, query: string, limit = 4): SourceDefinition[] {
  const q = query.toLowerCase();
  const ranked = OFFICIAL_SOURCES.filter(s => s.agents.includes(slug))
    .map((s, index) => ({ s, index, score: s.topics.reduce((n, t) => n + (q.includes(t) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  // Avoid fetching unrelated full Acts to pad out a narrow wage or funding question.
  const relevant = ranked.filter(x => x.score > 0);
  const priorityIds = slug === 'retirement' ? [
    ...(/cooling|cancel/.test(q) ? ['villages-cancellation'] : []),
    ...(/reform|propos|amend|law changes?/.test(q) ? ['village-reform'] : []),
  ] : [];
  const priority = priorityIds.flatMap(id => OFFICIAL_SOURCES.filter(s => s.id === id));
  return [...priority, ...(relevant.length ? relevant : ranked).map(x => x.s).filter(s => !priorityIds.includes(s.id))].slice(0, limit);
}
