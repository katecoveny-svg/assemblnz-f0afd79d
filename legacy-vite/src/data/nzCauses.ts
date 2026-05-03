export interface NZCause {
  name: string;
  campaign: string;
  goal: string;
  raised: string;
  impactScore: number;
  beneficiaries: string;
  location: string;
  type: string;
  verified: boolean;
  slug: string;
  description: string;
  sdgs: number[];
  values: string[];
  lat: number;
  lng: number;
  region: string;
}

export const valueOptions = [
  "Youth Development", "Health Equity", "Education Access", "Community Wellbeing",
  "Environmental Sustainability", "Diversity & Inclusion", "Sport & Recreation",
  "Mental Health", "Food Security", "Innovation & STEM",
];

export const causeTypes = ["All", "Health", "Education", "Sport", "Community"];
export const locationOptions = ["All", "Auckland", "Wellington", "Christchurch", "Nationwide"];

export const nzCauses: NZCause[] = [
  {
    name: "Starship Foundation", campaign: "Support paediatric medical research", goal: "$20,000", raised: "$14,200",
    impactScore: 9.5, beneficiaries: "Children across New Zealand", location: "Auckland", type: "Health", verified: true,
    slug: "starship-foundation",
    description: "Starship Foundation funds life-saving paediatric research and equipment for Starship Children's Hospital.",
    sdgs: [3], values: ["Youth Development", "Health Equity", "Community Wellbeing"],
    lat: -36.8601, lng: 174.7668, region: "Auckland — Central",
  },
  {
    name: "Breast Cancer Foundation NZ", campaign: "Early detection programme expansion", goal: "$35,000", raised: "$28,400",
    impactScore: 9.2, beneficiaries: "Women nationwide", location: "Nationwide", type: "Health", verified: true,
    slug: "breast-cancer-foundation-nz",
    description: "Expanding early detection to reach underserved rural communities with mobile screening units.",
    sdgs: [3, 5], values: ["Health Equity", "Diversity & Inclusion", "Community Wellbeing"],
    lat: -36.8440, lng: 174.7680, region: "Auckland — Central",
  },
  {
    name: "Cancer Society of NZ", campaign: "Regional support centre funding", goal: "$50,000", raised: "$31,000",
    impactScore: 8.9, beneficiaries: "Cancer patients and families", location: "Wellington", type: "Health", verified: true,
    slug: "cancer-society-nz",
    description: "Building a new regional support centre in Wellington for cancer patients travelling for treatment.",
    sdgs: [3, 11], values: ["Health Equity", "Community Wellbeing", "Mental Health"],
    lat: -41.2865, lng: 174.7762, region: "Wellington",
  },
  {
    name: "Heart Foundation", campaign: "Heart health education in schools", goal: "$15,000", raised: "$9,800",
    impactScore: 8.8, beneficiaries: "School-age children", location: "Nationwide", type: "Education", verified: true,
    slug: "heart-foundation",
    description: "Teaching children about cardiovascular health through interactive workshops and fitness challenges.",
    sdgs: [3, 4], values: ["Youth Development", "Health Equity", "Education Access"],
    lat: -36.8520, lng: 174.7645, region: "Auckland — Central",
  },
  {
    name: "North Shore United FC", campaign: "Youth football development programme", goal: "$8,000", raised: "$3,200",
    impactScore: 7.6, beneficiaries: "Youth athletes aged 8-16", location: "Auckland", type: "Sport", verified: false,
    slug: "north-shore-united-fc",
    description: "Grassroots football programme for young athletes regardless of financial situation.",
    sdgs: [3, 10], values: ["Youth Development", "Sport & Recreation", "Diversity & Inclusion"],
    lat: -36.8000, lng: 174.7450, region: "Auckland — North Shore",
  },
  {
    name: "Ōtara Community Trust", campaign: "After-school tutoring programme", goal: "$12,000", raised: "$7,500",
    impactScore: 8.2, beneficiaries: "Students in South Auckland", location: "Auckland", type: "Education", verified: true,
    slug: "otara-community-trust",
    description: "Free after-school tutoring providing homework help, mentoring, and NCEA exam preparation.",
    sdgs: [4, 10], values: ["Education Access", "Youth Development", "Community Wellbeing", "Diversity & Inclusion"],
    lat: -36.9455, lng: 174.8796, region: "Auckland — South",
  },
  {
    name: "Christchurch School Foundation", campaign: "STEM lab equipment upgrade", goal: "$25,000", raised: "$11,300",
    impactScore: 7.9, beneficiaries: "Secondary school students", location: "Christchurch", type: "Education", verified: false,
    slug: "christchurch-school-foundation",
    description: "Upgrading STEM labs with 3D printers, robotics kits, and modern science apparatus.",
    sdgs: [4, 9], values: ["Education Access", "Innovation & STEM", "Youth Development"],
    lat: -43.5321, lng: 172.6362, region: "Christchurch",
  },
  {
    name: "KidsCan", campaign: "Winter essentials for children in need", goal: "$40,000", raised: "$36,800",
    impactScore: 9.0, beneficiaries: "Children in hardship", location: "Nationwide", type: "Community", verified: true,
    slug: "kidscan",
    description: "Providing winter coats, shoes, and food to children living in hardship across New Zealand.",
    sdgs: [1, 2, 10], values: ["Food Security", "Youth Development", "Community Wellbeing"],
    lat: -37.7870, lng: 175.2793, region: "Hamilton",
  },
];
