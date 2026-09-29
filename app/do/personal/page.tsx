import type { Metadata } from "next";
import { PersonalDo } from "./PersonalDo";
export const metadata: Metadata = {
  title: "Personal DO · assembl",
  description:
    "Keep the context. Prepare the next step. Review what needs you.",
  robots: { index: false, follow: false },
};
export default function PersonalDoPage() {
  return <PersonalDo />;
}
