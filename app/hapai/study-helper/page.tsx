import type { Metadata } from "next";
import { StudyHelperTool } from "./StudyHelperTool";

export const metadata: Metadata = {
  title: "Study Helper — assembl",
  description:
    "A shareable HAPAI study desk for NZ students: photo notes, essay plans, recall quizzes, and calm 20-minute study sprints.",
  openGraph: {
    title: "Study Helper — assembl",
    description:
      "Turn notes, teacher prompts, and rough ideas into a study plan, essay spine, quote checklist, and practice sprint.",
    type: "website",
    url: "https://www.assembl.co.nz/hapai/study-helper",
    siteName: "assembl",
    images: [{ url: "https://www.assembl.co.nz/hapai/study-helper/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Helper — assembl",
    description: "A calm study coach for NZ students and parents, starting with novel study essays.",
  },
};

export default function StudyHelperPage() {
  return <StudyHelperTool />;
}
