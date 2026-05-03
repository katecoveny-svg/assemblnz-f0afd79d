// Curriculum-matched resource links for NZ schooling, indexed by year level.
// Sources are official/free where possible: Khan Academy, Education Perfect free tier,
// NZ Maths, Science Learning Hub, Kiwi Kids News, NZQA. NCEA-aligned at Y11–13.

export interface ResourceLink {
  title: string;
  description: string;
  url: string;
  subject: string;
  source: string;
}

interface YearBand {
  label: string;
  yearLevels: number[];
  ncea?: number;
  resources: ResourceLink[];
}

export const CURRICULUM_BANDS: YearBand[] = [
  {
    label: "Years 1–3 · Foundation",
    yearLevels: [1, 2, 3],
    resources: [
      { title: "NZ Maths — Junior", description: "Curriculum-aligned activities for early numeracy.", url: "https://nzmaths.co.nz/resource-finder", subject: "Maths", source: "NZ Maths" },
      { title: "Reading Eggs (free trial)", description: "Phonics and early reading for ages 5–7.", url: "https://readingeggs.co.nz", subject: "English", source: "Reading Eggs" },
      { title: "Khan Academy Kids", description: "Free reading, maths and social-emotional learning.", url: "https://learn.khanacademy.org/khan-academy-kids/", subject: "Mixed", source: "Khan Academy" },
      { title: "Science Learning Hub — Pīpī", description: "Hands-on science for primary tamariki.", url: "https://www.sciencelearn.org.nz/pipi", subject: "Science", source: "Science Learning Hub" },
    ],
  },
  {
    label: "Years 4–6 · Middle Primary",
    yearLevels: [4, 5, 6],
    resources: [
      { title: "NZ Maths — Level 2–3", description: "Problem-solving units that match NZ Curriculum L2–3.", url: "https://nzmaths.co.nz/resource-finder", subject: "Maths", source: "NZ Maths" },
      { title: "Khan Academy — Maths", description: "Free practice for fractions, decimals, geometry.", url: "https://www.khanacademy.org/math", subject: "Maths", source: "Khan Academy" },
      { title: "Kiwi Kids News", description: "Daily NZ news at a child-friendly reading level.", url: "https://www.kiwikidsnews.co.nz", subject: "English", source: "Kiwi Kids News" },
      { title: "Te Ara — NZ Encyclopedia (Junior)", description: "Research-ready articles on Aotearoa.", url: "https://teara.govt.nz", subject: "Social Studies", source: "Te Ara" },
      { title: "Science Learning Hub", description: "Investigations and videos on NZ ecosystems.", url: "https://www.sciencelearn.org.nz", subject: "Science", source: "Science Learning Hub" },
    ],
  },
  {
    label: "Years 7–8 · Intermediate",
    yearLevels: [7, 8],
    resources: [
      { title: "Khan Academy — Pre-algebra", description: "Bridges Year 8 maths into Year 9.", url: "https://www.khanacademy.org/math/pre-algebra", subject: "Maths", source: "Khan Academy" },
      { title: "BBC Bitesize — KS3", description: "Free explainers across Y7–8 subjects.", url: "https://www.bbc.co.uk/bitesize/levels/zbr9wmn", subject: "Mixed", source: "BBC Bitesize" },
      { title: "NZ Maths — Level 4", description: "Number, algebra, geometry units for Y7–8.", url: "https://nzmaths.co.nz/level-4-units", subject: "Maths", source: "NZ Maths" },
      { title: "Stuff — School News", description: "Current events for class discussion.", url: "https://www.stuff.co.nz/national/education", subject: "Social Studies", source: "Stuff" },
      { title: "Science Learning Hub — Pou", description: "Intermediate-level NZ science contexts.", url: "https://www.sciencelearn.org.nz/pou", subject: "Science", source: "Science Learning Hub" },
    ],
  },
  {
    label: "Years 9–10 · Junior Secondary",
    yearLevels: [9, 10],
    resources: [
      { title: "Khan Academy — Algebra 1", description: "Solid prep for NCEA Level 1 maths.", url: "https://www.khanacademy.org/math/algebra", subject: "Maths", source: "Khan Academy" },
      { title: "StudyIt", description: "NZQA-backed study site for secondary students.", url: "https://www.studyit.org.nz", subject: "Mixed", source: "StudyIt" },
      { title: "Education Perfect (school login)", description: "If your school subscribes — languages, science, maths.", url: "https://www.educationperfect.com", subject: "Mixed", source: "Education Perfect" },
      { title: "Crash Course on YouTube", description: "World History, Biology, Chemistry — Y9–10 friendly.", url: "https://www.youtube.com/user/crashcourse", subject: "Mixed", source: "Crash Course" },
      { title: "NZ Geographic — for Schools", description: "Long-form NZ geography and environment articles.", url: "https://www.nzgeo.com", subject: "Social Studies", source: "NZ Geographic" },
    ],
  },
  {
    label: "Year 11 · NCEA Level 1",
    yearLevels: [11],
    ncea: 1,
    resources: [
      { title: "NZQA — NCEA Level 1 Standards", description: "Official assessment specifications.", url: "https://www.nzqa.govt.nz/ncea/subjects/", subject: "All", source: "NZQA" },
      { title: "StudyIt — Level 1", description: "Past exam questions and study notes.", url: "https://www.studyit.org.nz", subject: "Mixed", source: "StudyIt" },
      { title: "Khan Academy — Algebra 1", description: "Maps cleanly to NCEA L1 algebra standards.", url: "https://www.khanacademy.org/math/algebra", subject: "Maths", source: "Khan Academy" },
      { title: "Khan Academy — Biology", description: "Cells, genetics, ecology — L1 Biology.", url: "https://www.khanacademy.org/science/biology", subject: "Biology", source: "Khan Academy" },
      { title: "English Online — Ministry of Education", description: "Free resources for L1 English standards.", url: "https://english.tki.org.nz", subject: "English", source: "Ministry of Education" },
    ],
  },
  {
    label: "Year 12 · NCEA Level 2",
    yearLevels: [12],
    ncea: 2,
    resources: [
      { title: "NZQA — NCEA Level 2 Standards", description: "Official assessment specifications.", url: "https://www.nzqa.govt.nz/ncea/subjects/", subject: "All", source: "NZQA" },
      { title: "StudyIt — Level 2", description: "Subject-by-subject past papers and tips.", url: "https://www.studyit.org.nz", subject: "Mixed", source: "StudyIt" },
      { title: "Khan Academy — Algebra 2 & Trig", description: "L2 maths bridging into L3 calculus.", url: "https://www.khanacademy.org/math/algebra2", subject: "Maths", source: "Khan Academy" },
      { title: "Khan Academy — Chemistry", description: "L2 Chemistry — bonding, reactions, organic intro.", url: "https://www.khanacademy.org/science/chemistry", subject: "Chemistry", source: "Khan Academy" },
      { title: "Crash Course Literature", description: "Useful for English unfamiliar texts.", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtOeEc9ME62zTfqc0h6Pe8vb", subject: "English", source: "Crash Course" },
    ],
  },
  {
    label: "Year 13 · NCEA Level 3 & UE",
    yearLevels: [13],
    ncea: 3,
    resources: [
      { title: "NZQA — NCEA Level 3 & UE", description: "Standards plus University Entrance requirements.", url: "https://www.nzqa.govt.nz/qualifications-standards/awards/university-entrance/", subject: "All", source: "NZQA" },
      { title: "StudyIt — Level 3", description: "Exemplars, past papers, study planning.", url: "https://www.studyit.org.nz", subject: "Mixed", source: "StudyIt" },
      { title: "Khan Academy — Calculus", description: "L3 Calculus — limits, derivatives, integrals.", url: "https://www.khanacademy.org/math/calculus-1", subject: "Maths", source: "Khan Academy" },
      { title: "Khan Academy — Physics", description: "Mechanics, waves, electromagnetism for L3.", url: "https://www.khanacademy.org/science/physics", subject: "Physics", source: "Khan Academy" },
      { title: "MIT OpenCourseWare", description: "Stretch material for UE-bound students.", url: "https://ocw.mit.edu", subject: "Mixed", source: "MIT OCW" },
    ],
  },
];

export const getBandForYear = (yearLevel: number | null): YearBand | null => {
  if (yearLevel == null) return null;
  return CURRICULUM_BANDS.find((b) => b.yearLevels.includes(yearLevel)) ?? null;
};
