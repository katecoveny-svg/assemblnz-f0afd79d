import type { Metadata } from "next";
import MeetingNotesPage from "../meeting-notes/page";

export const metadata: Metadata = {
  title: "Meeting recorder — assembl",
  description:
    "Record or paste meeting notes, then turn them into a structured draft record with decisions, action items, discussion, and next steps.",
  openGraph: {
    title: "Meeting recorder — assembl",
    description:
      "A HAPAI tool for turning meeting transcripts and rough notes into review-ready actions.",
    type: "website",
    url: "https://www.assembl.co.nz/hapai/meeting-recorder",
    siteName: "assembl",
  },
};

export default function MeetingRecorderPage() {
  return <MeetingNotesPage />;
}
