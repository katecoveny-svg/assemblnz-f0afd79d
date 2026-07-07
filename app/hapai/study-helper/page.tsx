import type { Metadata } from "next";
import { StudyHelperTool } from "./StudyHelperTool";

export const metadata: Metadata = {
  title: "Study Helper — assembl",
  description:
    "A shareable SPARK tool for NZ students: upload notes or a teacher prompt and get an essay plan, quote checklist, recall quiz, or study sprint.",
  openGraph: {
    title: "Study Helper — assembl",
    description:
      "Turn notes, teacher prompts, and rough ideas into an essay plan, quote checklist, recall quiz, or practice sprint mapped to NZ Curriculum skills.",
    type: "website",
    url: "https://www.assembl.co.nz/hapai/study-helper",
    siteName: "assembl",
    images: [{ url: "https://www.assembl.co.nz/hapai/study-helper/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Helper — assembl",
    description: "Photo notes and teacher prompts in. Essay plans, quote checks, quizzes, and study sprints out.",
  },
};

export default function StudyHelperPage() {
  return <StudyHelperTool />;
}
