import type { Metadata } from "next";
import { KiwiSaverKidsCalculator } from "@/components/hapai/KiwiSaverKidsCalculator";

export const metadata: Metadata = {
  title: "KiwiSaver for Kids · assembl",
  description:
    "A free NZ calculator inspired by the 2026 KiwiSaver-for-newborns policy debate. See what $1,000 at birth compounds to by age 65, and what age-16+ contributions add on top. Built in Aotearoa.",
};

export default function KiwiSaverKidsPage() {
  return <KiwiSaverKidsCalculator />;
}
