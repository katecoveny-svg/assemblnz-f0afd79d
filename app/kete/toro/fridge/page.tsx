import type { Metadata } from "next";
import { FridgeToList } from "@/components/hapai/FridgeToList";

export const metadata: Metadata = {
  title: "Tōro kai planner — assembl",
  description: "Take a photo of the fridge and get a week-ready kai plan for your whānau.",
};

export default function ToroFridgePage() {
  return <FridgeToList context="toro" />;
}
