import type { Metadata } from "next";
import MeetingNotesPage from "../meeting-notes/page";

export const metadata: Metadata = {
  title: "Meeting recorder — assembl",
  description:
    "Record or paste meeting notes, then turn them into a structured draft record with decisions, action items, discussion, and next steps.",
  openGraph: {
    title: "Meeting recorder — assembl",
    description:
      "Turn a recording or rough notes into clear notes: decisions, action items, next steps. A free HAPAI tool.",
    type: "website",
    url: "https://www.assembl.co.nz/hapai/meeting-recorder",
    siteName: "assembl",
  },
};

export default function MeetingRecorderPage() {
  return <MeetingNotesPage />;
}
