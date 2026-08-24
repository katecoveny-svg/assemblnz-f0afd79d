/**
 * The New Zealand government and authority sources assembl watches.
 *
 * This is the canonical, static registry behind the home-page proof bar. The
 * live document/change counts come from the knowledge-base pipeline
 * (see {@link ./regulatory-pulse}); but the *number of sources we watch* is a
 * standing fact, true even when the live pulse is degraded (e.g. local dev with
 * no database). So the big stat on the home page always has an honest figure to
 * show — the live source count when the pipeline is healthy, this count when it
 * is not. We never invent document totals.
 *
 * Every entry here is a real, currently-monitored NZ government department,
 * Crown entity, regulator, or official register. Keep it that way: only add a
 * source once it is genuinely in the watch list.
 */
export interface WatchedSource {
  name: string;
  url: string;
}

export const WATCHED_SOURCES: readonly WatchedSource[] = [
  { name: 'Parliamentary Counsel Office — NZ Legislation', url: 'https://www.legislation.govt.nz/subscribe/recent' },
  { name: 'New Zealand Parliament — Bills API', url: 'https://bills.parliament.nz/' },
  { name: 'New Zealand Parliament — Proposed Members Bills', url: 'https://bills.parliament.nz/proposed-members-bills' },
  { name: 'New Zealand Gazette', url: 'https://gazette.govt.nz/' },
  { name: 'Beehive — Government releases', url: 'https://www.beehive.govt.nz/releases' },
  { name: 'WorkSafe New Zealand', url: 'https://www.worksafe.govt.nz/about-us/news-and-media/' },
  { name: 'Inland Revenue', url: 'https://www.ird.govt.nz/updates' },
  { name: 'MBIE — Employment New Zealand', url: 'https://www.employment.govt.nz/about/news/' },
  { name: 'Waka Kotahi NZ Transport Agency', url: 'https://www.nzta.govt.nz/about-us/news/' },
  { name: 'Ministry for Primary Industries', url: 'https://www.mpi.govt.nz/news/' },
  { name: 'Office of the Privacy Commissioner', url: 'https://privacy.org.nz/' },
  { name: 'Commerce Commission', url: 'https://comcom.govt.nz/news-and-media' },
  { name: 'Companies Office', url: 'https://companies-register.companiesoffice.govt.nz/' },
  { name: 'Reserve Bank of New Zealand', url: 'https://www.rbnz.govt.nz/about-us/news' },
  { name: 'Financial Markets Authority', url: 'https://www.fma.govt.nz/news/' },
  { name: 'Ministry of Education', url: 'https://www.education.govt.nz/news/' },
  { name: 'Education Review Office', url: 'https://ero.govt.nz/our-research' },
  { name: 'Department of Conservation', url: 'https://www.doc.govt.nz/news/' },
  { name: 'MetService — Severe weather warnings', url: 'https://www.metservice.com/warnings/' },
  { name: 'GETS — Government Electronic Tenders Service', url: 'https://www.gets.govt.nz/ExternalIndex.htm' },
  { name: 'New Zealand Customs Service', url: 'https://www.customs.govt.nz/about-us/news/' },
  { name: 'Ministry of Foreign Affairs and Trade', url: 'https://www.mfat.govt.nz/en/trade/' },
  { name: 'Ministry of Health', url: 'https://www.health.govt.nz/news-media' },
  { name: 'Tenancy Services', url: 'https://www.tenancy.govt.nz/about-tenancy-services/news/' },
  { name: 'Employment Relations Authority', url: 'https://www.era.govt.nz/' },
  { name: 'Stats NZ', url: 'https://www.stats.govt.nz/news/' },
  { name: 'data.govt.nz', url: 'https://data.govt.nz/' },
  { name: 'Land Information New Zealand', url: 'https://www.linz.govt.nz/news' },
  { name: 'NZLII — New Zealand case law', url: 'https://www.nzlii.org/nz/cases/' },
] as const;

/** How many NZ government and authority sources assembl watches. */
export const WATCHED_SOURCE_COUNT = WATCHED_SOURCES.length;
